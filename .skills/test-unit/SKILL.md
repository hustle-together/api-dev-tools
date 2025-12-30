---
name: test-unit
description: Run Vitest unit tests with coverage and actionable reporting
tools: Bash, Read, Glob, TodoWrite
model: sonnet
---

# Test Unit Skill

Run Vitest unit tests with detailed coverage reporting and actionable feedback.

## When to Use

- After implementing a feature (TDD Green phase)
- Before committing changes
- When debugging test failures
- To check test coverage

## Execution Steps

### Step 1: Detect Test Configuration

Check for test configuration:
```bash
# Check for vitest.config.ts or vite.config.ts
ls -la vitest.config.* vite.config.* 2>/dev/null || echo "No config found"

# Check package.json for test script
cat package.json | grep -A5 '"scripts"' | grep test
```

### Step 2: Run Tests

Execute the appropriate test command:

```bash
# If pnpm is available
pnpm test

# Or with coverage
pnpm test:coverage

# Or run specific file
pnpm test -- path/to/file.test.ts
```

### Step 3: Parse Results

After tests complete, analyze the output:

1. **If all tests pass:**
   ```
   ✅ All tests passing

   Summary:
   - Tests: 42 passed
   - Duration: 3.2s
   - Coverage: 85%
   ```

2. **If tests fail:**
   ```
   ❌ Test failures detected

   Failed Tests:
   1. src/components/Button.test.tsx
      - "should render with loading state"
      - Expected: spinner to be visible
      - Received: spinner not found

   Suggested Fix:
   - Check if isLoading prop is being passed
   - Verify Spinner component is imported
   ```

### Step 4: Coverage Analysis

If coverage is enabled, report:

```
Coverage Report:
─────────────────────────────────────
File                    | Stmts | Branch | Funcs | Lines
─────────────────────────────────────
src/lib/api.ts         | 92%   | 85%    | 100%  | 92%
src/components/...     | 78%   | 70%    | 90%   | 78%
─────────────────────────────────────

⚠️ Files below 80% coverage:
- src/utils/helpers.ts (65%)
- src/hooks/useAuth.ts (72%)
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[pattern]` | Test file pattern to match | All tests |
| `--coverage` | Include coverage report | false |
| `--watch` | Run in watch mode | false |
| `--ui` | Open Vitest UI | false |

## Examples

```bash
# Run all tests
/test-unit

# Run tests for specific file
/test-unit Button

# Run with coverage
/test-unit --coverage

# Watch mode for development
/test-unit --watch
```

## Output Format

Always end with a clear status:

```
═══════════════════════════════════════
Unit Test Results: ✅ PASS / ❌ FAIL
═══════════════════════════════════════
Tests:    42 passed, 0 failed
Duration: 3.2s
Coverage: 85% (target: 80%)
═══════════════════════════════════════
```

## Integration with TDD Workflow

This skill is automatically invoked during:
- Phase 9 (TDD Green) - After implementation
- Phase 12 (Refactor) - After cleanup

## See Also

- `/test-e2e` - End-to-end tests
- `/test-visual` - Visual regression tests
- `/test-all` - Run all test suites
