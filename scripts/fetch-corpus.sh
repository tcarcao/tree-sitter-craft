#!/usr/bin/env bash
# Fetch .craft corpus files from the pinned craft ref (CORPUS_VERSION).
# Output goes to test/corpus-from-craft/ — only .craft files, no goldens.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORPUS_VERSION_FILE="$REPO_ROOT/CORPUS_VERSION"

if [[ ! -f "$CORPUS_VERSION_FILE" ]]; then
  echo "Error: CORPUS_VERSION not found at $CORPUS_VERSION_FILE" >&2
  exit 1
fi

CORPUS_VERSION="$(tr -d '[:space:]' < "$CORPUS_VERSION_FILE")"
VERSION_WITHOUT_V="${CORPUS_VERSION#v}"
TARBALL_URL="https://github.com/tcarcao/craft/archive/refs/tags/${CORPUS_VERSION}.tar.gz"
OUT_DIR="$REPO_ROOT/test/corpus-from-craft"

echo "Fetching Craft corpus at ${CORPUS_VERSION} from ${TARBALL_URL}..."

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

curl -fsSL "$TARBALL_URL" | tar xz -C "$TMP_DIR"

EXTRACTED="$TMP_DIR/craft-${VERSION_WITHOUT_V}/testdata/corpus"
if [[ ! -d "$EXTRACTED" ]]; then
  echo "Error: corpus directory not found in archive at craft-${VERSION_WITHOUT_V}/testdata/corpus" >&2
  exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy only .craft files (not goldens) to keep tree-sitter independent of CraftDoc schema
find "$EXTRACTED" -name '*.craft' | while IFS= read -r f; do
  rel="${f#$EXTRACTED/}"
  dest_dir="$OUT_DIR/$(dirname "$rel")"
  mkdir -p "$dest_dir"
  cp "$f" "$dest_dir/"
done

COUNT="$(find "$OUT_DIR" -name '*.craft' | wc -l | tr -d ' ')"
echo "Done: ${COUNT} .craft files fetched to $OUT_DIR"
