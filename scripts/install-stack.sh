#!/usr/bin/env bash
set -euo pipefail

REPO="Priveetee/TypeType"
REF="main"
INSTALL_DIR="${HOME}/typetype-stack"
START_STACK=1
SOURCE_DIR=""

DEFAULT_DOWNLOADER_S3_ACCESS_KEY="SET_ME_ACCESS_KEY"
DEFAULT_DOWNLOADER_S3_SECRET_KEY="SET_ME_SECRET_KEY"
DEFAULT_YOUTUBE_REMOTE_LOGIN_ENABLED="false"
DEFAULT_YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN="http://typetype-server:8080"
DEFAULT_YOUTUBE_REMOTE_LOGIN_TTL_MS="480000"
DEFAULT_YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS="2"
DEFAULT_YOUTUBE_REMOTE_LOGIN_FRAME_FPS="10"
DEFAULT_YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES="524288"
PLACEHOLDER_YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN="SET_ME_SHARED_SECRET"

usage() {
  cat <<'EOF'
TypeType one-line installer (end-user friendly)

Usage:
  bash install-stack.sh [options]

Options:
  --ref <git-ref>       Git ref to download (default: main)
  --dir <path>          Install directory (default: ~/typetype-stack)
  --download-only       Download/update files only, do not start Docker
  --source-dir <path>   Copy files from a local repo path (advanced)
  -h, --help            Show this help

Safety:
  This installer is intentionally interactive (prompts + confirmations).
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref)
      REF="$2"
      shift 2
      ;;
    --dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --download-only)
      START_STACK=0
      shift
      ;;
    --source-dir)
      SOURCE_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[install] Missing required command: $1" >&2
    if [[ "$1" == "docker" ]]; then
      echo "[install] Please install Docker + Docker Compose first." >&2
      echo "[install] Quick install (Debian/Ubuntu):" >&2
      echo "[install]   curl -fsSL https://get.docker.com -o get-docker.sh" >&2
      echo "[install]   sudo sh get-docker.sh" >&2
      echo "[install]   sudo usermod -aG docker \$USER" >&2
      echo "[install]   newgrp docker" >&2
      echo "[install] Docs: https://docs.docker.com/get-docker/" >&2
    fi
    exit 1
  fi
}

require_tty() {
  if [[ ! -r /dev/tty ]]; then
    echo "[install] Interactive mode requires a terminal (/dev/tty)." >&2
    echo "[install] Download the script first and run it directly:" >&2
    echo "[install]   curl -fsSL https://raw.githubusercontent.com/${REPO}/${REF}/scripts/install-stack.sh -o install-stack.sh" >&2
    echo "[install]   bash install-stack.sh" >&2
    exit 1
  fi
}

prompt_tty() {
  local out_var="$1"
  local label="$2"
  local default_value="$3"
  local value=""

  read -r -p "${label} [${default_value}]: " value < /dev/tty
  if [[ -z "${value}" ]]; then
    value="${default_value}"
  fi
  printf -v "${out_var}" '%s' "${value}"
}

confirm_tty() {
  local label="$1"
  local answer=""
  read -r -p "${label} [y/N]: " answer < /dev/tty
  [[ "${answer}" =~ ^[Yy]$ ]]
}

generate_hex() {
  local bytes="$1"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "${bytes}"
    return
  fi

  python3 - "${bytes}" <<'PY'
import secrets
import sys

print(secrets.token_hex(int(sys.argv[1])))
PY
}

generate_downloader_access_key() {
  printf 'GK%s' "$(generate_hex 12)"
}

generate_downloader_secret_key() {
  generate_hex 32
}

generate_youtube_remote_login_token() {
  generate_hex 32
}

set_env_var() {
  local env_file="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "${env_file}"; then
    sed -i "s|^${key}=.*$|${key}=${value}|" "${env_file}"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${env_file}"
  fi
}

ensure_random_downloader_keys() {
  local env_file="$1"
  local current_access_key
  local current_secret_key
  local generated=0

  current_access_key="$(grep '^DOWNLOADER_S3_ACCESS_KEY=' "${env_file}" | cut -d= -f2- || true)"
  current_secret_key="$(grep '^DOWNLOADER_S3_SECRET_KEY=' "${env_file}" | cut -d= -f2- || true)"

  if [[ -z "${current_access_key}" || "${current_access_key}" == "${DEFAULT_DOWNLOADER_S3_ACCESS_KEY}" ]]; then
    set_env_var "${env_file}" "DOWNLOADER_S3_ACCESS_KEY" "$(generate_downloader_access_key)"
    generated=1
  fi

  if [[ -z "${current_secret_key}" || "${current_secret_key}" == "${DEFAULT_DOWNLOADER_S3_SECRET_KEY}" ]]; then
    set_env_var "${env_file}" "DOWNLOADER_S3_SECRET_KEY" "$(generate_downloader_secret_key)"
    generated=1
  fi

  if [[ ${generated} -eq 1 ]]; then
    echo "[install] Generated unique downloader S3 credentials in ${env_file}"
  fi
}

ensure_env_default() {
  local env_file="$1"
  local key="$2"
  local value="$3"
  local current

  current="$(get_env_var "${env_file}" "${key}")"
  if [[ -z "${current}" ]]; then
    set_env_var "${env_file}" "${key}" "${value}"
  fi
}

ensure_youtube_remote_login_env() {
  local env_file="$1"
  local current_token

  ensure_env_default "${env_file}" "YOUTUBE_REMOTE_LOGIN_ENABLED" "${DEFAULT_YOUTUBE_REMOTE_LOGIN_ENABLED}"
  ensure_env_default "${env_file}" "YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN" "${DEFAULT_YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN}"
  ensure_env_default "${env_file}" "YOUTUBE_REMOTE_LOGIN_TTL_MS" "${DEFAULT_YOUTUBE_REMOTE_LOGIN_TTL_MS}"
  ensure_env_default "${env_file}" "YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS" "${DEFAULT_YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS}"
  ensure_env_default "${env_file}" "YOUTUBE_REMOTE_LOGIN_FRAME_FPS" "${DEFAULT_YOUTUBE_REMOTE_LOGIN_FRAME_FPS}"
  ensure_env_default "${env_file}" "YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES" "${DEFAULT_YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES}"

  current_token="$(get_env_var "${env_file}" "YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN")"
  if [[ -z "${current_token}" || "${current_token}" == "${PLACEHOLDER_YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN}" ]]; then
    set_env_var "${env_file}" "YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN" "$(generate_youtube_remote_login_token)"
    echo "[install] Generated internal YouTube remote login token in ${env_file}"
  fi
}

require_free_port() {
  local port="$1"
  python3 - <<PY
import socket, sys
port = int(${port})
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.bind(("0.0.0.0", port))
except OSError:
    sys.exit(1)
finally:
    s.close()
sys.exit(0)
PY
}

get_env_var() {
  local env_file="$1"
  local key="$2"
  grep "^${key}=" "${env_file}" | cut -d= -f2- || true
}

is_valid_port() {
  local port="$1"
  [[ "${port}" =~ ^[0-9]+$ ]] || return 1
  ((port >= 1 && port <= 65535))
}

find_random_free_port() {
  python3 - <<'PY'
import random
import socket

for _ in range(500):
    port = random.randint(20000, 60999)
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("0.0.0.0", port))
    except OSError:
        continue
    finally:
        s.close()
    print(port)
    break
else:
    raise SystemExit("no free port found")
PY
}

choose_stack_port() {
  local env_file="$1"
  local key="$2"
  local fallback="$3"
  local label="$4"
  local configured
  configured="$(get_env_var "${env_file}" "${key}")"
  if ! is_valid_port "${configured}"; then
    configured="${fallback}"
  fi
  if require_free_port "${configured}"; then
    set_env_var "${env_file}" "${key}" "${configured}"
    echo "${configured}"
    return
  fi
  local random_port
  random_port="$(find_random_free_port)"
  set_env_var "${env_file}" "${key}" "${random_port}"
  echo "[install] ${label} port ${configured} is in use, using ${random_port} instead." >&2
  echo "${random_port}"
}

fetch_file() {
  local relative_path="$1"
  local out_path="$2"

  mkdir -p "$(dirname "${out_path}")"

  if [[ -n "${SOURCE_DIR}" ]]; then
    cp "${SOURCE_DIR}/${relative_path}" "${out_path}"
  else
    local base_url="https://raw.githubusercontent.com/${REPO}/${REF}"
    curl -fsSL "${base_url}/${relative_path}" -o "${out_path}"
  fi
}

need_cmd curl
need_cmd docker
require_tty

if ! docker compose version >/dev/null 2>&1; then
  echo "[install] docker compose is required (Docker Compose v2)." >&2
  echo "[install] Please install Docker Desktop / Docker Engine with Compose plugin." >&2
  echo "[install] Quick install (Debian/Ubuntu):" >&2
  echo "[install]   curl -fsSL https://get.docker.com -o get-docker.sh" >&2
  echo "[install]   sudo sh get-docker.sh" >&2
  echo "[install]   sudo usermod -aG docker \$USER" >&2
  echo "[install]   newgrp docker" >&2
  echo "[install] Docs: https://docs.docker.com/compose/install/" >&2
  exit 1
fi

INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"
mkdir -p "${INSTALL_DIR}"

echo "[install] Installing TypeType stack files into: ${INSTALL_DIR}"

fetch_file "docker-compose.yml" "${INSTALL_DIR}/docker-compose.yml"
fetch_file "nginx.conf" "${INSTALL_DIR}/nginx.conf"
fetch_file "garage.toml" "${INSTALL_DIR}/garage.toml"
fetch_file ".env.example" "${INSTALL_DIR}/.env.example"
fetch_file "scripts/install-stack.sh" "${INSTALL_DIR}/scripts/install-stack.sh"
fetch_file "scripts/bootstrap-env.sh" "${INSTALL_DIR}/scripts/bootstrap-env.sh"
fetch_file "scripts/bootstrap-garage.sh" "${INSTALL_DIR}/scripts/bootstrap-garage.sh"
fetch_file "scripts/setup-stack.sh" "${INSTALL_DIR}/scripts/setup-stack.sh"

chmod +x "${INSTALL_DIR}/scripts/install-stack.sh"
chmod +x "${INSTALL_DIR}/scripts/bootstrap-env.sh"
chmod +x "${INSTALL_DIR}/scripts/bootstrap-garage.sh"
chmod +x "${INSTALL_DIR}/scripts/setup-stack.sh"

if [[ ! -f "${INSTALL_DIR}/.env" ]]; then
  cp "${INSTALL_DIR}/.env.example" "${INSTALL_DIR}/.env"
  echo "[install] Created ${INSTALL_DIR}/.env from .env.example"
fi

ensure_random_downloader_keys "${INSTALL_DIR}/.env"
ensure_youtube_remote_login_env "${INSTALL_DIR}/.env"
"${INSTALL_DIR}/scripts/bootstrap-env.sh"

HOST_PORT_SERVER_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_SERVER" "8080" "API")"
HOST_PORT_TOKEN_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_TOKEN" "8081" "token")"
HOST_PORT_WEB_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_WEB" "8082" "frontend")"
HOST_PORT_GARAGE_S3_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_GARAGE_S3" "3900" "Garage S3")"
set_env_var "${INSTALL_DIR}/.env" "DOWNLOADER_S3_PUBLIC_ENDPOINT" "http://localhost:${HOST_PORT_GARAGE_S3_RESOLVED}"

current_origins="$(grep '^ALLOWED_ORIGINS=' "${INSTALL_DIR}/.env" | cut -d= -f2- || true)"
legacy_origins="http://localhost:${HOST_PORT_WEB_RESOLVED},http://localhost:5173"
packaged_origins="http://localhost:8082,http://localhost:5173"
packaged_current_origins="http://localhost:8082,http://127.0.0.1:8082,http://localhost:5173,http://127.0.0.1:5173"
generated_origins="http://localhost:${HOST_PORT_WEB_RESOLVED},http://127.0.0.1:${HOST_PORT_WEB_RESOLVED},http://localhost:5173,http://127.0.0.1:5173"
if [[ -z "${current_origins}" || "${current_origins}" == "${packaged_origins}" || "${current_origins}" == "${packaged_current_origins}" || "${current_origins}" == "${legacy_origins}" ]]; then
  default_origins="${generated_origins}"
else
  default_origins="${current_origins}"
fi
prompt_tty input_origins "ALLOWED_ORIGINS" "${default_origins}"
if grep -q '^ALLOWED_ORIGINS=' "${INSTALL_DIR}/.env"; then
  sed -i "s|^ALLOWED_ORIGINS=.*$|ALLOWED_ORIGINS=${input_origins}|" "${INSTALL_DIR}/.env"
else
  printf '\nALLOWED_ORIGINS=%s\n' "${input_origins}" >> "${INSTALL_DIR}/.env"
fi

if [[ ${START_STACK} -eq 0 ]]; then
  echo "[install] Download-only complete."
  echo "[install] Next step: cd ${INSTALL_DIR} && ./scripts/setup-stack.sh"
  exit 0
fi

if ! confirm_tty "Proceed with Docker pull + startup in ${INSTALL_DIR}?"; then
  echo "[install] Stack files are ready in ${INSTALL_DIR}."
  echo "[install] Docker startup skipped."
  echo "[install] Next step: cd ${INSTALL_DIR} && ./scripts/setup-stack.sh"
  exit 0
fi

echo "[install] Pulling Docker images..."
docker compose -f "${INSTALL_DIR}/docker-compose.yml" --env-file "${INSTALL_DIR}/.env" pull

echo "[install] Starting stack..."
docker compose -f "${INSTALL_DIR}/docker-compose.yml" --env-file "${INSTALL_DIR}/.env" up -d

echo "[install] Bootstrapping Garage..."
(
  cd "${INSTALL_DIR}"
  ./scripts/bootstrap-garage.sh
)

echo "[install] Service status:"
docker compose -f "${INSTALL_DIR}/docker-compose.yml" --env-file "${INSTALL_DIR}/.env" ps

echo
echo "Done. Open http://localhost:${HOST_PORT_WEB_RESOLVED}"
echo "Install directory: ${INSTALL_DIR}"
