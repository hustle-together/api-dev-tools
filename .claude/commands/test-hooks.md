# Test Hooks

Run the hook test suite and report results.

## Instructions

Run the pytest test suite for all Devkit hooks:

```bash
python -m pytest .claude/hooks/tests/ -v --tb=short
```

## What to Report

After running, provide a summary:

1. **Total tests**: How many ran
2. **Passed**: How many succeeded
3. **Failed**: How many failed (with details)
4. **Coverage**: Which hook categories were tested

## Example Output Format

```
Hook Test Results:
✓ 52 tests passed
✗ 0 tests failed

Categories tested:
- Gate hooks (6): research, interview, schema, tdd, verify, docs
- State hooks (5): state-manager, session-manager, registry, reground, capacity
- Quality hooks (5): format, code-review, visual-qa
- Autonomous hooks (3): ralph-loop, auto-answer, notify
- Utility hooks (2): validate-bash, subagent-verify

All hooks functioning correctly.
```

If any tests fail, show the failure details and suggest fixes.
