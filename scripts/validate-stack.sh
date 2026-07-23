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
