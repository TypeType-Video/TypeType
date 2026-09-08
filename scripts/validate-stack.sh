#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

created_env=false
if [[ ! -f .env ]]; then
  cp .env.example .env
  created_env=true
fi
cleanup() {
  if [[ "$created_env" == true ]]; then
    rm -f .env
  fi
}
trap cleanup EXIT

for script in scripts/*.sh; do
  bash -n "$script"
done
./scripts/install-stack.test.sh
./scripts/deploy-beta.test.sh

docker compose --env-file .env.example -f docker-compose.yml config -q
docker compose --env-file .env.example -f docker-compose.yml -f docker-compose.arm64.yml config -q
docker compose --env-file .env.example -f docker-compose.dev.yml config -q
YOUTUBE_OUTBOUND_PROXY_URL=http://127.0.0.1:29083 \
  docker compose --env-file .env.example -f docker-compose.dev.yml config -q

custom_config="$(TYPETYPE_SERVER_HOST=custom-server \
  TYPETYPE_TOKEN_HOST=custom-token \
  TYPETYPE_DOWNLOADER_HOST=custom-downloader \
  DOWNLOADER_SERVICE_URL=http://custom-downloader:28093 \
  SUBTITLE_SERVICE_URL=http://custom-token:28081 \
  YOUTUBE_REMOTE_LOGIN_SERVICE_URL=http://custom-token:28081 \
  YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL=http://custom-server:28080 \
  TYPETYPE_API_BASE=http://custom-server:28080 \
  S3_ENDPOINT=http://custom-garage:23900 \
  S3_PUBLIC_ENDPOINT=http://public-garage:23900 \
  docker compose --env-file .env.example -f docker-compose.yml config)"
for expected in \
  'TYPETYPE_SERVER_HOST: custom-server' \
  'TYPETYPE_TOKEN_HOST: custom-token' \
  'TYPETYPE_DOWNLOADER_HOST: custom-downloader' \
  'DOWNLOADER_SERVICE_URL: http://custom-downloader:28093' \
  'SUBTITLE_SERVICE_URL: http://custom-token:28081' \
  'YOUTUBE_REMOTE_LOGIN_SERVICE_URL: http://custom-token:28081' \
  'YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL: http://custom-server:28080' \
  'TYPETYPE_API_BASE: http://custom-server:28080' \
  'S3_ENDPOINT: http://custom-garage:23900' \
  'S3_PUBLIC_ENDPOINT: http://public-garage:23900'; do
  if ! grep -q "${expected}" <<<"${custom_config}"; then
    echo "custom service URL was not propagated: ${expected}" >&2
    exit 1
  fi
done

stable_config="$(docker compose --env-file .env.example -f docker-compose.yml config)"
dev_config="$(YOUTUBE_OUTBOUND_PROXY_URL=http://127.0.0.1:29083 \
  docker compose --env-file .env.example -f docker-compose.dev.yml config)"
if grep -q '/etc/nginx/conf.d/default.conf' <<<"${stable_config}${dev_config}"; then
  echo "default Compose must use the nginx configuration bundled in the web image" >&2
  exit 1
fi
if ! grep -q 'source: garage_config' <<<"${stable_config}"; then
  echo "stable Compose must use the managed Garage config volume" >&2
  exit 1
fi
if ! grep -q 'source: garage_config' <<<"${dev_config}"; then
  echo "beta Compose must use the managed Garage config volume" >&2
  exit 1
fi
if grep -q 'youtube-egress-relay' <<<"$dev_config"; then
  echo "beta Compose must use the externally validated egress proxy" >&2
  exit 1
fi
if [[ $(grep -c 'YOUTUBE_OUTBOUND_PROXY_URL:' <<<"$dev_config") -ne 2 ]]; then
  echo "beta Server and Token must expose the shared outbound proxy setting" >&2
  exit 1
fi
for config in "$stable_config" "$dev_config"; do
  if ! grep -q 'AUTH_SESSION_TTL_DAYS: "30"' <<<"$config"; then
    echo "Server must receive the default account session lifetime" >&2
    exit 1
  fi
  if ! grep -q 'AUTH_ALLOW_INSECURE_COOKIES: "false"' <<<"$config"; then
    echo "Server must keep insecure refresh cookies disabled by default" >&2
    exit 1
  fi
done
