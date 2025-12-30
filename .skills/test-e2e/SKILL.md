---
name: test-e2e
description: Run Playwright end-to-end tests with cross-browser reporting
tools: Bash, Read, Glob, TodoWrite
model: sonnet
---

# Test E2E Skill

Run Playwright end-to-end tests across browsers with detailed reporting and failure analysis.

## When to Use

- After building a page or user flow
- Before deploying to staging
- When testing authentication flows
- To verify cross-browser compatibility

## Execution Steps

### Step 1: Check Playwright Installation

```bash
# Verify Playwright is installed
npx playwright --version

# Check for playwright.config.ts
ls playwright.config.* 2>/dev/null
```

### Step 2: Start Test Server (if needed)

```bash
# Check if dev server is needed
# Many Playwright configs have webServer configured
cat playwright.config.ts | grep -A10 "webServer"
```

### Step 3: Run E2E Tests

Execute Playwright tests:

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/dashboard.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
```

### Step 4: Handle Failures

If tests fail, gather debugging info:

```bash
# Show HTML report
npx playwright show-report

# Get trace for failed tests
# Traces are in test-results/
```

Provide actionable feedback:

```
❌ E2E Test Failures

1. tests/auth.spec.ts:24
   Test: "should redirect to dashboard after login"

   Issue: Timeout waiting for navigation

   Screenshot: test-results/auth-should-redirect.png
   Trace: test-results/auth-should-redirect/trace.zip

   Suggested Fix:
   - Check if login API is returning correctly
   - Verify redirect URL is correct
   - Increase timeout if server is slow
```

### Step 5: Cross-Browser Summary

Report results per browser:

```
Cross-Browser Results:
───────────────────────────────────
Browser      | Passed | Failed | Skipped
───────────────────────────────────
Chromium     | 24     | 0      | 0
Firefox      | 24     | 0      | 0
WebKit       | 23     | 1      | 0
Mobile Chrome| 22     | 2      | 0
───────────────────────────────────
```

## Viewport Testing

Run tests across 7 viewports:

```typescript
const viewports = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-notch', width: 393, height: 852 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'small-desktop', width: 1280, height: 720 },
  { name: 'desktop', width: 1920, height: 1080 },
];
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[pattern]` | Test file pattern | All tests |
| `--headed` | Run in visible browser | false |
| `--project` | Specific browser | All browsers |
| `--debug` | Enable debug mode | false |
| `--ui` | Open Playwright UI | false |

## Examples

```bash
# Run all E2E tests
/test-e2e

# Run auth tests only
/test-e2e auth

# Debug mode with visible browser
/test-e2e --headed --debug

# Chrome only
/test-e2e --project=chromium
```

## Output Format

```
═══════════════════════════════════════
E2E Test Results: ✅ PASS / ❌ FAIL
═══════════════════════════════════════
Tests:    96 passed, 0 failed (4 browsers)
Duration: 45s
Report:   test-results/playwright-report/
═══════════════════════════════════════
```

## Integration with Page Workflow

This skill is automatically invoked during:
- `/hustle-ui-create-page` Phase 10 (Verification)
- Before PR creation

## See Also

- `/test-unit` - Unit tests
- `/test-visual` - Visual regression
- `/test-debug` - Debug failing tests
