#!/usr/bin/env bash
set -euo pipefail

repository="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary=$(mktemp -d)
trap 'rm -rf "$temporary"' EXIT
export GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=test@example.com
export GIT_COMMITTER_NAME=test GIT_COMMITTER_EMAIL=test@example.com
export TYPETYPE_RELEASE_REMOTE_BASE="$temporary/remotes"
export TYPETYPE_RELEASE_DIR="$temporary/work"
release="$repository/scripts/release.sh"

for name in TypeType-Frontend TypeType-Server TypeType-Token TypeType-Downloader; do
  git init --quiet --bare -b main "$temporary/remotes/$name.git"
  seed="$temporary/seed/$name"
  git init --quiet -b main "$seed"
  git -C "$seed" commit --quiet --allow-empty -m "one"
  git -C "$seed" branch dev
  git -C "$seed" push --quiet "$temporary/remotes/$name.git" main dev
done

commit_on_dev() {
  local name="$1" seed="$temporary/seed/$1"
  git -C "$seed" checkout --quiet dev
  git -C "$seed" pull --quiet "$temporary/remotes/$name.git" dev
  git -C "$seed" commit --quiet --allow-empty -m "$2"
  git -C "$seed" push --quiet "$temporary/remotes/$name.git" dev
}

remote_tags() {
  git --git-dir "$temporary/remotes/$1.git" tag --list | tr '\n' ' '
}

fails() {
  if "$@" >/dev/null 2>&1; then
    echo "expected a failure: $*" >&2
    exit 1
  fi
}

remote_ref() {
  git --git-dir "$temporary/remotes/$1.git" rev-parse "$2"
}

fails "$release" rc 1.16 web --yes
fails "$release" rc 1.16.0 desktop --yes
fails "$release" final 1.16.0 --yes

commit_on_dev TypeType-Frontend "web change"
"$release" rc 1.16.0 web --yes >/dev/null
[[ "$(remote_tags TypeType-Frontend)" == "v1.16.0-rc.1 " ]]
[[ "$(remote_ref TypeType-Frontend staging)" == "$(remote_ref TypeType-Frontend dev)" ]]
fails "$release" rc 1.16.0 web --yes

commit_on_dev TypeType-Frontend "web fix"
"$release" rc 1.16.0 web --yes >/dev/null
[[ "$(remote_tags TypeType-Frontend)" == "v1.16.0-rc.1 v1.16.0-rc.2 " ]]

fails "$release" final 1.16.0 --yes
"$release" rc 1.16.0 server token downloader --yes >/dev/null

commit_on_dev TypeType-Server "server change after rc"
status_output="$("$release" status 1.16.0)"
grep -q '^web .*rc: v1.16.0-rc.1 v1.16.0-rc.2  release: none$' <<< "$status_output"
"$release" final 1.16.0 --yes >/dev/null

for name in TypeType-Frontend TypeType-Server TypeType-Token TypeType-Downloader; do
  [[ " $(remote_tags "$name")" == *" v1.16.0 "* ]]
  [[ "$(remote_ref "$name" 'v1.16.0^{commit}')" == "$(remote_ref "$name" main)" ]]
  [[ "$(remote_ref "$name" main)" == "$(remote_ref "$name" staging)" ]]
  git --git-dir "$temporary/remotes/$name.git" merge-base --is-ancestor main dev
done
fails git --git-dir "$temporary/remotes/TypeType-Server.git" merge-base --is-ancestor dev main
fails "$release" final 1.16.0 --yes

seed="$temporary/seed/TypeType-Downloader"
git -C "$seed" fetch --quiet "$temporary/remotes/TypeType-Downloader.git" main
git -C "$seed" checkout --quiet -B main FETCH_HEAD
git -C "$seed" commit --quiet --allow-empty -m "fix pushed straight to main"
git -C "$seed" push --quiet "$temporary/remotes/TypeType-Downloader.git" main
"$release" rc 1.17.0 all --yes >/dev/null
fails "$release" final 1.17.0 --yes
[[ " $(remote_tags TypeType-Frontend)" != *" v1.17.0 "* ]]

commit_on_dev TypeType-Token "token change"
seed="$temporary/seed/TypeType-Token"
git -C "$seed" fetch --quiet "$temporary/remotes/TypeType-Token.git" staging
git -C "$seed" checkout --quiet -B staging FETCH_HEAD
git -C "$seed" commit --quiet --allow-empty -m "hotfix only on staging"
git -C "$seed" push --quiet "$temporary/remotes/TypeType-Token.git" staging
fails "$release" rc 1.17.0 token --yes

echo "release tests passed"
