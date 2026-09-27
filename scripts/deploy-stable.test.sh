#!/usr/bin/env bash
set -euo pipefail

repository="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT

source_root="$temporary/source"
stack="$temporary/stack"
fake_bin="$temporary/bin"
mkdir -p "$source_root/scripts" "$stack/scripts" "$fake_bin"

for file in \
  .env.example \
  docker-compose.yml \
  docker-compose.arm64.yml \
  scripts/bootstrap-env.sh \
  scripts/bootstrap-garage.sh \
  scripts/initialize-stack.sh \
  scripts/run-stack-init.sh \
  scripts/deploy-stable.sh; do
  mkdir -p "$source_root/$(dirname "$file")" "$stack/$(dirname "$file")"
  cp "$repository/$file" "$source_root/$file"
  cp "$repository/$file" "$stack/$file"
done
printf 'POSTGRES_PASSWORD=test\n' > "$stack/.env"
for script in bootstrap-env.sh bootstrap-garage.sh initialize-stack.sh run-stack-init.sh; do
  printf '#!/usr/bin/env bash\nexit 0\n' > "$source_root/scripts/$script"
done

rollback_root="$stack/.deploy-rollbacks"
mkdir -p "$rollback_root"
for index in {1..6}; do
  mkdir -p "$rollback_root/old-$index"
  printf 'existing snapshot\n' > "$rollback_root/old-$index/status"
done

cat > "$fake_bin/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
case "$1" in
  ps)
    if [[ " $* " == *" -q "* ]]; then
      echo server-container
    fi
    ;;
  inspect)
    if [[ "$2" == server-container ]]; then
      echo "$FAKE_STACK_ROOT"
    else
      echo sha256:old
    fi
    ;;
  compose)
    case " $* " in
      *" config --services "*)
        printf '%s\n' typetype typetype-server postgres dragonfly garage
        ;;
      *" ps -a -q "*)
        printf 'container-%s\n' "${*: -1}"
        ;;
      *" exec -T postgres sh -ec "*)
        command="${*: -1}"
        if [[ "$command" == *"SELECT 1 FROM pg_database"* ]]; then
          printf '0\n'
        elif [[ "$command" == *"pg_dump "* ]]; then
          printf 'fake database dump\n'
        fi
        ;;
    esac
    ;;
esac
EOF
chmod +x "$fake_bin/docker"

PATH="$fake_bin:$PATH" \
FAKE_STACK_ROOT="$stack" \
  "$repository/scripts/deploy-stable.sh" "$source_root"

for index in {1..6}; do
  if [[ ! -d "$rollback_root/old-$index" ]]; then
    echo "successful deployment removed existing rollback snapshot old-$index" >&2
    exit 1
  fi
done
snapshot_count="$(find "$rollback_root" -mindepth 1 -maxdepth 1 -type d | wc -l)"
if [[ "$snapshot_count" -ne 7 ]]; then
  echo "expected six existing snapshots and one new snapshot, got $snapshot_count" >&2
  exit 1
fi
