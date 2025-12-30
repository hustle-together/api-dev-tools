---
name: test-debug
description: Analyze Playwright test failures with screenshots, DOM snapshots, and root cause diagnosis
tools: Bash, Read, Glob, Grep, Task
model: sonnet
---

# Test Debug Skill

Diagnose and debug test failures by analyzing error messages, screenshots, traces, and DOM snapshots to identify root causes.

## When to Use

- When tests fail and you don't know why
- After seeing a failing test report
- When tests pass locally but fail in CI
- To understand flaky test behavior

## Execution Steps

### Step 1: Identify Failed Tests

```bash
# Find recent test failures
ls -la test-results/

# Or parse last test run
cat test-results/.last-run.json 2>/dev/null

# Find Playwright traces
find test-results -name "trace.zip"
```

### Step 2: Gather Failure Context

For each failed test, collect:

1. **Error Message**
   ```bash
   cat test-results/test-name/error.txt
   ```

2. **Screenshot** (if available)
   ```bash
   ls test-results/test-name/*.png
   ```

3. **Trace File** (for Playwright)
   ```bash
   ls test-results/test-name/trace.zip
   ```

4. **Console Logs**
   ```bash
   cat test-results/test-name/console.log
   ```

### Step 3: Analyze Failure

Present structured analysis:

```
═══════════════════════════════════════════════════════
                    TEST FAILURE ANALYSIS
═══════════════════════════════════════════════════════

Test: tests/dashboard.spec.ts:42
Name: "should display user stats after login"

Error Type: TimeoutError
Message: Timeout 30000ms exceeded waiting for selector "[data-testid='stats-card']"

Timeline:
───────────────────────────────────────
00:00 - Navigation to /login
00:02 - Fill email input
00:03 - Fill password input
00:04 - Click submit button
00:05 - Wait for redirect to /dashboard
00:08 - ❌ TIMEOUT waiting for stats-card
───────────────────────────────────────

Screenshot Analysis:
───────────────────────────────────────
The page shows an error message:
"Failed to load user data. Please try again."

This indicates the API call failed, not a selector issue.
───────────────────────────────────────

Root Cause: API Error
───────────────────────────────────────
The test failed because the backend API returned an error,
preventing the stats-card component from rendering.

Likely Causes:
1. Backend server not running during test
2. Test database not seeded with user data
3. API rate limiting triggered during test run
4. Authentication token expired

Suggested Fixes:
1. Ensure test backend is running:
   pnpm test:backend &

2. Seed test database before tests:
   pnpm db:seed:test

3. Check API mock configuration:
   tests/mocks/handlers.ts

4. Add retry logic for flaky API calls:
   await expect(page.getByTestId('stats-card'))
     .toBeVisible({ timeout: 60000 });

═══════════════════════════════════════════════════════
```

### Step 4: Provide Actionable Fix

Based on root cause, suggest specific code changes:

```typescript
// Before (failing)
await expect(page.getByTestId('stats-card')).toBeVisible();

// After (fixed)
// Wait for loading to complete first
await page.waitForLoadState('networkidle');
await expect(page.getByTestId('stats-card')).toBeVisible({ timeout: 60000 });
```

## Failure Categories

| Category | Symptoms | Common Causes |
|----------|----------|---------------|
| Timeout | "Timeout exceeded" | Slow API, missing element |
| Selector | "Cannot find element" | Wrong selector, dynamic ID |
| Assertion | "Expected X, got Y" | Logic error, race condition |
| Network | "NetworkError" | Backend down, CORS |
| Authentication | "401 Unauthorized" | Token expired, wrong env |

## Debug Commands

```bash
# View Playwright trace in browser
npx playwright show-trace test-results/test-name/trace.zip

# Open HTML report
npx playwright show-report

# Run specific test with debug mode
npx playwright test tests/failing.spec.ts --debug

# Run with headed browser to see what's happening
npx playwright test tests/failing.spec.ts --headed
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[test-name]` | Specific test to debug | Latest failed |
| `--trace` | Open trace viewer | false |
| `--headed` | Re-run in headed mode | false |
| `--step` | Step through test | false |

## Examples

```bash
# Debug latest failure
/test-debug

# Debug specific test
/test-debug dashboard-login

# Open trace viewer
/test-debug --trace

# Re-run with visible browser
/test-debug --headed
```

## Output Format

```
═══════════════════════════════════════
Debug Analysis: 🔍 Complete
═══════════════════════════════════════
Failed Test:  dashboard-login
Root Cause:   API Error (backend not running)
Confidence:   High (screenshot shows error message)
Fix Applied:  No (waiting for approval)

Next Steps:
1. Start test backend: pnpm test:backend
2. Re-run test: pnpm test dashboard
═══════════════════════════════════════
```

## Integration

This skill is useful after:
- `/test-e2e` fails
- `/test-all` stops on failure
- CI pipeline fails

## See Also

- `/test-e2e` - Run E2E tests
- `/test-all` - Complete test suite
- `/test-visual` - Visual tests
