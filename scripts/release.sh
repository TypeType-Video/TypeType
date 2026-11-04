#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

COMPONENTS=(web server token downloader)
REMOTE_BASE="${TYPETYPE_RELEASE_REMOTE_BASE:-https://github.com/TypeType-Video}"
WORK_DIR="${TYPETYPE_RELEASE_DIR:-${XDG_CACHE_HOME:-${HOME}/.cache}/typetype-release}"
ASSUME_YES=0

usage() {
  cat <<'EOF'
Release the TypeType components with one shared version.

Usage:
  scripts/release.sh status <version>
  scripts/release.sh rc <version> <component>... [--yes]
  scripts/release.sh final <version> [--yes]

Components: web, server, token, downloader, or all.

  status  Show dev, staging and main of every component, and the tags of <version>.
  rc      Move staging to dev and tag the next v<version>-rc.N. The CI publishes
          the <version>-rc.N image and moves the rc tag.
  final   Merge staging into main and tag v<version> in every component, even the
          ones that did not change. The CI publishes <version> and moves latest.
          A component whose staging differs from main needs an rc on its staging.
EOF
}

repository_of() {
  case "$1" in
    web) echo TypeType-Frontend ;;
    server) echo TypeType-Server ;;
    token) echo TypeType-Token ;;
    downloader) echo TypeType-Downloader ;;
    *) echo "Unknown component: $1" >&2; return 1 ;;
  esac
}

fail() {
  echo "[release] $*" >&2
  exit 1
}

log() {
  echo "[release] $*"
}

checkout() {
  local component="$1" repository directory
  repository="$(repository_of "${component}")"
  directory="${WORK_DIR}/${repository}"
  if [[ ! -d "${directory}/.git" ]]; then
    git clone --quiet "${REMOTE_BASE}/${repository}.git" "${directory}"
  fi
  git -C "${directory}" fetch --quiet --prune --prune-tags --tags origin
  echo "${directory}"
}

has_branch() {
  git -C "$1" rev-parse --verify --quiet "refs/remotes/origin/$2" >/dev/null
}

has_tag() {
  git -C "$1" rev-parse --verify --quiet "refs/tags/$2" >/dev/null
}

rc_tags() {
  git -C "$1" tag --list "v$2-rc.*" | sort -t. -k4 -n
}

next_rc() {
  local last
  last="$(rc_tags "$1" "$2" | tail -n1)"
  echo "v$2-rc.$(( ${last##*-rc.} + 1 ))"
}

staging_rc() {
  git -C "$1" tag --points-at origin/staging --list "v$2-rc.*" | sort -t. -k4 -n | tail -n1
}

confirm() {
  if [[ "${ASSUME_YES}" == 1 ]]; then
    return 0
  fi
  local answer
  read -r -p "[release] $1 [y/N] " answer
  [[ "${answer}" == y || "${answer}" == Y ]]
}

validate_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "The version looks like 1.2.3, got $1"
}

expand_components() {
  local component
  for component in "$@"; do
    if [[ "${component}" == all ]]; then
      printf '%s\n' "${COMPONENTS[@]}"
    else
      repository_of "${component}" >/dev/null
      echo "${component}"
    fi
  done
}

status() {
  local version="$1" component directory staging
  for component in "${COMPONENTS[@]}"; do
    directory="$(checkout "${component}")"
    staging=missing
    if has_branch "${directory}" staging; then
      staging="$(git -C "${directory}" rev-parse --short origin/staging)"
    fi
    printf '%-11s dev %s  staging %s  main %s  rc: %s  release: %s\n' "${component}" \
      "$(git -C "${directory}" rev-parse --short origin/dev)" "${staging}" \
      "$(git -C "${directory}" rev-parse --short origin/main)" \
      "$(rc_tags "${directory}" "${version}" | tr '\n' ' ' | sed 's/ $//' || true)" \
      "$(has_tag "${directory}" "v${version}" && echo "v${version}" || echo none)"
  done
}

release_candidate() {
  local version="$1" component directory tag
  shift
  [[ $# -gt 0 ]] || fail "Name the components to release, or all"
  local -a plan=() components=()
  mapfile -t components < <(expand_components "$@")
  [[ ${#components[@]} -eq $# || " $* " == *" all "* ]] || fail "Unknown component in: $*"
  for component in "${components[@]}"; do
    directory="$(checkout "${component}")"
    has_tag "${directory}" "v${version}" && fail "${component} already has v${version}"
    if has_branch "${directory}" staging \
      && ! git -C "${directory}" merge-base --is-ancestor origin/staging origin/dev; then
      fail "${component} staging has commits that are not on dev"
    fi
    if has_branch "${directory}" staging \
      && [[ "$(git -C "${directory}" rev-parse origin/staging)" == "$(git -C "${directory}" rev-parse origin/dev)" ]] \
      && [[ -n "$(staging_rc "${directory}" "${version}")" ]]; then
      fail "${component} staging is already $(staging_rc "${directory}" "${version}") at the tip of dev"
    fi
    tag="$(next_rc "${directory}" "${version}")"
    plan+=("${component}:${tag}")
    log "${component}: staging -> dev $(git -C "${directory}" rev-parse --short origin/dev), tag ${tag}"
  done
  confirm "Push these release candidates?" || fail "Stopped, nothing was pushed"
  local entry
  for entry in "${plan[@]}"; do
    component="${entry%%:*}"
    tag="${entry#*:}"
    directory="${WORK_DIR}/$(repository_of "${component}")"
    git -C "${directory}" push --quiet origin "refs/remotes/origin/dev:refs/heads/staging"
    git -C "${directory}" tag -a "${tag}" -m "TypeType ${tag#v}" origin/dev
    git -C "${directory}" push --quiet origin "refs/tags/${tag}"
    log "${component}: pushed ${tag}"
  done
}

final_release() {
  local version="$1" component directory
  for component in "${COMPONENTS[@]}"; do
    directory="$(checkout "${component}")"
    has_tag "${directory}" "v${version}" && fail "${component} already has v${version}"
    has_branch "${directory}" staging || fail "${component} has no staging branch, run rc first"
    if ! git -C "${directory}" diff --quiet origin/main origin/staging \
      && [[ -z "$(staging_rc "${directory}" "${version}")" ]]; then
      fail "${component} staging differs from main and has no v${version}-rc tag"
    fi
    log "${component}: main <- staging $(git -C "${directory}" rev-parse --short origin/staging), tag v${version}"
  done
  confirm "Release TypeType ${version} in every component?" || fail "Stopped, nothing was pushed"
  for component in "${COMPONENTS[@]}"; do
    directory="${WORK_DIR}/$(repository_of "${component}")"
    git -C "${directory}" checkout --quiet --detach origin/main
    if ! git -C "${directory}" merge-base --is-ancestor origin/staging HEAD; then
      git -C "${directory}" merge --quiet --no-ff origin/staging -m "chore: release ${version}"
    fi
    git -C "${directory}" tag -a "v${version}" -m "TypeType ${version}" HEAD
    git -C "${directory}" push --quiet origin HEAD:refs/heads/main "refs/tags/v${version}"
    log "${component}: released v${version}"
  done
  log "Now publish the TypeType ${version} release notes and tag v${version} in the TypeType repository"
}

main() {
  local -a arguments=()
  local argument
  for argument in "$@"; do
    case "${argument}" in
      --yes) ASSUME_YES=1 ;;
      -h|--help) usage; exit 0 ;;
      *) arguments+=("${argument}") ;;
    esac
  done
  [[ ${#arguments[@]} -ge 2 ]] || { usage >&2; exit 1; }
  local command="${arguments[0]}" version="${arguments[1]}"
  validate_version "${version}"
  mkdir -p "${WORK_DIR}"
  case "${command}" in
    status) status "${version}" ;;
    rc) release_candidate "${version}" "${arguments[@]:2}" ;;
    final) final_release "${version}" ;;
    *) usage >&2; exit 1 ;;
  esac
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
