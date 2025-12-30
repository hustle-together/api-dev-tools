---
name: test-builds
description: Verify builds across all 5 platforms (Web, macOS, Windows, iOS, Android)
tools: Bash, Read, Glob, TodoWrite
model: sonnet
---

# Test Builds Skill

Verify that the application builds successfully across all target platforms.

## When to Use

- Before releasing a new version
- After major dependency updates
- When adding platform-specific features
- As part of CI/CD pipeline verification

## Supported Platforms

| Platform | Build Command | Output |
|----------|---------------|--------|
| Web | `pnpm build` | `.next/` or `dist/` |
| macOS | `pnpm build:mac` | `.dmg` installer |
| Windows | `pnpm build:win` | `.exe` installer |
| iOS | `pnpm build:ios` | `.ipa` bundle |
| Android | `pnpm build:android` | `.apk` or `.aab` |

## Execution Steps

### Step 1: Detect Available Platforms

```bash
# Check package.json for build scripts
cat package.json | grep -E '"build:|"build"'

# Check for Electron (desktop apps)
cat package.json | grep -E "electron|electron-builder"

# Check for Capacitor/React Native (mobile)
cat package.json | grep -E "capacitor|react-native"

# Check for Next.js/Vite (web)
cat package.json | grep -E "next|vite"
```

### Step 2: Run Platform Builds

Execute builds in parallel where possible:

```bash
# Web build (always run first)
pnpm build

# Desktop builds (if Electron detected)
pnpm build:mac &
pnpm build:win &

# Mobile builds (if Capacitor/RN detected)
pnpm build:ios &
pnpm build:android &

wait
```

### Step 3: Verify Build Outputs

Check that expected outputs exist:

```bash
# Web
ls -la .next/ || ls -la dist/

# Desktop
ls -la dist/*.dmg
ls -la dist/*.exe

# Mobile
ls -la ios/App/build/*.ipa
ls -la android/app/build/outputs/apk/
```

### Step 4: TypeScript Check

```bash
# Ensure no type errors
pnpm typecheck || npx tsc --noEmit
```

### Step 5: Bundle Analysis (Web)

```bash
# Check bundle size
npx next build --analyze

# Or for Vite
npx vite-bundle-visualizer
```

## Progress Tracking

```
Build Progress:
───────────────────────────────────────
[✅] Web Build          (12.3s)
[✅] TypeScript Check   (3.2s)
[⏳] macOS Build        (running...)
[⏳] Windows Build      (running...)
[⏳] iOS Build          (queued)
[⏳] Android Build      (queued)
───────────────────────────────────────
```

## Report Format

```
═══════════════════════════════════════════════════════
                    BUILD RESULTS
═══════════════════════════════════════════════════════

┌─────────────┬────────┬──────────┬─────────────────────┐
│ Platform    │ Status │ Duration │ Output              │
├─────────────┼────────┼──────────┼─────────────────────┤
│ Web         │ ✅     │ 12.3s    │ .next/ (4.2 MB)     │
│ TypeScript  │ ✅     │ 3.2s     │ No errors           │
│ macOS       │ ✅     │ 45s      │ app-1.0.0.dmg       │
│ Windows     │ ✅     │ 52s      │ app-1.0.0.exe       │
│ iOS         │ ✅     │ 120s     │ App.ipa             │
│ Android     │ ✅     │ 90s      │ app-release.apk     │
└─────────────┴────────┴──────────┴─────────────────────┘

Bundle Size Analysis (Web):
───────────────────────────────────────
Total: 245 KB (gzipped)
  - First Load JS: 87 KB
  - Shared Chunks: 158 KB

Largest Pages:
  /dashboard   - 42 KB
  /settings    - 28 KB
  /profile     - 15 KB

═══════════════════════════════════════════════════════
                  ✅ ALL BUILDS PASSED
═══════════════════════════════════════════════════════
```

## Failure Handling

```
═══════════════════════════════════════════════════════
                    BUILD FAILED
═══════════════════════════════════════════════════════

Failed: Windows Build

Error:
───────────────────────────────────────
Error: Cannot find module 'electron'
  at Function.Module._resolveFilename
  at Function.Module._load

Suggested Fix:
1. Run: pnpm install electron --save-dev
2. Verify electron-builder config in package.json
3. Check Windows-specific dependencies
───────────────────────────────────────

Successful Builds:
✅ Web
✅ macOS

Skipped (after failure):
⏭️ iOS
⏭️ Android

═══════════════════════════════════════════════════════
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--platform` | Specific platform | All detected |
| `--analyze` | Include bundle analysis | false |
| `--parallel` | Build platforms in parallel | true |

## Examples

```bash
# Build all platforms
/test-builds

# Web only
/test-builds --platform=web

# With bundle analysis
/test-builds --analyze

# Sequential builds (less resource intensive)
/test-builds --no-parallel
```

## Integration

This skill is invoked:
- During `/test-all` as step 4
- Before release workflows
- In CI/CD pipelines

## See Also

- `/test-all` - Complete test suite
- `/test-unit` - Unit tests
- `/test-e2e` - E2E tests
