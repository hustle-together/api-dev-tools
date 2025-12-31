---
name: test-builds
description: Verify web builds and cross-browser compatibility (Chrome, Firefox, Safari/WebKit)
tools: Bash, Read, Glob, TodoWrite
model: sonnet
---

# Test Builds Skill

Verify that the application builds successfully and runs correctly across all major browsers.

> **Note:** This skill focuses on **web builds and browser testing**. For native desktop
> (Tauri/Electron) or mobile (Capacitor) builds, those should be tested separately
> as they theoretically work with the same web code but require native toolchains.

## Philosophy

If your app works in Chrome, Firefox, and Safari (WebKit), it will work in:
- **Tauri** - Uses system WebView (WebKit on macOS, Chromium on Windows/Linux)
- **Capacitor** - Uses WKWebView (iOS) and Android WebView (Chromium)
- **Electron** - Bundles Chromium
- **PWA** - Runs in user's browser

Therefore, comprehensive browser testing = comprehensive platform coverage.

## When to Use

- Before releasing a new version
- After major dependency updates
- After CSS/layout changes
- As part of CI/CD pipeline verification

## Execution Steps

### Step 1: Web Build Verification

```bash
# Build the Next.js/Vite application
pnpm build

# Verify output exists
ls -la .next/ || ls -la dist/

# TypeScript check
pnpm typecheck || npx tsc --noEmit
```

### Step 2: Cross-Browser Testing with Playwright

```bash
# Run E2E tests across all 3 browser engines
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Or all at once
npx playwright test
```

**Browser Coverage:**

| Browser Engine | Covers | Test Project |
|----------------|--------|--------------|
| **Chromium** | Chrome, Edge, Opera, Brave, Android WebView | `--project=chromium` |
| **Firefox** | Firefox, Firefox ESR | `--project=firefox` |
| **WebKit** | Safari, iOS Safari, WKWebView | `--project=webkit` |

### Step 3: PWA Compliance Check (if applicable)

```bash
# Check if manifest.json exists and is valid
cat public/manifest.json | jq .

# Verify service worker registration
grep -r "serviceWorker" src/

# Check for required PWA assets
ls -la public/icon-*.png
```

### Step 4: Bundle Analysis

```bash
# Next.js bundle analysis
ANALYZE=true pnpm build

# Or Vite bundle visualizer
npx vite-bundle-visualizer
```

## Report Format

```
═══════════════════════════════════════════════════════
                    BUILD RESULTS
═══════════════════════════════════════════════════════

Web Build:
┌─────────────┬────────┬──────────┬─────────────────────┐
│ Step        │ Status │ Duration │ Details             │
├─────────────┼────────┼──────────┼─────────────────────┤
│ Build       │ ✅     │ 12.3s    │ .next/ (4.2 MB)     │
│ TypeScript  │ ✅     │ 3.2s     │ No errors           │
│ ESLint      │ ✅     │ 5.1s     │ No warnings         │
└─────────────┴────────┴──────────┴─────────────────────┘

Cross-Browser Testing:
┌─────────────┬────────┬──────────┬─────────────────────┐
│ Browser     │ Status │ Tests    │ Coverage            │
├─────────────┼────────┼──────────┼─────────────────────┤
│ Chromium    │ ✅     │ 45/45    │ Chrome, Edge, Brave │
│ Firefox     │ ✅     │ 45/45    │ Firefox             │
│ WebKit      │ ✅     │ 45/45    │ Safari, iOS Safari  │
└─────────────┴────────┴──────────┴─────────────────────┘

Bundle Size Analysis:
───────────────────────────────────────
Total: 245 KB (gzipped)
  - First Load JS: 87 KB
  - Shared Chunks: 158 KB

Platform Compatibility:
───────────────────────────────────────
✅ Chromium-based apps (Tauri Win/Linux, Capacitor Android, Electron)
✅ WebKit-based apps (Tauri macOS, Capacitor iOS)
✅ PWA (all browsers)

Note: Native builds (Tauri/Capacitor) should be tested separately
with their respective toolchains if using native features.

═══════════════════════════════════════════════════════
              ✅ ALL BROWSER TESTS PASSED
═══════════════════════════════════════════════════════
```

## Native Platform Notes

### If You Use Tauri (Desktop)

```bash
# Install Tauri CLI
pnpm add -D @tauri-apps/cli

# Test desktop build (requires Rust)
pnpm tauri build --debug

# Platforms:
# - macOS: Uses WebKit (tested via Playwright webkit)
# - Windows/Linux: Uses WebView2/Chromium (tested via Playwright chromium)
```

### If You Use Capacitor (Mobile)

```bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/ios @capacitor/android

# Sync web assets to native projects
npx cap sync

# Platforms:
# - iOS: Uses WKWebView (tested via Playwright webkit)
# - Android: Uses Android WebView (tested via Playwright chromium)
```

### Why We Don't Build These By Default

1. **Requires native toolchains** - Xcode, Android Studio, Rust
2. **LLM interpretation varies** - Native setup is complex, error-prone
3. **Web testing is sufficient** - If it works in browsers, it works in webviews
4. **Separation of concerns** - Web build vs native packaging

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--browsers` | Specific browsers to test | All 3 |
| `--analyze` | Include bundle analysis | false |
| `--pwa` | Check PWA compliance | auto-detect |

## Examples

```bash
# Full build + all browsers
/test-builds

# Quick check (Chromium only)
/test-builds --browsers=chromium

# With bundle analysis
/test-builds --analyze

# PWA compliance check
/test-builds --pwa
```

## Integration

This skill is invoked:
- During `/test-all` as step 4
- Before release workflows
- In CI/CD pipelines

## See Also

- `/test-all` - Complete test suite
- `/test-e2e` - E2E tests (uses same Playwright)
- `/test-visual` - Visual regression
