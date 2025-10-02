# Publishing Guide

This guide covers how to publish tree-sitter-craft to npm and create GitHub releases with artifacts.

## Automated Publishing (Recommended)

The repository is set up with GitHub Actions for automated publishing when you create a new tag.

### Creating a Release

1. **Update version in package.json**:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Push the tag**:
   ```bash
   git push origin main --tags
   ```

3. **Automated process will**:
   - Run tests
   - Build WASM module
   - Publish to npm
   - Create GitHub release with artifacts

## Manual Publishing

If you need to publish manually or set up the automation:

### Prerequisites

1. **npm account**: Create account at [npmjs.com](https://www.npmjs.com)
2. **npm authentication**: 
   ```bash
   npm login
   ```
3. **GitHub token**: For release creation (if doing manual releases)

### Manual npm Publishing

1. **Prepare the package**:
   ```bash
   npm install
   npm run generate
   npm test
   npm run build-wasm
   ```

2. **Verify package contents**:
   ```bash
   npm pack --dry-run
   ```

3. **Publish to npm**:
   ```bash
   npm publish
   ```

### Manual GitHub Release

1. **Create a tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Build artifacts**:
   ```bash
   npm run build-wasm
   npm pack
   ```

3. **Create release via GitHub CLI**:
   ```bash
   gh release create v1.0.0 \
     --title "Release v1.0.0" \
     --notes "Release notes here" \
     tree-sitter-craft.wasm \
     tree-sitter-craft-1.0.0.tgz
   ```

## Setting Up Automation

### Required Secrets

Add these secrets to your GitHub repository:

1. **NPM_TOKEN**: 
   - Get from [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
   - Create "Automation" token
   - Add to GitHub repository secrets

2. **GITHUB_TOKEN**: 
   - Automatically available in GitHub Actions
   - No setup required

### First-time Setup

1. **Initialize npm package**:
   ```bash
   npm login
   npm whoami  # verify login
   ```

2. **Test publishing** (optional):
   ```bash
   npm publish --dry-run
   ```

3. **Create first release**:
   ```bash
   npm version 1.0.0
   git push origin main --tags
   ```

## Release Artifacts

Each release includes:

- **npm package**: Installable via `npm install tree-sitter-craft@version`
- **WASM module**: `tree-sitter-craft.wasm` for browser use
- **Source tarball**: Complete source code package

## Troubleshooting

### npm publish fails

- **Authentication**: Run `npm login` and verify with `npm whoami`
- **Version conflict**: Version already exists, increment version number
- **Package name**: Name might be taken, check availability with `npm view tree-sitter-craft`

### GitHub Actions fails

- **NPM_TOKEN**: Verify token is valid and has publish permissions
- **Tests failing**: Fix tests before publishing
- **WASM build fails**: Ensure tree-sitter CLI is properly installed

### WASM module issues

- **Missing tree-sitter CLI**: Install with `npm install -g tree-sitter-cli`
- **Build errors**: Check grammar.js syntax
- **Size issues**: WASM files are typically 100-500KB

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.1): Bug fixes, documentation updates
- **MINOR** (1.1.0): New grammar features, additional queries
- **MAJOR** (2.0.0): Breaking grammar changes, API changes

## Testing Before Release

Always test locally before publishing:

```bash
# Full test suite
npm test

# Test WASM build
npm run build-wasm

# Test package contents
npm pack --dry-run

# Test installation locally
npm pack
npm install -g tree-sitter-craft-1.0.0.tgz
```