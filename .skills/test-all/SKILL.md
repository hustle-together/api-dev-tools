---
name: test-all
description: Run comprehensive test suite - unit, e2e, visual, builds, and code review
tools: Bash, Read, Glob, TodoWrite, Task
model: sonnet
---

# Test All Skill

Run the complete test suite in sequence: unit tests, E2E tests, visual tests, build verification, and code review.

## When to Use

- Before creating a pull request
- After completing a major feature
- Before deploying to production
- As a final verification step

## Execution Sequence

```
┌──────────────────────────────────────────────────┐
│                   /test-all                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Unit Tests (/test-unit)                      │
│     └─→ If fails: Stop and report               │
│                                                  │
│  2. E2E Tests (/test-e2e)                        │
│     └─→ If fails: Stop and report               │
│                                                  │
│  3. Visual Tests (/test-visual)                  │
│     └─→ If fails: Stop and report               │
│                                                  │
│  4. Build Verification (/test-builds)            │
│     └─→ If fails: Stop and report               │
│                                                  │
│  5. Code Review (/test-review)                   │
│     └─→ Report findings (doesn't block)         │
│                                                  │
│  ✅ All Passed → Ready for PR                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Execution Steps

### Step 1: Unit Tests

```bash
# Run unit tests with coverage
pnpm test:coverage
```

**Gate:** Must pass before continuing.

### Step 2: E2E Tests

```bash
# Run Playwright tests
npx playwright test
```

**Gate:** Must pass before continuing.

### Step 3: Visual Tests

```bash
# Run visual regression
pnpm test-storybook
```

**Gate:** Must pass before continuing.

### Step 4: Build Verification

```bash
# Verify all platforms build
pnpm build

# TypeScript check
pnpm typecheck
```

**Gate:** Must pass before continuing.

### Step 5: Code Review

Spawn code-reviewer agent for analysis:

```
Task({
  subagent_type: "code-reviewer",
  prompt: "Review recent changes for security, performance, and best practices"
})
```

**Note:** Findings are reported but don't block.

## Progress Tracking

Use TodoWrite for visibility:

```
[ ] Unit Tests
[ ] E2E Tests
[ ] Visual Tests
[ ] Build Verification
[ ] Code Review
```

## Report Format

```
═══════════════════════════════════════════════════════
                    TEST SUITE RESULTS
═══════════════════════════════════════════════════════

┌─────────────────┬────────┬──────────┬───────────────┐
│ Suite           │ Status │ Duration │ Details       │
├─────────────────┼────────┼──────────┼───────────────┤
│ Unit Tests      │ ✅     │ 3.2s     │ 42 passed     │
│ E2E Tests       │ ✅     │ 45s      │ 96 passed     │
│ Visual Tests    │ ✅     │ 28s      │ 84 screenshots│
│ Build           │ ✅     │ 12s      │ All platforms │
│ Code Review     │ ⚠️     │ 5s       │ 2 suggestions │
└─────────────────┴────────┴──────────┴───────────────┘

Total Duration: 1m 33s

Code Review Findings:
1. [Minor] Consider memoizing expensive calculation in Dashboard
2. [Suggestion] Add rate limiting to public API endpoints

═══════════════════════════════════════════════════════
                  ✅ READY FOR PR
═══════════════════════════════════════════════════════
```

## Failure Handling

When a suite fails, stop immediately and report:

```
═══════════════════════════════════════════════════════
                    TEST SUITE FAILED
═══════════════════════════════════════════════════════

Failed at: E2E Tests

✅ Unit Tests     - 42 passed
❌ E2E Tests      - 1 failed

Failure Details:
─────────────────────────────────────────────────────
Test: tests/auth.spec.ts:24
Name: "should redirect after login"
Error: Timeout waiting for navigation

Screenshot: test-results/auth-should-redirect.png
Trace: test-results/auth-should-redirect/trace.zip

Suggested Fix:
- Check login API response
- Verify redirect URL configuration
─────────────────────────────────────────────────────

Remaining suites skipped:
- Visual Tests
- Build Verification
- Code Review

Fix the failure and run /test-all again.
═══════════════════════════════════════════════════════
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--skip-visual` | Skip visual tests | false |
| `--skip-review` | Skip code review | false |
| `--continue-on-fail` | Don't stop on failure | false |

## Examples

```bash
# Run complete suite
/test-all

# Skip visual tests (faster)
/test-all --skip-visual

# Continue even if tests fail
/test-all --continue-on-fail
```

## Integration

This is typically the final step before:
- `/commit` - Create commit
- `/pr` - Create pull request

## See Also

- `/test-unit` - Unit tests only
- `/test-e2e` - E2E tests only
- `/test-visual` - Visual tests only
- `/test-builds` - Build verification only
- `/test-review` - Code review only
