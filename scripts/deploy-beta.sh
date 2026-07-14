#!/usr/bin/env bash
set -euo pipefail

source_root="${1:?deployment source is required}"
project=typetype-beta-stack
server=$(docker ps -q \
  --filter "label=com.docker.compose.project=${project}" \
  --filter label=com.docker.compose.service=typetype-server)
test -n "$server"
root=$(docker inspect "$server" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
test -d "$root"
test -f "$root/.env"

export COMPOSE_FILE="$root/docker-compose.dev.yml"
export COMPOSE_PROJECT_NAME="$project"

compose() {
  docker compose --env-file "$root/.env" "$@"
}

managed_files=(
  .env.example
  docker-compose.dev.yml
  garage.toml
  nginx.conf
  scripts/bootstrap-garage.sh
  scripts/deploy-beta.sh
)
services=(
  typetype
  typetype-server
  typetype-downloader
  typetype-token
  postgres
  postgres-init
  dragonfly
  garage
)

docker compose --project-directory "$root" --env-file "$root/.env" \
  -f "$source_root/docker-compose.dev.yml" config -q
rollback_root="$root/.deploy-rollbacks"
backup="$rollback_root/$(date -u +'%Y%m%dT%H%M%SZ')-$$"
mkdir -p "$backup/scripts"

for file in "${managed_files[@]}"; do
  if [[ -e "$root/$file" ]]; then
    mkdir -p "$backup/$(dirname "$file")"
    cp -a "$root/$file" "$backup/$file"
    printf '%s\n' "$file" >> "$backup/existing-files"
  fi
done

printf 'services:\n' > "$backup/rollback.yml"
for service in "${services[@]}"; do
  container=$(compose ps -a -q "$service" | head -n 1)
  if [[ -n "$container" ]]; then
    image=$(docker inspect "$container" --format '{{.Image}}')
    printf '  %s:\n    image: "%s"\n' "$service" "$image" >> "$backup/rollback.yml"
  fi
done

succeeded=false
finish() {
  status=$?
  trap - EXIT
  if [[ "$succeeded" == true ]]; then
    printf 'succeeded\n' > "$backup/status"
    ln -sfn "$(basename "$backup")" "$rollback_root/last-successful"
    find "$rollback_root" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
      | sort -nr | tail -n +6 | cut -d' ' -f2- | xargs -r rm -rf
    exit "$status"
  fi

  printf 'failed\n' > "$backup/status"
  set +e
  for file in "${managed_files[@]}"; do
    if grep -Fxq "$file" "$backup/existing-files" 2>/dev/null; then
      mkdir -p "$root/$(dirname "$file")"
      cp -a "$backup/$file" "$root/$file"
    else
      rm -f "$root/$file"
    fi
  done
  cd "$root"
  docker compose --env-file .env -f docker-compose.dev.yml -f "$backup/rollback.yml" \
    up -d --remove-orphans
  docker compose --env-file .env -f docker-compose.dev.yml -f "$backup/rollback.yml" ps
  exit "$status"
}
trap finish EXIT

install -m 644 "$source_root/.env.example" "$root/.env.example"
install -m 644 "$source_root/docker-compose.dev.yml" "$root/docker-compose.dev.yml"
install -m 644 "$source_root/garage.toml" "$root/garage.toml"
install -m 644 "$source_root/nginx.conf" "$root/nginx.conf"
install -m 755 "$source_root/scripts/bootstrap-garage.sh" "$root/scripts/bootstrap-garage.sh"
install -m 755 "$source_root/scripts/deploy-beta.sh" "$root/scripts/deploy-beta.sh"
cd "$root"

./scripts/bootstrap-garage.sh
compose pull
compose up -d --remove-orphans --wait --wait-timeout 180

probe() {
  local url="$1"
  for attempt in $(seq 1 30); do
    if compose exec -T typetype-server wget -q -T 20 -t 1 -O /dev/null "$url"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

probe http://127.0.0.1:8080/health
probe http://typetype-token:8081/health
probe 'http://typetype-token:8081/potoken?videoId=dQw4w9WgXcQ'
probe http://typetype-downloader:18093/health/deep
compose exec -T typetype wget -q -T 20 -t 1 -O /dev/null http://127.0.0.1/api/health
compose ps
succeeded=true
