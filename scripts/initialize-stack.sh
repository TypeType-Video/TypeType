#!/bin/sh
set -eu

generate_secret() {
  openssl rand -base64 48 | tr '+/' '-_' | tr -d '=\n'
}

ensure_secret() {
  file="$1"
  value="$2"
  placeholder="$3"
  legacy_placeholder="$4"
  if [ -n "$value" ] && [ "$value" != "$placeholder" ] && [ "$value" != "$legacy_placeholder" ]; then
    printf '%s' "$value" > "$file"
  elif [ ! -s "$file" ]; then
    generate_secret > "$file"
  fi
  chmod 0444 "$file"
}

mkdir -p /run/typetype-secrets
ensure_secret \
  /run/typetype-secrets/youtube_remote_login_internal_token \
  "${YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN:-}" \
  SET_ME_YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN \
  SET_ME_SHARED_SECRET
ensure_secret \
  /run/typetype-secrets/youtube_session_encryption_key \
  "${YOUTUBE_SESSION_ENCRYPTION_KEY:-}" \
  SET_ME_YOUTUBE_SESSION_ENCRYPTION_KEY \
  SET_ME_SHARED_SECRET

config=/etc/garage/garage.toml
if [ ! -s "$config" ]; then
  umask 077
  if [ -s /migration/garage.toml ]; then
    cp /migration/garage.toml "$config"
  else
    cat > "$config" <<'EOF'
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
EOF
  fi
fi

postgres_host="${POSTGRES_HOST:-postgres}"
until pg_isready -h "$postgres_host" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 1
done

exists="$(psql -h "$postgres_host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='typetype_downloader'")"
if [ "$exists" != "1" ]; then
  psql -h "$postgres_host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c 'CREATE DATABASE typetype_downloader'
fi
