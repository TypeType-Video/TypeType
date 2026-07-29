#!/usr/bin/env bash
set -euo pipefail

proxy_url="${1:?YouTube outbound proxy URL is required}"
curl \
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
