#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
compose_file="${COMPOSE_FILE:-${root}/docker-compose.yml}"
compose_override_file="${COMPOSE_OVERRIDE_FILE:-}"
compose_custom_file="${COMPOSE_CUSTOM_FILE:-}"

compose_args=(--project-directory "$root" --env-file "$root/.env" -f "$compose_file")
if [[ -n "$compose_override_file" ]]; then
  compose_args+=(-f "$compose_override_file")
fi
if [[ -n "$compose_custom_file" ]]; then
  compose_args+=(-f "$compose_custom_file")
fi

compose() {
  docker compose "${compose_args[@]}" "$@"
}

# Remove the persistent container created by stacks predating one-shot init.
compose rm -f -s typetype-init >/dev/null 2>&1 || true
compose run --rm typetype-init
