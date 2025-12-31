# Autonomous Loops (Ralph Wiggum Pattern)

**Version:** 4.5.0
**Last Updated:** 2025-12-30

Self-terminating agent loops for iterative development tasks.

## Overview

The **Ralph Wiggum Pattern** enables agents to work autonomously on iterative tasks
and signal completion when they're truly done, rather than relying on arbitrary
iteration limits.

> "Give the agent a task, let it work in a loop, and have it output a special signal when done."

**Pattern Credit:** [Geoffrey Huntley](https://ghuntley.com/ralph/)

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    RALPH WIGGUM PATTERN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Agent receives iterative task                               │
│     └─ "Review code until clean" / "Refactor until done"        │
│                                                                 │
│  2. Agent works in loop                                         │
│     └─ Find issues → Fix → Re-check → Repeat                    │
│                                                                 │
│  3. Agent completes task                                        │
│     └─ Outputs: <promise>DONE</promise>                         │
│                                                                 │
│  4. Hook detects promise                                        │
│     └─ Records completion in state                              │
│     └─ Allows graceful workflow termination                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Where It's Used

The Ralph Wiggum pattern is integrated into **iterative phases** where "done" isn't
a single step but requires multiple rounds of work:

| Skill | Promise Signal | Use Case |
|-------|----------------|----------|
| `/test-review` | `<promise>REVIEW_CLEAN</promise>` | Multi-pass code review loop |
| `/refactor` | `<promise>REFACTORED</promise>` | Iterative refactoring cycle |
| `/test-visual` | `<promise>VISUAL_CLEAN</promise>` | Visual QA fix loop |
| `/ralph-loop` | `<promise>DONE</promise>` | Generic autonomous tasks |

## Autonomous Mode (ON by Default)

As of v3.0.0, autonomous mode is **enabled by default** in `hustle-build-defaults.json`:

```json
{
  "autonomous": {
    "enabled": true,
    "skip_interviews": true,
    "use_defaults_for_questions": true,
    "ralph_wiggum_loops": true,
    "max_iterations": 25,
    "emit_promises": true,
    "auto_fix_visual_issues": true,
    "auto_fix_review_issues": true,
    "auto_refactor": true
  }
}
```

### What This Means

| Setting | Effect |
|---------|--------|
| `skip_interviews` | Interview questions use defaults, no prompts |
| `ralph_wiggum_loops` | Iterative phases loop until promise emitted |
| `auto_fix_visual_issues` | Visual QA fixes issues automatically |
| `auto_fix_review_issues` | Code review issues fixed without asking |
| `auto_refactor` | Refactoring proceeds autonomously |

### Disabling Autonomous Mode

To require manual interview answers, set in `.claude/hustle-build-defaults.json`:

```json
{
  "autonomous": {
    "enabled": false,
    "skip_interviews": false
  }
}
```

### Combined Usage

```bash
# Default behavior: autonomous mode with sensible defaults
/hustle-build [description]

# Explicit override to require interviews
/hustle-build --manual [description]

# During execution:
# - Questions auto-answered with comprehensive defaults
# - Ralph Wiggum loops until phases truly complete
# - max_iterations is safety limit (rarely hit)
```

## Promise Signals

### Standard Promises

The `completion-promise-detector.py` hook recognizes these signals:

```xml
<promise>DONE</promise>          <!-- Generic completion -->
<promise>COMPLETE</promise>      <!-- Task fully complete -->
<promise>FIXED</promise>         <!-- Bug/issue fixed -->
<promise>RESOLVED</promise>      <!-- Problem resolved -->
<promise>REFACTORED</promise>    <!-- Refactoring complete -->
<promise>TESTED</promise>        <!-- Testing complete -->
<promise>DEPLOYED</promise>      <!-- Deployment complete -->
<promise>REVIEW_CLEAN</promise>  <!-- Code review passed -->
<promise>VISUAL_CLEAN</promise>  <!-- Visual QA passed -->
```

### Custom Promises

You can define custom promises for specific workflows:

```xml
<promise>MIGRATION_COMPLETE</promise>
<promise>DOCS_UPDATED</promise>
<promise>SECURITY_VERIFIED</promise>
```

## Implementation

### Hook: completion-promise-detector.py

The hook monitors tool output for promise signals:

```python
# Hooks into:
# - PostToolUse: Detects promises in tool output
# - Stop: Allows termination when promise detected
# - UserPromptSubmit: Tracks promise history
```

State is tracked in `.claude/completion-promises.json`:

```json
{
  "last_promise": "REVIEW_CLEAN",
  "timestamp": "2025-12-29T15:30:00Z",
  "history": [
    {"promise": "REVIEW_CLEAN", "timestamp": "..."},
    {"promise": "REFACTORED", "timestamp": "..."}
  ]
}
```

### Skill: /ralph-loop

For open-ended autonomous tasks:

```bash
# Start an autonomous loop
/ralph-loop "Review all API routes for security vulnerabilities"

# Check status
/ralph-status

# Continue if needed
/ralph-continue
```

### Skill: /ralph-status (v4.5.0)

Check the current loop status without interrupting:

```bash
/ralph-status
```

**Output:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    RALPH STATUS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Current Phase:   TDD Green (Phase 9)                           │
│  Iteration:       3/25                                          │
│  Time Elapsed:    47 minutes                                    │
│  Phases Complete: 8                                             │
│  Active Promises: TESTING (pending)                             │
│  Last Promise:    RESEARCH_COMPLETE (14:32)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Skill: /ralph-continue (v4.5.0)

Resume a paused or interrupted loop:

```bash
/ralph-continue                              # Resume most recent
/ralph-continue wf-2025-12-30-stripe-api     # Resume specific workflow
```

**Behavior:**
1. Loads workflow state from `.claude/workflow-logs/`
2. Finds last incomplete phase
3. Clears any stale promises
4. Resumes execution from that point
5. Preserves all previous decisions and research

Useful when:
- Session was interrupted (timeout, browser close)
- User needs to step away mid-workflow
- Error occurred and was fixed manually

## Examples

### Code Review Loop

```
Agent: Running multi-pass code review...

Pass 1 (Logic): Found 2 issues
  - Off-by-one in pagination
  - Null check missing

Agent: Fixing issues...
Agent: Re-running review...

Pass 1 (Logic): All clear
Pass 2 (Security): Found 1 issue
  - Missing auth check on /api/admin

Agent: Adding auth middleware...
Agent: Re-running review...

Pass 2 (Security): All clear
Pass 3 (Performance): All clear
Pass 4 (Misc): All clear

<promise>REVIEW_CLEAN</promise>

[Hook detects → Workflow proceeds to next phase]
```

### Refactoring Loop

```
Agent: Analyzing code for refactoring opportunities...

Found:
  - Duplicate validation logic in 3 files
  - Magic strings that should be constants
  - Function exceeds 50 lines

Agent: Extracting validation utility...
Agent: Running tests... ✅ Pass
Agent: Converting magic strings to constants...
Agent: Running tests... ✅ Pass
Agent: Splitting large function...
Agent: Running tests... ✅ Pass

Agent: Re-analyzing... No more opportunities found.

<promise>REFACTORED</promise>

[Hook detects → Workflow proceeds]
```

### Visual QA Loop

```
Agent: Capturing screenshots across 7 viewports...
Agent: Spawning Haiku for AI analysis...

Haiku: Found issues in Mobile Notch viewport:
  - Touch target too small (36px, needs 44px)
  - Text clipping at safe area

Agent: Fixing CSS...
Agent: Re-capturing screenshots...
Agent: Re-analyzing with Haiku...

Haiku: All viewports pass!

<promise>VISUAL_CLEAN</promise>

[Hook detects → Workflow proceeds]
```

## Why Not Just Use Max Iterations?

| Approach | Pros | Cons |
|----------|------|------|
| `--max-iterations` only | Simple, predictable | May stop too early or waste iterations |
| Ralph Wiggum only | Stops when truly done | Risk of infinite loop |
| **Both combined** | Best of both worlds | Optimal efficiency with safety net |

The pattern ensures:
1. **Efficiency**: Don't waste iterations when work is done
2. **Completeness**: Don't stop prematurely
3. **Safety**: Max iterations as fallback

## Integration with Workflows

### Phase 11 (Code Review)

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 11: Code Review                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /test-review --all-passes                                      │
│    └─ Loop until: <promise>REVIEW_CLEAN</promise>               │
│    └─ Or: max-iterations reached (fallback)                     │
│                                                                 │
│  On completion → Proceed to Phase 12                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 12 (Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 12: TDD Refactor                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /refactor                                                      │
│    └─ Loop until: <promise>REFACTORED</promise>                 │
│    └─ Constraint: Tests must stay green                         │
│                                                                 │
│  On completion → Proceed to Phase 13                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## See Also

- [Geoffrey Huntley - Ralph Wiggum Pattern](https://ghuntley.com/ralph/)
- [/ralph-loop skill](../.skills/ralph-loop/SKILL.md)
- [/test-review skill](../.skills/test-review/SKILL.md)
- [/refactor skill](../.skills/refactor/SKILL.md)
- [/test-visual skill](../.skills/test-visual/SKILL.md)
