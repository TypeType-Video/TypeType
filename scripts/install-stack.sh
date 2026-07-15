#!/usr/bin/env bash
set -euo pipefail

REPO="TypeType-Video/TypeType"
REF="main"
INSTALL_DIR="${HOME}/typetype-stack"
START_STACK=1
SOURCE_DIR=""
BETA_STACK=0
AUTO_APPROVE=0
REF_SET=0
INSTALL_DIR_SET=0
ENV_FILE_CREATED=0

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
  --beta                Install the beta Compose stack only (default ref: dev)
  --yes                 Start Docker automatically without prompts
  --download-only       Download/update files only, do not start Docker
  --source-dir <path>   Copy files from a local repo path (advanced)
  -h, --help            Show this help

Safety:
  This installer prompts by default. Use --yes for automatic startup.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref)
      REF="$2"
      REF_SET=1
      shift 2
      ;;
    --dir)
      INSTALL_DIR="$2"
      INSTALL_DIR_SET=1
      shift 2
      ;;
    --beta)
      BETA_STACK=1
      shift
      ;;
    --yes)
      AUTO_APPROVE=1
      shift
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

if [[ ${BETA_STACK} -eq 1 && ${REF_SET} -eq 0 ]]; then
  REF="dev"
fi

if [[ ${BETA_STACK} -eq 1 && ${INSTALL_DIR_SET} -eq 0 ]]; then
  INSTALL_DIR="${HOME}/typetype-beta-stack"
fi

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

existing_stack_port() {
  local key="$1"
  local service
  local target_port
  local working_dir
  local container
  local published_port

  case "${key}" in
    HOST_PORT_WEB|HOST_PORT_WEB_BETA)
      service="typetype"
      target_port="80"
      ;;
    HOST_PORT_SERVER|HOST_PORT_SERVER_BETA)
      service="typetype-server"
      target_port="8080"
      ;;
    HOST_PORT_TOKEN|HOST_PORT_TOKEN_BETA)
      service="typetype-token"
      target_port="8081"
      ;;
    HOST_PORT_GARAGE_S3|HOST_PORT_GARAGE_S3_BETA)
      service="garage"
      target_port="3900"
      ;;
    HOST_PORT_DOWNLOADER_BETA)
      service="typetype-downloader"
      target_port="18093"
      ;;
    *)
      return 1
      ;;
  esac

  working_dir="$(cd "${INSTALL_DIR}" && pwd)"
  container="$(
    docker ps -a -q \
      --filter "label=com.docker.compose.project.working_dir=${working_dir}" \
      --filter "label=com.docker.compose.service=${service}" \
      | head -n 1
  )"
  [[ -n "${container}" ]] || return 1

  published_port="$(docker port "${container}" "${target_port}/tcp" 2>/dev/null | head -n 1 | awk -F: '{print $NF}')"
  is_valid_port "${published_port}" || return 1
  echo "${published_port}"
}

is_arm64_host() {
  case "$(uname -m)" in
    aarch64|arm64) return 0 ;;
    *) return 1 ;;
  esac
}

compose_command_hint() {
  local command="$1"
  local args="-f ${COMPOSE_NAME}"
  if [[ ${USE_ARM64_OVERRIDE} -eq 1 ]]; then
    args="${args} -f docker-compose.arm64.yml"
  fi
  printf 'docker compose %s --env-file .env %s' "${args}" "${command}"
}

choose_stack_port() {
  local env_file="$1"
  local key="$2"
  local fallback="$3"
  local label="$4"
  local configured
  local existing
  configured="$(get_env_var "${env_file}" "${key}")"
  if is_valid_port "${configured}" && [[ ${ENV_FILE_CREATED} -eq 0 ]]; then
    echo "${configured}"
    return
  fi
  if [[ ${ENV_FILE_CREATED} -eq 0 ]] && existing="$(existing_stack_port "${key}")"; then
    set_env_var "${env_file}" "${key}" "${existing}"
    echo "[install] Preserving existing ${label} port ${existing}." >&2
    echo "${existing}"
    return
  fi
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
if [[ ${AUTO_APPROVE} -eq 0 ]]; then
  require_tty
fi

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

if [[ ${BETA_STACK} -eq 1 ]]; then
  COMPOSE_SOURCE="docker-compose.dev.yml"
  COMPOSE_NAME="docker-compose.dev.yml"
else
  COMPOSE_SOURCE="docker-compose.yml"
  COMPOSE_NAME="docker-compose.yml"
fi
COMPOSE_FILE="${INSTALL_DIR}/${COMPOSE_NAME}"
ARM64_COMPOSE_FILE="${INSTALL_DIR}/docker-compose.arm64.yml"
USE_ARM64_OVERRIDE=0

fetch_file "${COMPOSE_SOURCE}" "${COMPOSE_FILE}"
fetch_file "docker-compose.arm64.yml" "${ARM64_COMPOSE_FILE}"
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

COMPOSE_ARGS=(-f "${COMPOSE_FILE}")
COMPOSE_OVERRIDE_FILE=""
if is_arm64_host; then
  USE_ARM64_OVERRIDE=1
  COMPOSE_OVERRIDE_FILE="${ARM64_COMPOSE_FILE}"
  COMPOSE_ARGS+=(-f "${COMPOSE_OVERRIDE_FILE}")
  echo "[install] ARM64 host detected, using Redis cache override."
fi

if [[ ! -f "${INSTALL_DIR}/.env" ]]; then
  cp "${INSTALL_DIR}/.env.example" "${INSTALL_DIR}/.env"
  ENV_FILE_CREATED=1
  echo "[install] Created ${INSTALL_DIR}/.env from .env.example"
fi

ensure_random_downloader_keys "${INSTALL_DIR}/.env"
ensure_youtube_remote_login_env "${INSTALL_DIR}/.env"
"${INSTALL_DIR}/scripts/bootstrap-env.sh"

if [[ ${BETA_STACK} -eq 1 ]]; then
  HOST_PORT_SERVER_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_SERVER_BETA" "18080" "beta API")"
  HOST_PORT_TOKEN_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_TOKEN_BETA" "18081" "beta token")"
  HOST_PORT_WEB_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_WEB_BETA" "18082" "beta frontend")"
  HOST_PORT_GARAGE_S3_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_GARAGE_S3_BETA" "3900" "beta Garage S3")"
  choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_DOWNLOADER_BETA" "19093" "beta downloader" >/dev/null
else
  HOST_PORT_SERVER_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_SERVER" "8080" "API")"
  HOST_PORT_TOKEN_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_TOKEN" "8081" "token")"
  HOST_PORT_WEB_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_WEB" "8082" "frontend")"
  HOST_PORT_GARAGE_S3_RESOLVED="$(choose_stack_port "${INSTALL_DIR}/.env" "HOST_PORT_GARAGE_S3" "3900" "Garage S3")"
fi
set_env_var "${INSTALL_DIR}/.env" "DOWNLOADER_S3_PUBLIC_ENDPOINT" "http://localhost:${HOST_PORT_GARAGE_S3_RESOLVED}"

current_origins="$(grep '^ALLOWED_ORIGINS=' "${INSTALL_DIR}/.env" | cut -d= -f2- || true)"
legacy_origins="http://localhost:${HOST_PORT_WEB_RESOLVED},http://localhost:5173"
packaged_origins="http://localhost:8082,http://localhost:5173"
packaged_current_origins="http://localhost:8082,http://127.0.0.1:8082,http://localhost:5173,http://127.0.0.1:5173"
generated_origins="http://localhost:${HOST_PORT_WEB_RESOLVED},http://127.0.0.1:${HOST_PORT_WEB_RESOLVED},http://localhost:5173,http://127.0.0.1:5173"
beta_packaged_origins="http://localhost:18082,http://127.0.0.1:18082,http://localhost:5173,http://127.0.0.1:5173"
if [[ -z "${current_origins}" || "${current_origins}" == "${packaged_origins}" || "${current_origins}" == "${packaged_current_origins}" || "${current_origins}" == "${legacy_origins}" || "${current_origins}" == "${beta_packaged_origins}" ]]; then
  default_origins="${generated_origins}"
else
  default_origins="${current_origins}"
fi
if [[ ${AUTO_APPROVE} -eq 1 ]]; then
  input_origins="${default_origins}"
else
  prompt_tty input_origins "ALLOWED_ORIGINS" "${default_origins}"
fi
if grep -q '^ALLOWED_ORIGINS=' "${INSTALL_DIR}/.env"; then
  sed -i "s|^ALLOWED_ORIGINS=.*$|ALLOWED_ORIGINS=${input_origins}|" "${INSTALL_DIR}/.env"
else
  printf '\nALLOWED_ORIGINS=%s\n' "${input_origins}" >> "${INSTALL_DIR}/.env"
fi

if [[ ${START_STACK} -eq 0 ]]; then
  echo "[install] Download-only complete."
  echo "[install] Next step: cd ${INSTALL_DIR} && $(compose_command_hint 'up -d')"
  exit 0
fi

if [[ ${AUTO_APPROVE} -eq 0 ]] && ! confirm_tty "Proceed with Docker pull + startup in ${INSTALL_DIR}?"; then
  echo "[install] Stack files are ready in ${INSTALL_DIR}."
  echo "[install] Docker startup skipped."
  echo "[install] Next step: cd ${INSTALL_DIR} && $(compose_command_hint 'up -d')"
  exit 0
fi

echo "[install] Pulling Docker images..."
docker compose "${COMPOSE_ARGS[@]}" --env-file "${INSTALL_DIR}/.env" pull

echo "[install] Starting stack..."
docker compose "${COMPOSE_ARGS[@]}" --env-file "${INSTALL_DIR}/.env" up -d --wait --wait-timeout 180

echo "[install] Bootstrapping Garage..."
(
  cd "${INSTALL_DIR}"
  COMPOSE_FILE="${COMPOSE_FILE}" COMPOSE_OVERRIDE_FILE="${COMPOSE_OVERRIDE_FILE}" ./scripts/bootstrap-garage.sh
)

echo "[install] Service status:"
docker compose "${COMPOSE_ARGS[@]}" --env-file "${INSTALL_DIR}/.env" ps

echo
echo "Done. Open http://localhost:${HOST_PORT_WEB_RESOLVED}"
echo "Install directory: ${INSTALL_DIR}"
