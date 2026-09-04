#!/usr/bin/env bash
set -euo pipefail

project="${1:?Compose project is required}"
proxy_url="${2-}"
anchor=$(docker ps -q \
  --filter "label=com.docker.compose.project=${project}" | head -n 1)
if [[ -z "$anchor" ]]; then
  echo "No running ${project} container is available for the egress preflight." >&2
  exit 1
fi
pid=$(docker inspect "$anchor" --format '{{.State.Pid}}')
if [[ ! "$pid" =~ ^[1-9][0-9]*$ ]]; then
  echo "Cannot resolve the network namespace for ${project}." >&2
  exit 1
fi

nsenter --target "$pid" --net -- curl \
  --fail \
  --proxy "$proxy_url" \
  --noproxy "" \
  --connect-timeout 5 \
  --max-time 10 \
  --retry 2 \
  --retry-delay 1 \
  --retry-all-errors \
  --silent \
  --show-error \
  --output /dev/null \
  https://www.youtube.com/generate_204
