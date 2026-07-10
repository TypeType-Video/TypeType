#!/usr/bin/env bash
set -euo pipefail

archive="${1:?deployment archive is required}"
project=typetype-beta-stack
server=$(docker ps -q \
  --filter "label=com.docker.compose.project=${project}" \
  --filter label=com.docker.compose.service=typetype-server)
test -n "$server"
root=$(docker inspect "$server" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
test -d "$root"

trap 'rm -f "$archive"' EXIT
tar -xzf "$archive" -C "$root"
cd "$root"
chmod +x scripts/bootstrap-garage.sh scripts/deploy-beta.sh
export COMPOSE_FILE="$root/docker-compose.dev.yml"
export COMPOSE_PROJECT_NAME="$project"

./scripts/bootstrap-garage.sh
docker compose --env-file .env pull
docker compose --env-file .env up -d --remove-orphans
docker compose --env-file .env ps

for attempt in $(seq 1 30); do
  if docker compose --env-file .env exec -T typetype-server \
    wget -q -O- http://typetype-downloader:18093/health; then
    exit 0
  fi
  sleep 1
done
docker compose --env-file .env logs typetype-downloader
exit 1
