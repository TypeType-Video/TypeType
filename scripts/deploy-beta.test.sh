#!/usr/bin/env bash
set -euo pipefail

repository="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary=$(mktemp -d)
trap 'rm -rf "$temporary"' EXIT

stack="$temporary/stack"
fake_bin="$temporary/bin"
mkdir -p "$stack/scripts" "$fake_bin"
printf 'POSTGRES_PASSWORD=test\n' > "$stack/.env"
for file in \
  .env.example \
  docker-compose.dev.yml \
  scripts/bootstrap-garage.sh \
  scripts/deploy-beta.sh \
  scripts/youtube-egress-relay.mjs; do
  mkdir -p "$stack/$(dirname "$file")"
  cp "$repository/$file" "$stack/$file"
done

cat > "$fake_bin/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%q ' "$@" >> "$FAKE_DOCKER_LOG"
printf '\n' >> "$FAKE_DOCKER_LOG"

case "$1" in
  ps)
    if [[ " $* " == *" -q "* ]]; then
      echo anchor
    fi
    ;;
  inspect)
    if [[ "$2" == anchor ]]; then
      echo "$FAKE_STACK_ROOT"
    else
      echo sha256:old
    fi
    ;;
  compose)
    if [[ "${FAKE_FAIL_UPDATE:-0}" == 1 && "$*" == *"up -d --no-deps --wait"* ]]; then
      exit 1
    fi
    case "$*" in
      *"config --services"*)
        printf '%s\n' youtube-egress-relay typetype typetype-server \
          typetype-downloader typetype-token postgres postgres-init \
          dragonfly garage-config garage
        ;;
      *"ps -a -q"*)
        echo "container-${*: -1}"
        ;;
    esac
    ;;
esac
EOF
chmod +x "$fake_bin/docker"

export FAKE_DOCKER_LOG="$temporary/docker.log"
export FAKE_STACK_ROOT="$stack"
export PATH="$fake_bin:$PATH"
digest="sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

TYPETYPE_DEPLOY_COMPONENT=server \
TYPETYPE_DEPLOY_IMAGE=ghcr.io/typetype-video/typetype-server-beta \
TYPETYPE_DEPLOY_DIGEST="$digest" \
  "$repository/scripts/deploy-beta.sh" "$repository"

if ! grep -Fq "TYPETYPE_SERVER_BETA_IMAGE=ghcr.io/typetype-video/typetype-server-beta@$digest" \
  "$stack/.env"; then
  echo "the server image digest was not persisted" >&2
  sed -n '/^TYPETYPE_.*_IMAGE=/p' "$stack/.env" >&2
  exit 1
fi
if ! grep -Fq 'pull typetype-server' "$FAKE_DOCKER_LOG"; then
  echo "the server rollout did not pull only the server image" >&2
  cat "$FAKE_DOCKER_LOG" >&2
  exit 1
fi
if ! grep -Fq 'up -d --no-deps --wait --wait-timeout 180 typetype-server' \
  "$FAKE_DOCKER_LOG"; then
  echo "the server rollout did not restart only the server service" >&2
  cat "$FAKE_DOCKER_LOG" >&2
  exit 1
fi
if grep -Eq 'compose .* up .*youtube-egress-relay' "$FAKE_DOCKER_LOG"; then
  echo "a server rollout must not recreate the egress relay" >&2
  exit 1
fi
if grep -Eq 'compose .* pull $' "$FAKE_DOCKER_LOG"; then
  echo "a server rollout must not pull the full stack" >&2
  exit 1
fi

previous_pin=$(grep '^TYPETYPE_SERVER_BETA_IMAGE=' "$stack/.env")
: > "$FAKE_DOCKER_LOG"
failed_digest="sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
if FAKE_FAIL_UPDATE=1 \
  TYPETYPE_DEPLOY_COMPONENT=server \
  TYPETYPE_DEPLOY_IMAGE=ghcr.io/typetype-video/typetype-server-beta \
  TYPETYPE_DEPLOY_DIGEST="$failed_digest" \
    "$repository/scripts/deploy-beta.sh" "$repository"; then
  echo "the simulated failed rollout unexpectedly succeeded" >&2
  exit 1
fi
grep -Fxq "$previous_pin" "$stack/.env"
grep -Fq 'up -d --no-deps typetype-server' "$FAKE_DOCKER_LOG"
if grep -Eq 'compose .* up .*youtube-egress-relay' "$FAKE_DOCKER_LOG"; then
  echo "a server rollback must not recreate the egress relay" >&2
  exit 1
fi
