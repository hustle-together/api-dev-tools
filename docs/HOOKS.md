# Hooks Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> Without enforcement, developers (and AI assistants) skip important steps. Research gets forgotten, tests aren't written first, code reviews are bypassed. There's no guardrail preventing a "just code it" approach that leads to bugs and technical debt.

> **The Solution**
>
> Hooks are automatic enforcement scripts that run at lifecycle events. They block writes until research is complete, inject interview decisions during implementation, verify tests pass before proceeding, and trigger re-grounding to combat context dilution. No skipping steps.

---

## Table of Contents

- [Hook Types](#hook-types)
- [Lifecycle Events](#lifecycle-events)
- [Complete Hook Reference](#complete-hook-reference)
- [Configuration](#configuration)
- [Writing Custom Hooks](#writing-custom-hooks)
- [State Files](#state-files)
- [Testing Hooks](#testing-hooks)

---

## Hook Types

| Category         | Description                          | When They Run             |
| ---------------- | ------------------------------------ | ------------------------- |
| **Enforcement**  | Block actions until requirements met | PreToolUse                |
| **Verification** | Validate work before proceeding      | PostToolUse               |
| **Tracking**     | Log progress and metrics             | PostToolUse               |
| **Notification** | Alert user of important events       | PostToolUse, Notification |
| **Session**      | Initialize context at startup        | SessionStart              |
| **Workflow**     | Gate completion checkpoints          | Stop                      |

---

## Lifecycle Events

### SessionStart

Runs when Claude Code starts or resumes a session.

| Hook                 | Purpose                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `session-startup.py` | Injects API development state into context (current phase, interview decisions, research cache status) |

### UserPromptSubmit

Runs when user submits a prompt (before Claude processes it).

| Hook                           | Purpose                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `enforce-external-research.py` | Detects API-related terms in prompts, injects reminder to research before answering |

### PreToolUse

Runs before Claude executes a tool (Write, Edit, Bash, etc.). Can **block** the action.

| Hook                                | Matcher         | Purpose                                               |
| ----------------------------------- | --------------- | ----------------------------------------------------- |
| `enforce-research.py`               | Write\|Edit     | Blocks writing API code until research phase complete |
| `enforce-interview.py`              | Write\|Edit     | Injects interview decisions into context when writing |
| `verify-implementation.py`          | Write\|Edit     | Ensures implementation matches verified schema        |
| `enforce-component-type-confirm.py` | Write\|Edit     | Confirms UI component type before creation            |
| `notify-input-needed.py`            | AskUserQuestion | Sends notification that user input is needed          |

### PostToolUse

Runs after Claude executes a tool. Used for tracking and triggering next phases.

| Hook                       | Matcher                                 | Purpose                                |
| -------------------------- | --------------------------------------- | -------------------------------------- |
| `track-tool-use.py`        | WebSearch\|WebFetch\|mcp\_\_context7.\* | Logs research sources to state         |
| `periodic-reground.py`     | WebSearch\|WebFetch\|mcp\_\_context7.\* | Re-injects context every 7 turns       |
| `verify-after-green.py`    | Bash                                    | Triggers verification after tests pass |
| `notify-phase-complete.py` | Write\|Edit                             | Sends notification on phase completion |
| `track-token-usage.py`     | Write\|Edit                             | Tracks token consumption metrics       |

### Stop

Runs when Claude stops (user interrupts or task completes).

| Hook                    | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `api-workflow-check.py` | Blocks stopping if workflow phases incomplete |

---

## Complete Hook Reference

### Enforcement Hooks

#### enforce-research.py

**Event:** PreToolUse (Write\|Edit)
**Purpose:** Ensures research is complete before writing API code

- Blocks writing to `/api/` or `/api-test/` files until Phase 3 (Initial Research) is complete
- Requires minimum 2 research sources
- Requires user approval via AskUserQuestion
- Allows test files (TDD Red writes tests before implementation)

#### enforce-interview.py

**Event:** PreToolUse (Write\|Edit)
**Purpose:** Injects interview decisions into context when writing implementation

- Reads interview decisions from state
- Injects as context reminder
- Ensures implementation reflects user requirements

#### enforce-external-research.py

**Event:** UserPromptSubmit
**Purpose:** Detects API-related terms and requires research

- Scans user prompt for API names, SDK terms
- Injects reminder to use Context7/WebSearch first
- Prevents implementation from training data alone

#### enforce-disambiguation.py

**Event:** PreToolUse
**Purpose:** Ensures ambiguous terms are clarified before research

- Detects terms with multiple meanings
- Requires user clarification via AskUserQuestion
- Prevents researching wrong API/library

#### enforce-scope.py

**Event:** PreToolUse
**Purpose:** Confirms endpoint scope before proceeding

- Validates understanding of what endpoint should do
- Requires explicit user confirmation
- Prevents scope creep

#### enforce-schema.py

**Event:** PreToolUse
**Purpose:** Ensures schema is created from interview, not assumptions

- Blocks schema creation until interview complete
- Injects interview decisions as reference
- Validates schema matches requirements

#### enforce-tdd-red.py

**Event:** PreToolUse
**Purpose:** Enforces TDD Red phase rules

- Ensures tests are written before implementation
- Blocks route files until test file exists
- Validates test file has meaningful assertions

#### enforce-environment.py

**Event:** PreToolUse
**Purpose:** Verifies API keys exist before implementation

- Checks for required environment variables
- Blocks if keys missing
- Provides setup instructions

#### enforce-verify.py

**Event:** PreToolUse
**Purpose:** Ensures verification phase is completed

- Requires re-research of documentation
- Requires comparison table
- Requires user approval of gaps

#### enforce-refactor.py

**Event:** PreToolUse
**Purpose:** Ensures refactor phase follows rules

- Tests must remain passing
- No new features during refactor
- Code cleanup only

#### enforce-documentation.py

**Event:** PreToolUse
**Purpose:** Ensures documentation is updated

- Manifest files must be updated
- Research must be cached
- TypeDoc comments required

### Verification Hooks

#### verify-after-green.py

**Event:** PostToolUse (Bash)
**Purpose:** Triggers verification when tests pass

- Detects test command success
- Runs manifest generation scripts
- Marks TDD Green complete
- Starts Verify phase
- Prompts re-research and comparison

#### verify-implementation.py

**Event:** PreToolUse (Write\|Edit)
**Purpose:** Validates implementation matches verified schema

- Compares implementation to schema
- Blocks if major discrepancies
- Allows with user override

### Tracking Hooks

#### track-tool-use.py

**Event:** PostToolUse
**Purpose:** Logs research tool usage to state

- Tracks Context7, WebSearch, WebFetch calls
- Records sources with timestamps
- Used for freshness tracking

#### track-scope-coverage.py

**Event:** PostToolUse
**Purpose:** Tracks how much of scope is implemented

- Compares implemented features to scope
- Calculates coverage percentage
- Reports gaps

#### track-token-usage.py

**Event:** PostToolUse
**Purpose:** Tracks token consumption

- Logs tokens per phase
- Cumulative session total
- Used for cost analysis

### Session Hooks

#### session-startup.py

**Event:** SessionStart
**Purpose:** Injects state context at session start

Injects:

- Current endpoint being developed
- Phase status (completed, in progress, not started)
- Interview decisions
- Research cache location and freshness
- Turn count for re-grounding

#### periodic-reground.py

**Event:** PostToolUse
**Purpose:** Re-injects context every 7 turns

- Prevents context dilution in long sessions
- Reloads state from file
- Injects key decisions and phase status

### Notification Hooks

#### notify-input-needed.py

**Event:** PreToolUse (AskUserQuestion)
**Purpose:** Sends notification that user input needed

- Integrates with ntfy.sh
- Mobile push notifications
- Desktop notifications

#### notify-phase-complete.py

**Event:** PostToolUse
**Purpose:** Sends notification when phase completes

- Tracks phase transitions
- Sends celebratory notifications
- Includes next steps

### Workflow Hooks

#### api-workflow-check.py

**Event:** Stop
**Purpose:** Blocks stopping if workflow incomplete

- Checks all phases complete
- Warns about incomplete work
- Allows override with confirmation

#### detect-interruption.py

**Event:** Stop
**Purpose:** Detects interruption and saves state

- Saves current progress
- Logs interruption point
- Enables resume

### UI-Specific Hooks

#### enforce-ui-disambiguation.py

**Event:** PreToolUse
**Purpose:** Clarifies UI component requirements

#### enforce-ui-interview.py

**Event:** PreToolUse
**Purpose:** Ensures UI interview complete before building

#### enforce-brand-guide.py

**Event:** PreToolUse
**Purpose:** Validates brand guide compliance

#### enforce-a11y-audit.py

**Event:** PreToolUse
**Purpose:** Requires accessibility audit

#### check-storybook-setup.py

**Event:** PreToolUse
**Purpose:** Verifies Storybook is configured

#### check-playwright-setup.py

**Event:** PreToolUse
**Purpose:** Verifies Playwright is configured

### Registry Hooks

#### update-registry.py

**Event:** PostToolUse
**Purpose:** Updates component/API registry

#### update-api-showcase.py

**Event:** PostToolUse
**Purpose:** Updates API showcase page

#### update-ui-showcase.py

**Event:** PostToolUse
**Purpose:** Updates UI showcase page

#### generate-manifest-entry.py

**Event:** PostToolUse
**Purpose:** Generates manifest entries programmatically

### Cache Hooks

#### cache-research.py

**Event:** PostToolUse
**Purpose:** Caches research to .claude/research/

- Saves research to dated files
- Updates CURRENT.md symlink
- Updates index.json freshness

#### enforce-freshness.py

**Event:** PreToolUse
**Purpose:** Warns if research is stale (>7 days)

### Code Quality Hooks

#### run-code-review.py

**Event:** PostToolUse
**Purpose:** Runs Greptile AI code review

- Analyzes code for bugs, security, performance
- Returns structured feedback
- Blocks if critical issues

---

## Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/hooks/session-startup.py"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/hooks/enforce-research.py"
          }
        ]
      }
    ]
  }
}
```

### Matcher Patterns

| Pattern                                                 | Matches                             |
| ------------------------------------------------------- | ----------------------------------- |
| `Write\|Edit`                                           | Write or Edit tools                 |
| `Bash`                                                  | Bash tool only                      |
| `mcp__context7.*`                                       | All Context7 MCP tools              |
| `WebSearch\|WebFetch\|mcp__context7.*\|AskUserQuestion` | Research and user interaction tools |

---

## Writing Custom Hooks

### Hook Input (stdin)

Hooks receive JSON on stdin:

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "content": "..."
  },
  "tool_output": "...",
  "cwd": "/project/root"
}
```

### Hook Output (stdout)

#### Allow action:

```json
{ "permissionDecision": "allow" }
```

#### Deny action:

```json
{
  "permissionDecision": "deny",
  "reason": "Explain why blocked and what to do"
}
```

#### Inject context:

```json
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Context to inject into Claude's memory"
  }
}
```

### Example Hook

```python
#!/usr/bin/env python3
"""Custom hook to enforce my rule."""
import json
import sys

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Your logic here
    if should_block(input_data):
        print(json.dumps({
            "permissionDecision": "deny",
            "reason": "Explain why and what to do instead"
        }))
    else:
        print(json.dumps({"permissionDecision": "allow"}))

    sys.exit(0)

if __name__ == "__main__":
    main()
```

---

## State Files

Hooks read from and write to state files in `.devkit/`:

### state.json

Ephemeral workflow state tracking current session progress:

```json
{
  "version": "1.0.0",
  "status": "in_progress",
  "progress": {
    "currentPhase": "tdd-green",
    "currentPhaseName": "TDD Green",
    "completedSteps": 8,
    "totalSteps": 14
  },
  "phases": {
    "research": { "complete": true, "cacheKey": "stripe-2024-01" },
    "interview": { "complete": true, "answers": { "errorHandling": "retry-with-backoff" } },
    "schema": { "complete": true },
    "tdd-red": { "complete": true },
    "tdd-green": { "complete": false },
    "verify": { "complete": false },
    "docs": { "complete": false }
  },
  "metrics": {
    "turnCount": 15,
    "researchQueries": 8,
    "testsWritten": 5,
    "filesCreated": 12
  },
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### registry.json

Persistent artifact registry across sessions:

```json
{
  "artifacts": {
    "apis": [
      { "name": "stripe-checkout", "path": "src/app/api/stripe/route.ts", "checksum": "abc123" }
    ],
    "components": [],
    "pages": []
  },
  "patterns": {},
  "adrs": []
}
```

### How Hooks Use State

| Hook | Reads | Writes |
|------|-------|--------|
| `research-gate.py` | `phases.research.complete` | - |
| `interview-gate.py` | `phases.interview.complete` | - |
| `state-manager.py` | All state | `metrics`, `updatedAt` |
| `reground.py` | `phases`, `metrics.turnCount` | - |
| `registry-manager.py` | - | `artifacts` |

---

## Testing Hooks

A comprehensive pytest test suite is included for validating hook behavior.

### Installation

```bash
pip install -r .claude/hooks/tests/requirements.txt
```

### Running Tests

```bash
# Run all tests
python -m pytest .claude/hooks/tests/ -v

# Run specific hook category
python -m pytest .claude/hooks/tests/ -k gate -v
python -m pytest .claude/hooks/tests/ -k state -v
python -m pytest .claude/hooks/tests/ -k autonomous -v

# Run with coverage report
python .claude/hooks/tests/run_tests.py --coverage
```

### Test Structure

```
.claude/hooks/tests/
├── conftest.py              # Test fixtures and HookRunner class
├── requirements.txt         # pytest, pytest-cov
├── run_tests.py             # Test runner script
├── test_gate_hooks.py       # Gate hook tests (research, interview, schema, tdd, verify, docs)
├── test_state_hooks.py      # State management tests (state-manager, session-manager, reground)
├── test_quality_hooks.py    # Quality hook tests (format, code-review, visual-qa)
├── test_autonomous_hooks.py # Autonomous hook tests (ralph-loop, auto-answer, notify)
└── test_utility_hooks.py    # Utility hook tests (validate-bash, subagent-verify)
```

### HookRunner API

The `HookRunner` class simulates Claude Code's hook invocation:

```python
from conftest import HookRunner

# Create runner with temp project directory
runner = HookRunner(hooks_dir, temp_project_dir)

# Set workflow state
runner.set_state({
    "phases": {"research": {"complete": True}},
    "metrics": {"turnCount": 5}
})

# Run a hook with mock input
result = runner.run("research-gate.py", {
    "tool_name": "Edit",
    "tool_input": {"file_path": "src/api.ts"},
    "cwd": "/project"
})

# Check result
assert result.allowed      # Exit code 0
assert result.blocked      # Exit code 2
assert "research" in result.stderr.lower()
```

### Test Fixtures

| Fixture | Purpose |
|---------|---------|
| `runner` | HookRunner instance with temp project |
| `mock_pretool_input` | Factory for PreToolUse payloads |
| `mock_posttool_input` | Factory for PostToolUse payloads |
| `mock_stop_input` | Factory for Stop event payloads |
| `complete_state` | State with all phases complete |
| `incomplete_state` | State with phases incomplete |

### Writing New Tests

```python
def test_my_hook_blocks_without_research(self, runner, mock_pretool_input, incomplete_state):
    """Should block when research not complete."""
    runner.set_state(incomplete_state)
    result = runner.run("my-hook.py", mock_pretool_input("Edit"))
    assert result.blocked
    assert "expected message" in result.stderr.lower()
```

---

## See Also

- [SKILLS.md](./SKILLS.md) - Slash command reference
- [AGENTS.md](./AGENTS.md) - Specialized agent reference
- [PLUGIN_ARCHITECTURE.md](./PLUGIN_ARCHITECTURE.md) - How the plugin system works
