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
node --test scripts/youtube-egress-relay.test.mjs

docker compose --env-file .env.example -f docker-compose.yml config -q
docker compose --env-file .env.example -f docker-compose.yml -f docker-compose.arm64.yml config -q
docker compose --env-file .env.example -f docker-compose.dev.yml config -q

stable_config="$(docker compose --env-file .env.example -f docker-compose.yml config)"
dev_config="$(docker compose --env-file .env.example -f docker-compose.dev.yml config)"
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
