#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-${ROOT_DIR}/docker-compose.yml}"
COMPOSE_OVERRIDE_FILE="${COMPOSE_OVERRIDE_FILE:-}"
ENV_FILE="${ROOT_DIR}/.env"

PLACEHOLDER_ACCESS_KEY="SET_ME_ACCESS_KEY"
PLACEHOLDER_SECRET_KEY="SET_ME_SECRET_KEY"
PLACEHOLDER_RPC_SECRET="SET_ME_GARAGE_RPC_SECRET"
STATIC_RPC_SECRET="f4db2c1d5aef1dce278d4315b80425e98831714a48c059e22c2a39001b15ca89"

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

generate_garage_rpc_secret() {
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

ensure_random_env_keys() {
  local env_file="$1"
  local current_access_key
  local current_secret_key
  local current_rpc_secret
  local changed=0

  current_access_key="$(grep '^DOWNLOADER_S3_ACCESS_KEY=' "${env_file}" | cut -d= -f2- || true)"
  current_secret_key="$(grep '^DOWNLOADER_S3_SECRET_KEY=' "${env_file}" | cut -d= -f2- || true)"
  current_rpc_secret="$(grep '^GARAGE_RPC_SECRET=' "${env_file}" | cut -d= -f2- || true)"

  if [[ -z "${current_access_key}" || "${current_access_key}" == "${PLACEHOLDER_ACCESS_KEY}" ]]; then
    set_env_var "${env_file}" "DOWNLOADER_S3_ACCESS_KEY" "$(generate_downloader_access_key)"
    changed=1
  fi

  if [[ -z "${current_secret_key}" || "${current_secret_key}" == "${PLACEHOLDER_SECRET_KEY}" ]]; then
    set_env_var "${env_file}" "DOWNLOADER_S3_SECRET_KEY" "$(generate_downloader_secret_key)"
    changed=1
  fi

  if [[ -z "${current_rpc_secret}" || "${current_rpc_secret}" == "${PLACEHOLDER_RPC_SECRET}" || "${current_rpc_secret}" == "${STATIC_RPC_SECRET}" ]]; then
    set_env_var "${env_file}" "GARAGE_RPC_SECRET" "$(generate_garage_rpc_secret)"
    changed=1
  fi

  if [[ ${changed} -eq 1 ]]; then
    echo "[garage-bootstrap] generated missing Garage credentials in ${env_file}"
  fi
}

KEY_ID="${DOWNLOADER_S3_ACCESS_KEY:-}"
SECRET_KEY="${DOWNLOADER_S3_SECRET_KEY:-}"
RPC_SECRET="${GARAGE_RPC_SECRET:-}"
BUCKET_NAME="${DOWNLOADER_S3_BUCKET:-typetype-downloads}"

if [[ ! -f "${ENV_FILE}" ]]; then
  if [[ -f "${ROOT_DIR}/.env.example" ]]; then
    echo "[garage-bootstrap] .env missing, creating it from .env.example"
    cp "${ROOT_DIR}/.env.example" "${ENV_FILE}"
  else
    echo "[garage-bootstrap] writing minimal .env for compose..."
    cat > "${ENV_FILE}" <<EOF
DOWNLOADER_S3_ACCESS_KEY=${KEY_ID}
DOWNLOADER_S3_SECRET_KEY=${SECRET_KEY}
GARAGE_RPC_SECRET=${RPC_SECRET}
EOF
  fi
fi

ensure_random_env_keys "${ENV_FILE}"

if [[ -z "${KEY_ID}" || "${KEY_ID}" == "${PLACEHOLDER_ACCESS_KEY}" ]]; then
  KEY_ID="$(grep '^DOWNLOADER_S3_ACCESS_KEY=' "${ENV_FILE}" | cut -d= -f2-)"
fi

if [[ -z "${SECRET_KEY}" || "${SECRET_KEY}" == "${PLACEHOLDER_SECRET_KEY}" ]]; then
  SECRET_KEY="$(grep '^DOWNLOADER_S3_SECRET_KEY=' "${ENV_FILE}" | cut -d= -f2-)"
fi
if [[ -z "${RPC_SECRET}" || "${RPC_SECRET}" == "${PLACEHOLDER_RPC_SECRET}" || "${RPC_SECRET}" == "${STATIC_RPC_SECRET}" ]]; then
  RPC_SECRET="$(grep '^GARAGE_RPC_SECRET=' "${ENV_FILE}" | cut -d= -f2-)"
fi

export DOWNLOADER_S3_ACCESS_KEY="${KEY_ID}"
export DOWNLOADER_S3_SECRET_KEY="${SECRET_KEY}"
export GARAGE_RPC_SECRET="${RPC_SECRET}"

COMPOSE_ARGS=(-f "${COMPOSE_FILE}")
if [[ -n "${COMPOSE_OVERRIDE_FILE}" ]]; then
  COMPOSE_ARGS+=(-f "${COMPOSE_OVERRIDE_FILE}")
fi

compose() {
  docker compose "${COMPOSE_ARGS[@]}" "$@"
}

garage_exec() {
  compose exec -T garage /garage -c /etc/garage.toml "$@"
}

echo "[garage-bootstrap] starting garage service if needed..."
compose up -d garage >/dev/null

echo "[garage-bootstrap] waiting for garage service..."
for _ in $(seq 1 60); do
  if garage_exec status >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! garage_exec status >/dev/null 2>&1; then
  echo "[garage-bootstrap] garage service did not become ready in time" >&2
  exit 1
fi

status_output="$(garage_exec status || true)"
if [[ "${status_output}" == *"NO ROLE ASSIGNED"* ]]; then
  node_line="$(garage_exec node id)"
  node_line="${node_line%%$'\n'*}"
  node_id="${node_line%@*}"

  layout_output="$(garage_exec layout show || true)"
  marker="Current cluster layout version: "
  if [[ "${layout_output}" == *"${marker}"* ]]; then
    current_version="${layout_output#*${marker}}"
    current_version="${current_version%%$'\n'*}"
  else
    current_version="0"
  fi
  if [[ -z "${current_version}" ]]; then
    current_version="0"
  fi
  next_version="$((current_version + 1))"

  echo "[garage-bootstrap] assigning node role and applying layout v${next_version}"
  garage_exec layout assign -z dc1 -c 20GB "${node_id}"
  garage_exec layout apply --version "${next_version}"
fi

if ! garage_exec bucket info "${BUCKET_NAME}" >/dev/null 2>&1; then
  echo "[garage-bootstrap] creating bucket ${BUCKET_NAME}"
  garage_exec bucket create "${BUCKET_NAME}" >/dev/null
fi

if ! garage_exec key info "${KEY_ID}" >/dev/null 2>&1; then
  echo "[garage-bootstrap] importing access key ${KEY_ID}"
  garage_exec key import --yes -n typetype-downloader "${KEY_ID}" "${SECRET_KEY}" >/dev/null
fi

echo "[garage-bootstrap] ensuring bucket permissions"
garage_exec bucket allow --read --write --owner --key "${KEY_ID}" "${BUCKET_NAME}" >/dev/null

echo "[garage-bootstrap] done"
