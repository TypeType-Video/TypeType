#!/usr/bin/env bash
set -euo pipefail

repository="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT

fake_bin="${temporary}/bin"
install_dir="${temporary}/stack"
docker_log="${temporary}/docker.log"
python_log="${temporary}/python.log"
mkdir -p "$fake_bin"

cat > "${fake_bin}/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%q ' "$@" >> "$FAKE_DOCKER_LOG"
printf '\n' >> "$FAKE_DOCKER_LOG"
EOF
chmod +x "${fake_bin}/docker"

cat > "${fake_bin}/python3" <<'EOF'
#!/usr/bin/env bash
printf 'called\n' >> "$FAKE_PYTHON_LOG"
exit 99
EOF
chmod +x "${fake_bin}/python3"

PATH="${fake_bin}:${PATH}" \
FAKE_DOCKER_LOG="$docker_log" \
FAKE_PYTHON_LOG="$python_log" \
  bash "${repository}/scripts/install-stack.sh" \
    --source-dir "$repository" \
    --dir "$install_dir" \
    --download-only \
    --yes > "${temporary}/install.log"

for file in \
  docker-compose.yml \
  docker-compose.arm64.yml \
  .env.example \
  .env \
  scripts/install-stack.sh \
  scripts/bootstrap-env.sh \
  scripts/bootstrap-garage.sh \
  scripts/initialize-stack.sh \
  scripts/run-stack-init.sh \
  scripts/setup-stack.sh \
  scripts/validate-stack.sh; do
  test -s "${install_dir}/${file}"
done

grep -q '^compose version ' "$docker_log"
grep -q 'compose .*config -q ' "$docker_log"
grep -q '\[install\] Download-only complete\.' "${temporary}/install.log"
test ! -e "$python_log"

downloader_access_key="$(grep '^DOWNLOADER_S3_ACCESS_KEY=' "${install_dir}/.env" | cut -d= -f2-)"
downloader_secret_key="$(grep '^DOWNLOADER_S3_SECRET_KEY=' "${install_dir}/.env" | cut -d= -f2-)"
remote_login_token="$(grep '^YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN=' "${install_dir}/.env" | cut -d= -f2-)"
[[ "$downloader_access_key" =~ ^GK[0-9a-f]{24}$ ]]
[[ "$downloader_secret_key" =~ ^[0-9a-f]{64}$ ]]
[[ "$remote_login_token" =~ ^[A-Za-z0-9_-]{64}$ ]]

beta_install_dir="${temporary}/beta-stack"
PATH="${fake_bin}:${PATH}" \
FAKE_DOCKER_LOG="$docker_log" \
FAKE_PYTHON_LOG="$python_log" \
  bash "${repository}/scripts/install-stack.sh" \
    --source-dir "$repository" \
    --dir "$beta_install_dir" \
    --beta \
    --download-only \
    --yes > "${temporary}/beta-install.log"

grep -Fxq 'YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN=http://typetype-beta-server:8080' \
  "$beta_install_dir/.env"
grep -Fxq 'YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL=http://typetype-beta-server:8080' \
  "$beta_install_dir/.env"
grep -Fxq 'TYPETYPE_API_BASE=http://typetype-beta-server:8080' \
  "$beta_install_dir/.env"
grep -Fxq 'TYPETYPE_SERVER_HOST=typetype-beta-server' "$beta_install_dir/.env"
