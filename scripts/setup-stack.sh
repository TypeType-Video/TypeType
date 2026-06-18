#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

DEFAULT_ALLOWED_ORIGINS="http://localhost:8082,http://127.0.0.1:8082,http://localhost:5173,http://127.0.0.1:5173"
DEFAULT_HOST_PORT_WEB="8082"
DEFAULT_HOST_PORT_SERVER="8080"
DEFAULT_HOST_PORT_TOKEN="8081"
DEFAULT_HOST_PORT_GARAGE_S3="3900"
DEFAULT_DATABASE_URL="jdbc:postgresql://postgres:5432/typetype"
DEFAULT_DATABASE_USER="typetype"
DEFAULT_DATABASE_PASSWORD="typetype"
DEFAULT_DRAGONFLY_URL="redis://dragonfly:6379"
DEFAULT_GITHUB_REPO="Priveetee/TypeType-Server"
DEFAULT_GITHUB_ISSUE_TEMPLATE="bug_report_backend.md"
DEFAULT_DOWNLOADER_S3_ACCESS_KEY=""
DEFAULT_DOWNLOADER_S3_SECRET_KEY=""
DEFAULT_YOUTUBE_REMOTE_LOGIN_ENABLED="false"
DEFAULT_YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN="http://typetype-server:8080"
DEFAULT_YOUTUBE_REMOTE_LOGIN_TTL_MS="480000"
DEFAULT_YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS="2"
DEFAULT_YOUTUBE_REMOTE_LOGIN_FRAME_FPS="10"
DEFAULT_YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES="524288"
PLACEHOLDER_YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN="SET_ME_SHARED_SECRET"

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

ensure_generated_secrets() {
  if [[ -z "${DEFAULT_DOWNLOADER_S3_ACCESS_KEY}" ]]; then
    DEFAULT_DOWNLOADER_S3_ACCESS_KEY="$(generate_downloader_access_key)"
  fi
  if [[ -z "${DEFAULT_DOWNLOADER_S3_SECRET_KEY}" ]]; then
    DEFAULT_DOWNLOADER_S3_SECRET_KEY="$(generate_downloader_secret_key)"
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
    echo "[setup] Generated internal YouTube remote login token in ${env_file}"
  fi
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
  echo "[setup] ${label} port ${configured} is in use, using ${random_port} instead." >&2
  echo "${random_port}"
}

prompt_value() {
  local out_var="$1"
  local label="$2"
  local default_value="$3"
  local value=""

  read -r -p "${label} [${default_value}]: " value
  if [[ -z "${value}" ]]; then
    value="${default_value}"
  fi
  printf -v "${out_var}" '%s' "${value}"
}

echo "TypeType interactive setup"
echo

ensure_generated_secrets

if [[ -f "${ENV_FILE}" ]]; then
  read -r -p ".env already exists. Overwrite it? [y/N]: " overwrite
  if [[ ! "${overwrite}" =~ ^[Yy]$ ]]; then
    echo "Keeping existing .env"
  else
    echo "Rebuilding .env with prompted values..."
    prompt_value ALLOWED_ORIGINS "ALLOWED_ORIGINS" "${DEFAULT_ALLOWED_ORIGINS}"
    prompt_value HOST_PORT_WEB "HOST_PORT_WEB" "${DEFAULT_HOST_PORT_WEB}"
    prompt_value HOST_PORT_SERVER "HOST_PORT_SERVER" "${DEFAULT_HOST_PORT_SERVER}"
    prompt_value HOST_PORT_TOKEN "HOST_PORT_TOKEN" "${DEFAULT_HOST_PORT_TOKEN}"
    prompt_value DATABASE_URL "DATABASE_URL" "${DEFAULT_DATABASE_URL}"
    prompt_value DATABASE_USER "DATABASE_USER" "${DEFAULT_DATABASE_USER}"
    prompt_value DATABASE_PASSWORD "DATABASE_PASSWORD" "${DEFAULT_DATABASE_PASSWORD}"
    prompt_value DRAGONFLY_URL "DRAGONFLY_URL" "${DEFAULT_DRAGONFLY_URL}"
    prompt_value GITHUB_REPO "GITHUB_REPO" "${DEFAULT_GITHUB_REPO}"
    prompt_value GITHUB_ISSUE_TEMPLATE "GITHUB_ISSUE_TEMPLATE" "${DEFAULT_GITHUB_ISSUE_TEMPLATE}"
    prompt_value DOWNLOADER_S3_ACCESS_KEY "DOWNLOADER_S3_ACCESS_KEY" "${DEFAULT_DOWNLOADER_S3_ACCESS_KEY}"
    prompt_value DOWNLOADER_S3_SECRET_KEY "DOWNLOADER_S3_SECRET_KEY" "${DEFAULT_DOWNLOADER_S3_SECRET_KEY}"

    cat > "${ENV_FILE}" <<EOF
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
HOST_PORT_WEB=${HOST_PORT_WEB}
HOST_PORT_SERVER=${HOST_PORT_SERVER}
HOST_PORT_TOKEN=${HOST_PORT_TOKEN}
DATABASE_URL=${DATABASE_URL}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DRAGONFLY_URL=${DRAGONFLY_URL}
GITHUB_REPO=${GITHUB_REPO}
GITHUB_ISSUE_TEMPLATE=${GITHUB_ISSUE_TEMPLATE}
DOWNLOADER_S3_ACCESS_KEY=${DOWNLOADER_S3_ACCESS_KEY}
DOWNLOADER_S3_SECRET_KEY=${DOWNLOADER_S3_SECRET_KEY}
EOF
  fi
else
  echo "No .env found. Let's create one."
  prompt_value ALLOWED_ORIGINS "ALLOWED_ORIGINS" "${DEFAULT_ALLOWED_ORIGINS}"
  prompt_value HOST_PORT_WEB "HOST_PORT_WEB" "${DEFAULT_HOST_PORT_WEB}"
  prompt_value HOST_PORT_SERVER "HOST_PORT_SERVER" "${DEFAULT_HOST_PORT_SERVER}"
  prompt_value HOST_PORT_TOKEN "HOST_PORT_TOKEN" "${DEFAULT_HOST_PORT_TOKEN}"
  prompt_value DATABASE_URL "DATABASE_URL" "${DEFAULT_DATABASE_URL}"
  prompt_value DATABASE_USER "DATABASE_USER" "${DEFAULT_DATABASE_USER}"
  prompt_value DATABASE_PASSWORD "DATABASE_PASSWORD" "${DEFAULT_DATABASE_PASSWORD}"
  prompt_value DRAGONFLY_URL "DRAGONFLY_URL" "${DEFAULT_DRAGONFLY_URL}"
  prompt_value GITHUB_REPO "GITHUB_REPO" "${DEFAULT_GITHUB_REPO}"
  prompt_value GITHUB_ISSUE_TEMPLATE "GITHUB_ISSUE_TEMPLATE" "${DEFAULT_GITHUB_ISSUE_TEMPLATE}"
  prompt_value DOWNLOADER_S3_ACCESS_KEY "DOWNLOADER_S3_ACCESS_KEY" "${DEFAULT_DOWNLOADER_S3_ACCESS_KEY}"
  prompt_value DOWNLOADER_S3_SECRET_KEY "DOWNLOADER_S3_SECRET_KEY" "${DEFAULT_DOWNLOADER_S3_SECRET_KEY}"

  cat > "${ENV_FILE}" <<EOF
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
HOST_PORT_WEB=${HOST_PORT_WEB}
HOST_PORT_SERVER=${HOST_PORT_SERVER}
HOST_PORT_TOKEN=${HOST_PORT_TOKEN}
DATABASE_URL=${DATABASE_URL}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DRAGONFLY_URL=${DRAGONFLY_URL}
GITHUB_REPO=${GITHUB_REPO}
GITHUB_ISSUE_TEMPLATE=${GITHUB_ISSUE_TEMPLATE}
DOWNLOADER_S3_ACCESS_KEY=${DOWNLOADER_S3_ACCESS_KEY}
DOWNLOADER_S3_SECRET_KEY=${DOWNLOADER_S3_SECRET_KEY}
EOF
fi

cd "${ROOT_DIR}"

ensure_youtube_remote_login_env "${ENV_FILE}"

HOST_PORT_SERVER_RESOLVED="$(choose_stack_port "${ENV_FILE}" "HOST_PORT_SERVER" "${DEFAULT_HOST_PORT_SERVER}" "API")"
HOST_PORT_TOKEN_RESOLVED="$(choose_stack_port "${ENV_FILE}" "HOST_PORT_TOKEN" "${DEFAULT_HOST_PORT_TOKEN}" "token")"
HOST_PORT_WEB_RESOLVED="$(choose_stack_port "${ENV_FILE}" "HOST_PORT_WEB" "${DEFAULT_HOST_PORT_WEB}" "frontend")"
HOST_PORT_GARAGE_S3_RESOLVED="$(choose_stack_port "${ENV_FILE}" "HOST_PORT_GARAGE_S3" "${DEFAULT_HOST_PORT_GARAGE_S3}" "Garage S3")"
set_env_var "${ENV_FILE}" "DOWNLOADER_S3_PUBLIC_ENDPOINT" "http://localhost:${HOST_PORT_GARAGE_S3_RESOLVED}"

CURRENT_ALLOWED_ORIGINS="$(get_env_var "${ENV_FILE}" "ALLOWED_ORIGINS")"
LEGACY_ALLOWED_ORIGINS="http://localhost:${HOST_PORT_WEB_RESOLVED},http://localhost:5173"
PACKAGED_ALLOWED_ORIGINS="http://localhost:8082,http://localhost:5173"
GENERATED_ALLOWED_ORIGINS="http://localhost:${HOST_PORT_WEB_RESOLVED},http://127.0.0.1:${HOST_PORT_WEB_RESOLVED},http://localhost:5173,http://127.0.0.1:5173"
if [[ -z "${CURRENT_ALLOWED_ORIGINS}" || "${CURRENT_ALLOWED_ORIGINS}" == "${PACKAGED_ALLOWED_ORIGINS}" || "${CURRENT_ALLOWED_ORIGINS}" == "${DEFAULT_ALLOWED_ORIGINS}" || "${CURRENT_ALLOWED_ORIGINS}" == "${LEGACY_ALLOWED_ORIGINS}" ]]; then
  set_env_var "${ENV_FILE}" "ALLOWED_ORIGINS" "${GENERATED_ALLOWED_ORIGINS}"
fi

echo
echo "[setup] Pulling images..."
docker compose pull

echo "[setup] Starting services..."
docker compose up -d

echo "[setup] Bootstrapping Garage for downloader..."
"${ROOT_DIR}/scripts/bootstrap-garage.sh"

echo "[setup] Current service status:"
docker compose ps

echo
echo "Done. Open http://localhost:${HOST_PORT_WEB_RESOLVED}"
