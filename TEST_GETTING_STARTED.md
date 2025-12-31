# Test Getting Started - Autonomous Testing Handoff

## Quick Start

You are continuing autonomous testing of api-dev-tools v4.6. Your mission:
**Run ALL tests in TESTING_CHECKLIST.md autonomously, notifying via NTFY throughout.**

```bash
# You're in: /Users/alfonso/Documents/GitHub/api-dev-tools
# Test project: ~/test-api-dev-tools (already set up)
# NTFY Topic: api-dev-tools-test (subscribe at ntfy.sh/api-dev-tools-test)
```

---

## What's Already Done

### Layer 1: Installation Verification ✅ COMPLETE
| Component | Expected | Verified |
|-----------|----------|----------|
| Commands | 30 | 30 ✅ |
| Skills | 44 | 44 ✅ |
| Hooks | 64 | 64 ✅ |
| Agents | 9 | 9 ✅ |
| Settings registered | 53 hooks | ✅ |
| Python syntax | All compile | ✅ |

### Infrastructure Setup ✅ COMPLETE
- NTFY configured in `templates/hustle-build-defaults.json`
- NTFY topic: `api-dev-tools-test`
- `session-logger.py` now sends notifications on session end
- `hook_utils.py` has `get_ntfy_config()` and `send_ntfy_notification()`
- Test project exists at `~/test-api-dev-tools` with all files copied

### Commits Made
1. `88268fb` - v4.6 Complete - Prior to Autonomous Testing
2. `ebfa539` - docs: Add Testing & Quality Assurance section to README
3. `0ed3858` - feat: Add NTFY notification support to hooks

---

## What Needs Testing

### Layer 2: Workflow Tests (2-3 hours)
Run these in `~/test-api-dev-tools`:

```bash
# Test 2.1: Full /api-create workflow
cd ~/test-api-dev-tools
claude --print "Run /api-create test-weather-api. Use recommended options."

# Verify 14 phases execute:
# 1. Disambiguation, 2. Scope, 3. Initial Research, 4. Interview
# 5. Deep Research, 6. Schema, 7. Environment, 8. TDD Red
# 9. TDD Green, 10. Verify, 11. Code Review, 12. Refactor
# 13. Documentation, 14. Completion

# Check state after:
cat .claude/api-dev-state.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin),indent=2))"
```

### Layer 3: Standalone Skills (1-2 hours)
Test these individually:

```bash
# Git skills
claude --print "Run /commit"
claude --print "Run /pr"

# TDD skills
claude --print "Run /red 'add validation'"
claude --print "Run /green"
claude --print "Run /refactor"

# Testing skills
claude --print "Run /test-unit"
claude --print "Run /test-all"

# Planning skills
claude --print "Run /plan 'add feature'"
claude --print "Run /gap"
claude --print "Run /summarize"
```

### Layer 4: Hook Verification (30 min)
Verify hooks fire by checking logs:

```bash
# Check workflow logs (hooks write here)
cat .claude/workflow-logs/*.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Events: {len(d.get(\"events\",[]))}')"

# Verify enforcement hooks block correctly
# Try writing without research - should be blocked
claude --print "Write a file to src/test.ts with content 'hello'"
# Should see: "BLOCKED: Research required before implementation"
```

---

## How to Send Notifications

```bash
# Send progress update
curl -s -H "Title: 🔄 Testing Progress" -H "Tags: robot" \
  -d "Layer 2 complete. Starting Layer 3." \
  https://ntfy.sh/api-dev-tools-test

# Send error
curl -s -H "Title: ❌ Test Failed" -H "Priority: high" -H "Tags: warning" \
  -d "Skill /api-create failed at phase 8. Check logs." \
  https://ntfy.sh/api-dev-tools-test

# Send completion
curl -s -H "Title: ✅ All Tests Complete" -H "Priority: high" -H "Tags: white_check_mark" \
  -d "100% pass rate. See TESTING_CHECKLIST.md for details." \
  https://ntfy.sh/api-dev-tools-test
```

---

## Key Files to Read

| File | Purpose |
|------|---------|
| `TESTING_CHECKLIST.md` | Complete list of 150+ behaviors to verify |
| `AUTONOMOUS_TESTING.md` | Architecture for self-healing test runner |
| `templates/hustle-build-defaults.json` | Config with NTFY settings |
| `.claude/workflow-logs/*.json` | Hook event logs |
| `hooks/hook_utils.py` | Shared utilities including NTFY functions |

---

## Test Execution Pattern

For each test:

1. **Announce** - Send NTFY notification before starting
2. **Execute** - Run the test via `claude --print` or direct command
3. **Verify** - Check outputs, logs, state files
4. **Log** - Record pass/fail in a results file
5. **Notify** - Send NTFY with result

Example:

```bash
# Announce
curl -s -H "Title: Testing /commit skill" -d "Starting..." https://ntfy.sh/api-dev-tools-test

# Execute
OUTPUT=$(cd ~/test-api-dev-tools && claude --print "Run /commit" 2>&1)

# Verify
if echo "$OUTPUT" | grep -q "commit"; then
  RESULT="PASS"
else
  RESULT="FAIL"
fi

# Log
echo "$(date): /commit - $RESULT" >> ~/test-api-dev-tools/.claude/test-results.log

# Notify
curl -s -H "Title: /commit - $RESULT" -d "$OUTPUT" https://ntfy.sh/api-dev-tools-test
```

---

## Ralph Wiggum Pattern for Failures

If a test fails, loop to fix it:

```
1. Identify failure
2. Analyze error
3. Attempt fix (if code issue)
4. Re-run test
5. If still fails after 3 attempts, log and notify, move on
```

The hooks use `max_iterations: 25` in defaults. After that, emit a "promise" to return later.

---

## Expected Duration

| Layer | Tests | Time |
|-------|-------|------|
| Layer 2: Workflows | 6 workflows | 2-3 hrs |
| Layer 3: Skills | 35+ skills | 1-2 hrs |
| Layer 4: Hooks | 64 hooks | 30 min |
| **Total** | 150+ | **4-6 hrs** |

---

## Success Criteria

All tests pass when:
- [ ] All 14 phases of /api-create complete
- [ ] All 35+ standalone skills execute
- [ ] All 64 hooks fire at correct times
- [ ] No blocking errors in workflow logs
- [ ] NTFY notifications received throughout

---

## If You Get Stuck

1. Check `.claude/workflow-logs/*.json` for error details
2. Check `.claude/api-dev-state.json` for current state
3. Send NTFY notification with the error
4. Try a simpler test to isolate the issue
5. Document the failure and move to next test

---

## Start Testing Now

```bash
cd ~/test-api-dev-tools

# Send start notification
curl -s -H "Title: 🚀 Autonomous Testing Started" -H "Priority: high" \
  -d "Running full test suite. ETA: 4-6 hours." \
  https://ntfy.sh/api-dev-tools-test

# Begin with Layer 2 - Full workflow test
claude --print "Run /api-create weather-forecast. Use recommended options for all questions."
```

Good luck! Send notifications throughout so the user knows you're working.
