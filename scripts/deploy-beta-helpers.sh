#!/usr/bin/env bash

configure_beta_component() {
  target_service=
  image_variable=
  expected_image=
  case "$component" in
    all) ;;
    frontend)
      target_service=typetype
      image_variable=TYPETYPE_WEB_BETA_IMAGE
      expected_image=registery.typetype.video/typetype/web-beta
      ;;
    server)
      target_service=typetype-server
      image_variable=TYPETYPE_SERVER_BETA_IMAGE
      expected_image=registery.typetype.video/typetype/server-beta
      ;;
    downloader)
      target_service=typetype-downloader
      image_variable=TYPETYPE_DOWNLOADER_BETA_IMAGE
      expected_image=registery.typetype.video/typetype/downloader-beta
      ;;
    token)
      target_service=typetype-token
      image_variable=TYPETYPE_TOKEN_BETA_IMAGE
      expected_image=registery.typetype.video/typetype/token-beta
      ;;
    *) exit 64 ;;
  esac
  if [[ "$component" != all ]]; then
    stage=validate-component
    [[ "$image" == "$expected_image" ]]
    [[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]
  fi
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
