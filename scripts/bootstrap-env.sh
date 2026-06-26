#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env}"

REMOTE_LOGIN_PLACEHOLDER="SET_ME_YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN"
REMOTE_LOGIN_LEGACY_PLACEHOLDER="SET_ME_SHARED_SECRET"
SESSION_KEY_PLACEHOLDER="SET_ME_YOUTUBE_SESSION_ENCRYPTION_KEY"
GARAGE_RPC_PLACEHOLDER="SET_ME_GARAGE_RPC_SECRET"
GARAGE_RPC_STATIC_DEFAULT="f4db2c1d5aef1dce278d4315b80425e98831714a48c059e22c2a39001b15ca89"

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr '+/' '-_' | tr -d '=\n'
    return
  fi

  python3 - <<'PY'
import secrets

print(secrets.token_urlsafe(48))
PY
}

generate_hex_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi

  python3 - <<'PY'
import secrets

print(secrets.token_hex(32))
PY
}

set_env_var() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "${ENV_FILE}"; then
    sed -i "s|^${key}=.*$|${key}=${value}|" "${ENV_FILE}"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

env_value() {
  local key="$1"
  grep "^${key}=" "${ENV_FILE}" | tail -n 1 | cut -d= -f2- || true
}

ensure_env_file() {
  if [[ -f "${ENV_FILE}" ]]; then
    return
  fi
  if [[ -f "${ROOT_DIR}/.env.example" ]]; then
    cp "${ROOT_DIR}/.env.example" "${ENV_FILE}"
    return
  fi
  touch "${ENV_FILE}"
}

ensure_secret() {
  local key="$1"
  local placeholder="$2"
  local current

  current="$(env_value "${key}")"
  if [[ -n "${current}" && "${current}" != "${placeholder}" && "${current}" != "${REMOTE_LOGIN_LEGACY_PLACEHOLDER}" ]]; then
    return
  fi

  set_env_var "${key}" "$(generate_secret)"
  echo "[bootstrap-env] generated ${key} in ${ENV_FILE}"
}

ensure_hex_secret() {
  local key="$1"
  local placeholder="$2"
  local current

  current="$(env_value "${key}")"
  if [[ -n "${current}" && "${current}" != "${placeholder}" && "${current}" != "${GARAGE_RPC_STATIC_DEFAULT}" ]]; then
    return
  fi

  set_env_var "${key}" "$(generate_hex_secret)"
  echo "[bootstrap-env] generated ${key} in ${ENV_FILE}"
}

ensure_env_file
ensure_secret "YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN" "${REMOTE_LOGIN_PLACEHOLDER}"
ensure_secret "YOUTUBE_SESSION_ENCRYPTION_KEY" "${SESSION_KEY_PLACEHOLDER}"
ensure_hex_secret "GARAGE_RPC_SECRET" "${GARAGE_RPC_PLACEHOLDER}"
