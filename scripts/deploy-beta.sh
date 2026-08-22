#!/usr/bin/env bash
set -euo pipefail

source_root="${1:?deployment source is required}"
component="${TYPETYPE_DEPLOY_COMPONENT:-${2:-all}}"
image="${TYPETYPE_DEPLOY_IMAGE:-${3:-}}"
digest="${TYPETYPE_DEPLOY_DIGEST:-${4:-}}"
project=typetype-beta-stack
anchor=$(docker ps -a -q \
  --filter "label=com.docker.compose.project=${project}" | head -n 1)
test -n "$anchor"
root=$(docker inspect "$anchor" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
test -d "$root"
test -f "$root/.env"

target_service=
image_variable=
expected_image=
case "$component" in
  all) ;;
  frontend)
    target_service=typetype
    image_variable=TYPETYPE_WEB_BETA_IMAGE
    expected_image=ghcr.io/typetype-video/typetype-beta
    ;;
  server)
    target_service=typetype-server
    image_variable=TYPETYPE_SERVER_BETA_IMAGE
    expected_image=ghcr.io/typetype-video/typetype-server-beta
    ;;
  downloader)
    target_service=typetype-downloader
    image_variable=TYPETYPE_DOWNLOADER_BETA_IMAGE
    expected_image=ghcr.io/typetype-video/typetype-downloader-beta
    ;;
  token)
    target_service=typetype-token
    image_variable=TYPETYPE_TOKEN_BETA_IMAGE
    expected_image=ghcr.io/typetype-video/typetype-token-beta
    ;;
  *) exit 64 ;;
esac
if [[ "$component" != all ]]; then
  [[ "$image" == "$expected_image" ]]
  [[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]
fi
export COMPOSE_FILE="$root/docker-compose.dev.yml"
export COMPOSE_PROJECT_NAME="$project"

compose() {
  docker compose --env-file "$root/.env" "$@"
}

prune_unused_typetype_images() {
  local source
  local sources=(
    https://github.com/TypeType-Video/TypeType-Frontend
    https://github.com/TypeType-Video/TypeType-Server
    https://github.com/TypeType-Video/TypeType-Downloader
    https://github.com/TypeType-Video/TypeType-Token
  )
  for source in "${sources[@]}"; do
    docker image prune --all --force \
      --filter "label=org.opencontainers.image.source=$source"
  done
}

set_env_value() {
  local key="$1"
  local value="$2"
  local temporary
  temporary=$(mktemp "$root/.env.XXXXXX")
  awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    index($0, key "=") == 1 {
      if (!found) print key "=" value
      found = 1
      next
    }
    { print }
    END { if (!found) print key "=" value }
  ' "$root/.env" > "$temporary"
  chmod --reference="$root/.env" "$temporary"
  chown --reference="$root/.env" "$temporary"
  mv "$temporary" "$root/.env"
}
managed_files=(
  .env.example
  docker-compose.dev.yml
  scripts/bootstrap-garage.sh
  scripts/check-youtube-egress.sh
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
  garage-config
  garage
)

docker compose --project-directory "$root" --env-file "$root/.env" \
  -f "$source_root/docker-compose.dev.yml" config -q
if [[ "$component" == all ]]; then
  proxy_url=$(docker compose --project-directory "$root" --env-file "$root/.env" \
    -f "$source_root/docker-compose.dev.yml" config --environment \
    | sed -n 's/^YOUTUBE_OUTBOUND_PROXY_URL=//p')
  "$source_root/scripts/check-youtube-egress.sh" "$project" "$proxy_url"
fi
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
declare -A current_services=()
rollback_services=()
while read -r current_service; do
  current_services["$current_service"]=1
  rollback_services+=("$current_service")
done < <(compose config --services)
for current_service in "${services[@]}"; do
  if [[ -z "${current_services[$current_service]:-}" ]]; then
    continue
  fi
  container=$(compose ps -a -q "$current_service" | head -n 1)
  if [[ -n "$container" ]]; then
    current_image=$(docker inspect "$container" --format '{{.Image}}')
    printf '  %s:\n    image: "%s"\n' "$current_service" "$current_image" >> "$backup/rollback.yml"
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
  if [[ "$component" == all ]]; then
    docker compose --env-file .env -f docker-compose.dev.yml -f "$backup/rollback.yml" \
      up -d --no-deps "${rollback_services[@]}"
  else
    docker compose --env-file .env -f docker-compose.dev.yml -f "$backup/rollback.yml" \
      up -d --no-deps "$target_service"
  fi
  docker compose --env-file .env -f docker-compose.dev.yml -f "$backup/rollback.yml" ps
  exit "$status"
}
trap finish EXIT

prune_unused_typetype_images

install -m 644 "$source_root/.env.example" "$root/.env.example"
install -m 644 "$source_root/docker-compose.dev.yml" "$root/docker-compose.dev.yml"
install -m 755 "$source_root/scripts/bootstrap-garage.sh" "$root/scripts/bootstrap-garage.sh"
install -m 755 "$source_root/scripts/check-youtube-egress.sh" "$root/scripts/check-youtube-egress.sh"
install -m 755 "$source_root/scripts/deploy-beta.sh" "$root/scripts/deploy-beta.sh"
install -d -m 700 "$root/.typetype-migration"
if [[ -s "$root/garage.toml" ]]; then
  install -D -m 600 "$root/garage.toml" "$root/.typetype-migration/garage.toml"
fi
cd "$root"

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

if [[ "$component" == all ]]; then
  compose pull
  compose up -d --remove-orphans --wait --wait-timeout 180
  ./scripts/bootstrap-garage.sh
  probe http://127.0.0.1:8080/health
  probe http://typetype-token:8081/health
  probe 'http://typetype-token:8081/potoken?videoId=dQw4w9WgXcQ'
  probe http://typetype-downloader:18093/health/deep
  compose exec -T typetype wget -q -T 20 -t 1 -O /dev/null http://127.0.0.1/api/health
else
  set_env_value "$image_variable" "$image@$digest"
  compose pull "$target_service"
  compose up -d --no-deps --wait --wait-timeout 180 "$target_service"
  case "$component" in
    frontend)
      compose exec -T typetype wget -q -T 20 -t 1 -O /dev/null \
        http://127.0.0.1/api/health
      ;;
    server)
      probe http://127.0.0.1:8080/health
      ;;
    token)
      compose exec -T typetype-token curl --fail --silent \
        http://127.0.0.1:8081/health >/dev/null
      probe 'http://typetype-token:8081/potoken?videoId=dQw4w9WgXcQ'
      ;;
    downloader)
      probe http://typetype-downloader:18093/health/deep
      ;;
  esac
fi
compose ps
succeeded=true
