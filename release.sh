#!/bin/bash

# Tree-sitter Craft Release Script
# Creates version tags to trigger automated GitHub Actions release

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "grammar.js" ]; then
    echo -e "${RED}❌ Must be run from the tree-sitter-craft root directory${NC}"
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Working directory is not clean. Please commit or stash changes first.${NC}"
    git status --short
    exit 1
fi

# Get version argument
VERSION=$1

if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Version required${NC}"
    echo "Usage: $0 <version>"
    echo "Examples:"
    echo "  $0 0.2.0    # Create v0.2.0 release"
    echo "  $0 1.0.0    # Create v1.0.0 release"
    echo "  $0 1.1.0-beta.1  # Create v1.1.0-beta.1 pre-release"
    exit 1
fi

# Validate version format (basic semver check)
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
    echo -e "${RED}❌ Invalid version format: $VERSION${NC}"
    echo "Version must follow semver format: MAJOR.MINOR.PATCH[-prerelease]"
    echo "Examples: 1.0.0, 1.2.3, 2.0.0-beta.1"
    exit 1
fi

TAG_NAME="v$VERSION"

# Check if tag already exists
if git tag -l | grep -q "^$TAG_NAME$"; then
    echo -e "${RED}❌ Tag $TAG_NAME already exists${NC}"
    exit 1
fi

echo -e "${BLUE}🏷️  Creating release tag: $TAG_NAME${NC}"

# Create and push tag
git tag $TAG_NAME
git push --tags

echo -e "${GREEN}✅ Release $TAG_NAME created and pushed!${NC}"
echo ""
echo -e "${BLUE}🚀 GitHub Actions will now:${NC}"
echo "  - Extract version from tag and update package.json"
echo "  - Run tests"
echo "  - Build WASM"
echo "  - Publish to npm (if NPM_TOKEN is configured)"
echo "  - Create GitHub release with artifacts"
echo "  - Commit version bump back to main branch"
echo ""
echo -e "${BLUE}🔗 Monitor progress:${NC} https://github.com/tcarcao/tree-sitter-craft/actions"