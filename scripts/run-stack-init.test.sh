#!/usr/bin/env bash
set -euo pipefail

repository="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT

cat > "$temporary/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%q ' "$@" >> "$FAKE_DOCKER_LOG"
printf '\n' >> "$FAKE_DOCKER_LOG"
EOF
chmod +x "$temporary/docker"

PATH="$temporary:$PATH" \
FAKE_DOCKER_LOG="$temporary/docker.log" \
  "$repository/scripts/run-stack-init.sh"

grep -Fq 'rm -f -s typetype-init' "$temporary/docker.log"
grep -Fq 'run --rm typetype-init' "$temporary/docker.log"
