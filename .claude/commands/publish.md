---
description: Publish npm package with incremental versioning (patch/minor/major)
argument-hint: [patch|minor|major|X.Y.Z]
---

Publish the npm package with safe, incremental versioning.

## Arguments
- `patch` (default) - Bug fixes (1.0.0 → 1.0.1)
- `minor` - New features (1.0.0 → 1.1.0)
- `major` - Breaking changes (1.0.0 → 2.0.0)
- `X.Y.Z` - Specific version

$ARGUMENTS

## Process

1. **Pre-flight checks**
   - Verify clean git status
   - Check npm login (`npm whoami`)
   - Compare local vs published version

2. **Version bump**
   - Calculate new version based on argument
   - Update package.json
   - Commit: `chore: bump version to X.Y.Z`
   - Push to remote

3. **Publish**
   - Run `npm publish --access public`
   - If 2FA required, show: `npm publish --access public --otp=CODE`

4. **Verify**
   - Confirm new version on npm registry

## Safety Rules
- Always commit before publish
- Always push before publish
- Never skip version comparison
- Incremental bumps only (no big jumps without confirmation)
