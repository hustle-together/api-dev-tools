---
name: publish
description: Publish npm package with incremental versioning (patch/minor/major). Verifies git status, bumps version, commits, pushes, and publishes. Keywords: npm, publish, version, release, semver
license: MIT
compatibility: Requires npm login, git configured, optional 2FA
metadata:
  version: "1.0.0"
  category: "release"
  tags: ['npm', 'publish', 'version', 'release', 'semver']
  author: "Hustle Together"
allowed-tools: Bash Read Edit AskUserQuestion TodoWrite
---

---

description: Publish npm package with incremental version bump
argument-hint: [patch|minor|major] or [specific-version]

---

## Overview

Publish the npm package with safe, incremental versioning. Defaults to patch bump unless specified otherwise.

## Arguments

- `patch` (default) - Always use 0.0.1 increments (3.12.0 → 3.12.1)
- `minor` - New features, backwards compatible (3.12.0 → 3.13.0) - requires confirmation
- `major` - Breaking changes (3.12.0 → 4.0.0) - requires confirmation
- `X.Y.Z` - Specific version - requires confirmation if jump > 0.0.1

**Default behavior:** Always increment by 0.0.1 (patch) unless explicitly specified otherwise.

Include any of the following info if specified: $ARGUMENTS

## Process

### Phase 1: Pre-flight Checks

1. **Verify clean working directory**
   ```bash
   git status --porcelain
   ```
   - If dirty, ask user to commit or stash changes first
   - Exception: allow `.claude/` runtime files

2. **Check npm login**
   ```bash
   npm whoami
   ```
   - If not logged in, prompt user to run `npm login`

3. **Check current versions**
   ```bash
   # Local version
   node -p "require('./package.json').version"

   # Published version
   npm view $(node -p "require('./package.json').name") version 2>/dev/null || echo "Not yet published"
   ```

4. **Verify on correct branch** (master/main)
   ```bash
   git branch --show-current
   ```

### Phase 2: Version Bump

1. **Determine new version** based on argument:
   - Parse $ARGUMENTS for: patch, minor, major, or X.Y.Z
   - Default to `patch` if not specified
   - Calculate new version from current

2. **Ask for confirmation**
   Use AskUserQuestion:
   - Show current version → new version
   - Ask to confirm or specify different version

3. **Update package.json**
   - Edit version field only
   - Do NOT use `npm version` (it auto-commits)

### Phase 3: Commit and Push

1. **Commit the version bump**
   ```bash
   git add package.json
   git commit -m "chore: bump version to X.Y.Z"
   ```

2. **Push to remote**
   ```bash
   git push origin $(git branch --show-current)
   ```

### Phase 4: Publish

1. **Attempt publish**
   ```bash
   npm publish --access public
   ```

2. **Handle 2FA** (if required)
   - If OTP error, inform user:
     ```
     npm publish --access public --otp=YOUR_CODE
     ```
   - User must run manually with their authenticator code

3. **Verify publication**
   ```bash
   npm view $(node -p "require('./package.json').name") version
   ```

## Example Usage

```bash
# Default patch bump (3.12.0 → 3.12.1)
/publish

# Minor bump (3.12.0 → 3.13.0)
/publish minor

# Major bump (3.12.0 → 4.0.0)
/publish major

# Specific version
/publish 3.15.0
```

## Safety Rules

1. **Never skip version checks** - Always compare local vs published
2. **Never force publish** - If version exists, bump first
3. **Always commit before publish** - Version bump must be in git
4. **Always push before publish** - Remote should match local
5. **0.0.1 increments only** - Default to patch bumps; require confirmation for minor/major
6. **No big jumps** - Any jump > 0.0.1 requires explicit user confirmation

## Error Handling

| Error | Action |
|-------|--------|
| Dirty git status | Ask user to commit/stash |
| Not logged in | Prompt `npm login` |
| Version exists | Bump version first |
| OTP required | Show command with --otp flag |
| Push failed | Check remote access |

## TodoWrite Integration

Initialize with:
```
1. Pre-flight checks (git, npm, versions)
2. Calculate version bump
3. Update package.json
4. Commit and push
5. Publish to npm
6. Verify publication
```
