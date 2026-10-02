#!/usr/bin/env bash
set -euo pipefail

repository="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary=$(mktemp -d)
trap 'rm -rf "$temporary"' EXIT
source "$repository/scripts/registry-sync.sh"
state_root="$temporary/state"

env_file="$temporary/.env"
printf 'KEEP=value\nTYPETYPE_SERVER_IMAGE=old\nTYPETYPE_SERVER_IMAGE=duplicate\n' > "$env_file"
chmod 640 "$env_file"
[[ "$(read_env_value "$env_file" TYPETYPE_SERVER_IMAGE)" == old ]]
write_env_value "$env_file" TYPETYPE_SERVER_IMAGE new
[[ "$(read_env_value "$env_file" TYPETYPE_SERVER_IMAGE)" == new ]]
[[ "$(grep -c '^TYPETYPE_SERVER_IMAGE=' "$env_file")" -eq 1 ]]
grep -Fxq 'KEEP=value' "$env_file"
write_env_value "$env_file" TYPETYPE_TOKEN_IMAGE token
grep -Fxq 'TYPETYPE_TOKEN_IMAGE=token' "$env_file"
[[ "$(stat -c '%a' "$env_file")" == 640 ]]

mkdir "$temporary/bin"
cat > "$temporary/bin/curl" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' 'HTTP/2 200' "docker-content-digest: ${FAKE_DIGEST:-sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef}"
EOF
chmod +x "$temporary/bin/curl"
PATH="$temporary/bin:$PATH"; export PATH
digest=$(manifest_digest typetype/server latest)
[[ "$digest" == sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef ]]
if output=$(FAKE_DIGEST=sha256:bad manifest_digest typetype/server latest); then
  printf '%s\n' 'an invalid registry digest was accepted' >&2
  exit 1
fi

marker="$state_root/failed-beta-server"
signature=registery.typetype.video/typetype/server-beta@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
record_failure "$marker" "$signature"
if retry_allowed "$marker" "$signature"; then
  printf '%s\n' 'a failed digest retry was not delayed' >&2
  exit 1
fi
retry_allowed "$marker" different-image
printf '%s\n' 'registry sync helpers passed'
