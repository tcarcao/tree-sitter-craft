#!/bin/bash

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[release]${NC} $*"; }
warn() { echo -e "${YELLOW}[release]${NC} $*"; }
err()  { echo -e "${RED}[release]${NC} $*"; }

usage() {
  echo "Usage: $0 <patch|minor|major>"
  echo ""
  echo "  patch   Bump patch version (e.g. 0.1.6 → 0.1.7)"
  echo "  minor   Bump minor version (e.g. 0.1.6 → 0.2.0)"
  echo "  major   Bump major version (e.g. 0.1.6 → 1.0.0)"
  exit 0
}

BUMP="$1"
case "$BUMP" in
  patch|minor|major) ;;
  -h|--help) usage ;;
  *) err "Usage: $0 <patch|minor|major>"; exit 1 ;;
esac

# Must be on main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" ]]; then
  err "Not on main (current branch: $BRANCH). Release from main."
  exit 1
fi

# Clean working tree (allow untracked files)
if ! git diff --quiet HEAD --; then
  err "Working tree has uncommitted changes. Commit or stash them first."
  git status -sb
  exit 1
fi

# Check for unpulled commits
if git rev-parse --verify origin/main &>/dev/null; then
  AHEAD=$(git rev-list --count HEAD..origin/main)
  if [[ "$AHEAD" -gt 0 ]]; then
    warn "You are behind origin/main by $AHEAD commit(s). Consider: git pull --rebase origin main"
    read -r -p "Continue anyway? [y/N] " r
    [[ "${r,,}" != "y" && "${r,,}" != "yes" ]] && exit 1
  fi
fi

CURRENT_VERSION=$(node -p "require('./package.json').version")
info "Current version: $CURRENT_VERSION  (bump: $BUMP)"

read -r -p "Proceed? [y/N] " r
[[ "${r,,}" != "y" && "${r,,}" != "yes" ]] && { info "Aborted."; exit 0; }

info "Bumping version..."
npm version "$BUMP" -m "v%s"

info "Pushing main and tag..."
git push origin main --follow-tags

NEW_VERSION=$(node -p "require('./package.json').version")
echo ""
info "Done. GitHub Actions will now publish tree-sitter-craft@${NEW_VERSION} to npm."
echo ""
echo "Monitor: https://github.com/$(git remote get-url origin | sed -E 's/.*[:/]([^/]+\/[^/.]+)(\.git)?$/\1/')/actions"
