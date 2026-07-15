#!/usr/bin/env bash
set -euo pipefail

exec 9>/run/typetype-update.lock
flock -n 9

IFS= read -r revision
if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
  printf '%s\n' 'invalid deployment revision' >&2
  exit 64
fi

main_revision=$(
  curl -fsSL \
    -H 'Accept: application/vnd.github+json' \
    https://api.github.com/repos/TypeType-Video/TypeType/git/ref/heads/main \
    | python3 -c 'import json, sys; print(json.load(sys.stdin)["object"]["sha"])'
)
if [[ "$revision" != "$main_revision" ]]; then
  printf '%s\n' 'deployment revision is not the current main revision' >&2
  exit 65
fi

source_root=$(mktemp -d)
trap 'rm -rf "$source_root"' EXIT
curl -fsSL "https://codeload.github.com/TypeType-Video/TypeType/tar.gz/$revision" \
  | tar -xz -C "$source_root" --strip-components=1
bash "$source_root/scripts/deploy-stable.sh" "$source_root"
