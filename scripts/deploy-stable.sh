#!/usr/bin/env bash
set -euo pipefail

source_root="${1:?deployment source is required}"
project=typetype-stack
server=$(docker ps -q \
  --filter "label=com.docker.compose.project=${project}" \
  --filter label=com.docker.compose.service=typetype-server)
test -n "$server"
root=$(docker inspect "$server" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
test -d "$root"
test -f "$root/.env"

export COMPOSE_FILE="$root/docker-compose.yml"
export COMPOSE_PROJECT_NAME="$project"

compose() {
  docker compose --project-directory "$root" --env-file "$root/.env" "$@"
}

managed_files=(
  .env.example
  docker-compose.yml
  docker-compose.arm64.yml
  garage.toml
  nginx.conf
  scripts/bootstrap-env.sh
  scripts/bootstrap-garage.sh
  scripts/deploy-stable.sh
)
services=(
  typetype
  typetype-server
  typetype-secrets
  typetype-downloader
  typetype-token
  postgres
  postgres-init
  dragonfly
  garage
)

docker compose --project-directory "$root" --env-file "$root/.env" \
  -f "$source_root/docker-compose.yml" config -q
rollback_root="$root/.deploy-rollbacks"
backup="$rollback_root/$(date -u +'%Y%m%dT%H%M%SZ')-$$"
mkdir -p "$backup/scripts"
cp -a "$root/.env" "$backup/.env"

for file in "${managed_files[@]}"; do
  if [[ -e "$root/$file" ]]; then
    mkdir -p "$backup/$(dirname "$file")"
    cp -a "$root/$file" "$backup/$file"
    printf '%s\n' "$file" >> "$backup/existing-files"
  fi
done

printf 'services:\n' > "$backup/rollback.yml"
for service in "${services[@]}"; do
  container=$(compose ps -a -q "$service" 2>/dev/null | head -n 1 || true)
  if [[ -n "$container" ]]; then
    image=$(docker inspect "$container" --format '{{.Image}}')
    printf '  %s:\n    image: "%s"\n' "$service" "$image" >> "$backup/rollback.yml"
  fi
done

compose exec -T postgres sh -ec \
  "pg_dump -U \"\$POSTGRES_USER\" \"\$POSTGRES_DB\"" \
  | gzip -9 > "$backup/postgres.sql.gz"
downloader_database=$(compose exec -T postgres sh -ec \
  "psql -U \"\$POSTGRES_USER\" \"\$POSTGRES_DB\" -tAc \"SELECT 1 FROM pg_database WHERE datname = 'typetype_downloader'\"")
if [[ "$downloader_database" == 1 ]]; then
  compose exec -T postgres sh -ec \
    "pg_dump -U \"\$POSTGRES_USER\" typetype_downloader" \
    | gzip -9 > "$backup/postgres-downloader.sql.gz"
fi

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
  cp -a "$backup/.env" "$root/.env"
  for file in "${managed_files[@]}"; do
    if grep -Fxq "$file" "$backup/existing-files" 2>/dev/null; then
      mkdir -p "$root/$(dirname "$file")"
      cp -a "$backup/$file" "$root/$file"
    else
      rm -f "$root/$file"
    fi
  done
  cd "$root"
  docker compose --env-file .env -f docker-compose.yml -f "$backup/rollback.yml" \
    up -d --remove-orphans
  docker compose --env-file .env -f docker-compose.yml -f "$backup/rollback.yml" ps
  exit "$status"
}
trap finish EXIT

for file in "${managed_files[@]}"; do
  install -D -m 644 "$source_root/$file" "$root/$file"
done
chmod 755 "$root/scripts/bootstrap-env.sh"
chmod 755 "$root/scripts/bootstrap-garage.sh"
chmod 755 "$root/scripts/deploy-stable.sh"
cd "$root"

./scripts/bootstrap-env.sh
./scripts/bootstrap-garage.sh
compose pull
compose up -d --remove-orphans --wait --wait-timeout 180

probe() {
  local service="$1"
  local url="$2"
  for _ in $(seq 1 30); do
    if compose exec -T "$service" wget -q -T 20 -t 1 -O /dev/null "$url"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

probe typetype http://typetype-server:8080/health
probe typetype http://typetype-token:8081/health
probe typetype 'http://typetype-token:8081/potoken?videoId=dQw4w9WgXcQ'
probe typetype http://typetype-downloader:18093/health/deep
probe typetype http://127.0.0.1/api/health
compose ps
succeeded=true
