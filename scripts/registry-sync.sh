#!/usr/bin/env bash
set -euo pipefail

registry=registery.typetype.video
manifest_accept='application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json'
retry_cooldown_seconds=600
state_root=/var/lib/typetype-registry-sync
dry_run=false
stable_env_backup=
stable_env_target=
stable_update_complete=false
declare -A component_key=([frontend]=WEB [server]=SERVER [downloader]=DOWNLOADER [token]=TOKEN)

read_env_value() {
  awk -v key="$2" 'index($0, key "=") == 1 { print substr($0, length(key) + 2); found=1; exit } END { if (!found) exit 1 }' "$1"
}

write_env_value() {
  local file="$1" key="$2" value="$3" temporary
  temporary=$(mktemp "${file}.XXXXXX")
  if ! awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    index($0, key "=") == 1 {
      if (!found) print key "=" value
      found = 1
      next
    }
    { print }
    END { if (!found) print key "=" value }
  ' "$file" > "$temporary"; then
    rm -f "$temporary"
    return 1
  fi
  if ! chmod --reference="$file" "$temporary"; then
    rm -f "$temporary"
    return 1
  fi
  if ! chown --reference="$file" "$temporary"; then
    rm -f "$temporary"
    return 1
  fi
  if ! mv "$temporary" "$file"; then
    rm -f "$temporary"
    return 1
  fi
}

manifest_digest() {
  local headers digest
  headers=$(curl --fail --silent --show-error --head --retry 2 --retry-all-errors --connect-timeout 5 --max-time 20 -H "Accept: $manifest_accept" -H 'Cache-Control: no-cache' "https://$registry/v2/$1/manifests/$2")
  digest=$(awk 'tolower($1) == "docker-content-digest:" { gsub("\r", "", $2); print $2; exit }' <<<"$headers")
  [[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]] || { printf 'invalid registry digest for %s:%s\n' "$1" "$2" >&2; return 1; }
  printf '%s\n' "$digest"
}

locate_stack_root() {
  local environment="$1" candidate anchor root candidates
  if [[ "$environment" == beta ]]; then candidates='typetype-beta-stack typetype-beta'; else candidates='typetype-stack typetype'; fi
  for candidate in $candidates; do
    anchor=$(docker ps -q --filter "label=com.docker.compose.project=$candidate" --filter label=com.docker.compose.service=typetype-server | head -n 1)
    if [[ -n "$anchor" ]]; then
      root=$(docker inspect "$anchor" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
      [[ -f "$root/.env" ]] && { printf '%s\n' "$root"; return 0; }
    fi
  done
  printf 'cannot locate active %s Compose project\n' "$environment" >&2
  return 1
}

retry_allowed() {
  local marker="$1" signature="$2" previous_signature previous_time
  [[ -r "$marker" ]] || return 0
  read -r previous_signature previous_time < "$marker" || return 0
  [[ "$previous_signature" == "$signature" ]] || return 0
  (( $(date +%s) - previous_time >= retry_cooldown_seconds ))
}

record_failure() {
  local marker="$1" signature="$2" temporary
  install -d -m 750 "$state_root"
  temporary=$(mktemp "$state_root/.failed.XXXXXX")
  printf '%s %s\n' "$signature" "$(date +%s)" > "$temporary"
  chmod 600 "$temporary"
  mv "$temporary" "$marker"
}

clear_failure() { rm -f "$1"; }

cleanup() {
  if [[ -z "$stable_env_backup" ]]; then
    return 0
  fi
  if [[ "$stable_update_complete" != true ]]; then
    if ! cp -a "$stable_env_backup" "$stable_env_target"; then
      printf 'failed to restore %s from %s\n' "$stable_env_target" "$stable_env_backup" >&2
      return 1
    fi
  fi
  rm -f "$stable_env_backup"
}

sync_beta() {
  local root="$1" component key variable image_path digest image current marker failures=0
  for component in frontend server downloader token; do
    key=${component_key[$component]}; variable="TYPETYPE_${key}_BETA_IMAGE"; image_path="typetype/${key,,}-beta"
    if ! digest=$(manifest_digest "$image_path" latest); then failures=1; continue; fi
    image="$registry/$image_path"; current=$(read_env_value "$root/.env" "$variable" 2>/dev/null || true)
    marker="$state_root/failed-beta-$component"
    if [[ "$current" == *"@$digest" ]]; then clear_failure "$marker"; continue; fi
    if $dry_run; then printf 'beta %s: %s -> %s@%s\n' "$component" "$current" "$image" "$digest"; continue; fi
    if ! retry_allowed "$marker" "$image@$digest"; then printf 'beta %s: retry delayed\n' "$component" >&2; continue; fi
    if TYPETYPE_DEPLOY_COMPONENT="$component" TYPETYPE_DEPLOY_IMAGE="$image" TYPETYPE_DEPLOY_DIGEST="$digest" /usr/local/sbin/typetype-beta-update; then
      clear_failure "$marker"
    else
      record_failure "$marker" "$image@$digest"; failures=1
    fi
  done
  return "$failures"
}

sync_stable() {
  local root="$1" component key variable image_path digest image current signature revision i
  local -a changed_variables=() changed_images=() desired_images=()
  for component in frontend server downloader token; do
    key=${component_key[$component]}; variable="TYPETYPE_${key}_IMAGE"; image_path="typetype/${key,,}"
    if ! digest=$(manifest_digest "$image_path" latest); then return 1; fi
    image="$registry/$image_path@$digest"; desired_images+=("$image")
    current=$(read_env_value "$root/.env" "$variable" 2>/dev/null || true)
    if [[ "$current" != *"@$digest" ]]; then changed_variables+=("$variable"); changed_images+=("$image"); fi
  done
  if [[ ${#changed_variables[@]} -eq 0 ]]; then clear_failure "$state_root/failed-stable"; return 0; fi
  signature=$(printf '%s\n' "${desired_images[@]}" | sha256sum | awk '{print $1}')
  if $dry_run; then
    for i in "${!changed_variables[@]}"; do printf 'watch %s: %s -> %s\n' "${changed_variables[$i]}" "$(read_env_value "$root/.env" "${changed_variables[$i]}" 2>/dev/null || true)" "${changed_images[$i]}"; done
    return 0
  fi
  if ! retry_allowed "$state_root/failed-stable" "$signature"; then printf '%s\n' 'watch: retry delayed for unchanged image set' >&2; return 0; fi
  stable_env_backup=$(mktemp)
  stable_env_target="$root/.env"
  if ! cp -a "$root/.env" "$stable_env_backup"; then
    rm -f "$stable_env_backup"
    stable_env_backup=
    return 1
  fi
  for i in "${!changed_variables[@]}"; do
    if ! write_env_value "$root/.env" "${changed_variables[$i]}" "${changed_images[$i]}"; then
      return 1
    fi
  done
  revision=$(curl --fail --silent --show-error --retry 2 --retry-all-errors --connect-timeout 5 --max-time 20 -H 'Accept: application/vnd.github+json' https://api.github.com/repos/TypeType-Video/TypeType/git/ref/heads/main | python3 -c 'import json,sys; print(json.load(sys.stdin)["object"]["sha"])')
  [[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { printf '%s\n' 'invalid stable deployment revision' >&2; return 1; }
  if ! printf '%s\n' "$revision" | /usr/local/sbin/typetype-update; then record_failure "$state_root/failed-stable" "$signature"; return 1; fi
  stable_update_complete=true; clear_failure "$state_root/failed-stable"
}

main() {
  case "${1:-}" in
    '') ;;
    --dry-run) dry_run=true ;;
    *) printf 'usage: %s [--dry-run]\n' "$0" >&2; return 64 ;;
  esac
  exec 9>/run/typetype-registry-sync.lock
  if ! flock -n 9; then
    printf '%s\n' 'registry sync already running; skipping'
    return 0
  fi

  local beta_root stable_root failures=0
  beta_root=$(locate_stack_root beta)
  stable_root=$(locate_stack_root stable)
  if ! $dry_run; then
    install -d -m 750 "$state_root"
    trap cleanup EXIT
  fi
  sync_beta "$beta_root" || failures=1
  sync_stable "$stable_root" || failures=1
  return "$failures"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
