---
name: ralph-loop
description: Start an autonomous loop with completion promise detection (Ralph Wiggum pattern)
license: MIT
compatibility: Requires Claude Code with completion-promise-detector hook
metadata:
  version: "1.0.0"
  category: "autonomous"
  tags: ["ralph-wiggum", "autonomous", "loop", "continuous"]
  author: "Hustle Together"
  references:
    - https://ghuntley.com/ralph/
    - docs/CLAUDE_CODE_BEST_PRACTICES.md
allowed-tools: Bash Read Write Edit Grep Glob Task TodoWrite AskUserQuestion
---

# Ralph Wiggum Autonomous Loop

Start a self-terminating autonomous loop. The agent works continuously until it outputs a completion promise signal, then gracefully stops.

## Usage

```
/ralph-loop [task description]
/ralph-loop --promise [CUSTOM] [task description]
/ralph-loop --max [N] [task description]
/ralph-continue
/ralph-status
```

## Arguments

- `$ARGUMENTS` - The task to complete autonomously
- `--promise [WORD]` - Custom completion word (default: DONE)
- `--max [N]` - Maximum iterations before forced stop (safety net)

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   RALPH WIGGUM PATTERN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    AUTONOMOUS LOOP                        │  │
│  │                                                           │  │
│  │   1. Agent works on task                                  │  │
│  │   2. Agent self-evaluates progress                        │  │
│  │   3. If done → Output <promise>DONE</promise>            │  │
│  │   4. If not done → Continue working                       │  │
│  │   5. Hook detects promise → Graceful termination          │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              COMPLETION PROMISE DETECTOR                  │  │
│  │                                                           │  │
│  │   Monitors all tool outputs for:                          │  │
│  │   - <promise>DONE</promise>                              │  │
│  │   - <promise>FIXED</promise>                             │  │
│  │   - <promise>COMPLETE</promise>                          │  │
│  │   - Custom promises via --promise flag                    │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Built-in Completion Promises

| Promise | Use Case |
|---------|----------|
| `DONE` / `COMPLETE` / `FINISHED` | General task completion |
| `FIXED` / `RESOLVED` / `SOLVED` | Bug fixing |
| `REFACTORED` / `CLEANED` / `IMPROVED` | Code improvement |
| `TESTED` / `VERIFIED` / `VALIDATED` | Testing tasks |
| `DEPLOYED` / `SHIPPED` / `RELEASED` | Deployment tasks |

## Phase 1: Parse Arguments

Extract from `$ARGUMENTS`:

1. **Task Description** - What to accomplish
2. **Custom Promise** - If `--promise` specified
3. **Max Iterations** - If `--max` specified

## Phase 2: Initialize Loop

1. **Create Todo List:**
   - Main task objective
   - Sub-tasks as identified

2. **Set Loop Parameters:**
   ```json
   {
     "task": "[description]",
     "completion_promise": "DONE",
     "max_iterations": null,
     "started_at": "[timestamp]",
     "iteration": 0
   }
   ```

3. **Output Initialization:**
   ```
   ═══════════════════════════════════════════════════════════════
                    RALPH WIGGUM LOOP STARTED
   ═══════════════════════════════════════════════════════════════

   Task: [description]
   Completion Signal: <promise>DONE</promise>
   Max Iterations: [N or unlimited]

   The loop will continue until you output the completion signal.
   Use /ralph-status to check progress.
   Use /ralph-continue to override a detected promise.
   ═══════════════════════════════════════════════════════════════
   ```

## Phase 3: Execute Loop

Work on the task using this pattern:

```markdown
## Iteration [N]

### Current State
- What has been done
- What remains

### This Iteration
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Self-Evaluation
- [ ] Task requirement 1 met?
- [ ] Task requirement 2 met?
- [ ] All tests passing?
- [ ] Code review clean?

### Decision
If ALL requirements met:
  → Output: <promise>DONE</promise>
Else:
  → Continue to next iteration
```

## Phase 4: Completion

When outputting a completion promise:

```markdown
## Task Complete

### Summary
- What was accomplished
- Files changed
- Tests status

### Verification
- [x] Requirement 1
- [x] Requirement 2
- [x] All tests pass

<promise>DONE</promise>
```

The hook will detect this and allow graceful termination.

---

## Example Prompts

### Feature Development
```
/ralph-loop "Implement user authentication with JWT tokens

Requirements:
- Login endpoint at /api/auth/login
- Register endpoint at /api/auth/register
- JWT token generation and validation
- Password hashing with bcrypt
- All tests passing

Output <promise>DONE</promise> when all requirements met and tests pass."
```

### Bug Fixing
```
/ralph-loop --promise FIXED "Fix the memory leak in the WebSocket handler

Steps:
1. Identify the leak source
2. Implement fix
3. Add regression test
4. Verify with memory profiler

Output <promise>FIXED</promise> when the leak is resolved."
```

### Refactoring
```
/ralph-loop --max 25 "Refactor the payment module to use the new API client

Checklist:
- [ ] Update all API calls
- [ ] Maintain backward compatibility
- [ ] Update tests
- [ ] Update documentation

Output <promise>REFACTORED</promise> when complete."
```

---

## Commands

### /ralph-continue

Override a detected promise and continue the loop:

```
/ralph-continue
```

Use when:
- Promise was output prematurely
- More work needed despite signal
- Testing the loop behavior

### /ralph-status

Check current loop status:

```
/ralph-status
```

Shows:
- Active promise (if any)
- Recent promise history
- Current iteration count

---

## Best Practices

### 1. Clear Requirements

Always specify clear, verifiable requirements:

```markdown
Requirements:
- [ ] Feature X implemented
- [ ] Unit tests with >80% coverage
- [ ] E2E test for happy path
- [ ] No TypeScript errors
- [ ] ESLint passing
```

### 2. Self-Evaluation Checkpoints

Include explicit checkpoints in your prompt:

```markdown
Before outputting DONE, verify:
1. All requirements in the list above are checked
2. `pnpm test` passes
3. `pnpm lint` passes
4. `pnpm build` succeeds
```

### 3. Use Max Iterations as Safety Net

Always set a reasonable max for complex tasks:

```
/ralph-loop --max 50 "Complex refactoring task..."
```

### 4. Combine with Test Skills

```
/ralph-loop "Implement feature X

After implementation, run:
- /test-unit
- /test-e2e

Only output <promise>DONE</promise> when ALL tests pass."
```

---

## Integration with Hustle Build

The `/hustle-build --auto` mode uses Ralph Wiggum internally:

```
/hustle-build --auto --max-iterations 10 "Build a photo gallery"
```

This:
1. Starts autonomous build loop
2. Uses completion promise detection
3. Falls back to max-iterations if needed

---

## Troubleshooting

### Promise Not Detected

Ensure exact format: `<promise>DONE</promise>`
- Must have angle brackets
- Must be uppercase
- No extra whitespace inside tags

### Loop Won't Stop

Check:
1. `/ralph-status` - Is promise active?
2. Hook enabled in settings?
3. Try `/ralph-continue` then manually stop

### Infinite Loop

Safety measures:
1. Use `--max [N]` flag
2. Context window will eventually fill
3. Manual Ctrl+C always works

---

## See Also

- [Completion Promise Detector Hook](../../hooks/completion-promise-detector.py)
- [CLAUDE_CODE_BEST_PRACTICES.md](../../docs/CLAUDE_CODE_BEST_PRACTICES.md) - Ralph Wiggum section
- [/hustle-build skill](../hustle-build/SKILL.md) - Uses this pattern internally
