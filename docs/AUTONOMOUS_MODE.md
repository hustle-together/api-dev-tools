# Autonomous Mode Guide

> **Version:** 3.12.0
> **Last Updated:** December 26, 2025

Run api-dev-tools workflows unattended with YOLO mode, budget tracking, and automatic notifications.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Execution Modes](#execution-modes)
3. [Budget Configuration](#budget-configuration)
4. [Notifications](#notifications)
5. [Subagents & Explore](#subagents--explore)
6. [Phase Summaries](#phase-summaries)
7. [Safety Features](#safety-features)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run Full Workflow Autonomously

```bash
# YOLO mode - no permission prompts, hooks still enforce workflow
claude --dangerously-skip-permissions -p "/api-create stripe-checkout"

# With explicit config
CLAUDE_PROJECT_DIR=/path/to/project claude --dangerously-skip-permissions -p "/api-create stripe-checkout"
```

### Monitor Progress

```bash
# Watch phase summaries
tail -f .claude/sessions/*/phase-summaries.md

# Check session metrics
cat .claude/api-dev-state.json | jq '.session_metrics'

# Use ccusage for accurate token tracking
npx ccusage
```

---

## Execution Modes

Configure in `.claude/autonomous-config.json`:

| Mode | Flag/Method | Behavior |
|------|-------------|----------|
| **yolo** | `--dangerously-skip-permissions` | No prompts, hooks still run |
| **auto-accept** | `Shift+Tab` in session | Auto-approves, visible progress |
| **interactive** | Default | Prompts for each action |

### YOLO Mode + Hooks

**Key insight:** YOLO mode only skips permission dialogs. Our 42 hooks still run and enforce the 13-phase workflow.

```
YOLO skips:
  ✗ "Allow Claude to edit this file?"
  ✗ "Allow Claude to run this command?"

YOLO does NOT skip:
  ✓ enforce-research.py (blocks writes until research done)
  ✓ enforce-interview.py (requires interview before schema)
  ✓ verify-implementation.py (requires test before route)
  ✓ api-workflow-check.py (blocks if phases incomplete)
  ✓ enforce-budget-limit.py (pauses at token threshold)
```

---

## Budget Configuration

### Token Limits by Plan

| Plan | 5-Hour Limit | Recommended Budget |
|------|--------------|-------------------|
| Pro | ~44,000 | 35,000 |
| Max 5x | ~88,000 | 70,000 |
| Max 20x | ~220,000 | 175,000 |

### Configuration

```json
// .claude/autonomous-config.json
{
  "budget": {
    "enabled": true,
    "max_tokens_per_session": 75000,
    "warn_at_percentage": 60,
    "pause_at_percentage": 80,
    "track_per_phase": true
  }
}
```

### Behavior

1. **60% (warning):** Message injected, workflow continues
2. **80% (pause):** Workflow blocked, ntfy notification sent
3. **Reset:** Wait for 5-hour window reset, then continue

### Check Current Usage

```bash
# From state file
cat .claude/api-dev-state.json | jq '.session_metrics.total_tokens'

# Accurate tracking with ccusage
npx ccusage --live
```

---

## Notifications

Receive alerts via [ntfy](https://ntfy.sh) for workflow events.

### Configuration

```json
{
  "notifications": {
    "enabled": true,
    "ntfy_topic": "hustleserver",
    "notify_on": [
      "session_start",
      "phase_complete",
      "budget_warning",
      "budget_pause",
      "workflow_complete",
      "error"
    ],
    "include_summary": true
  }
}
```

### Notification Events

| Event | Priority | When |
|-------|----------|------|
| `session_start` | default | Workflow begins |
| `phase_complete` | default | Each phase completes |
| `budget_warning` | default | 60% token usage |
| `budget_pause` | high | 80% token usage, workflow paused |
| `workflow_complete` | default | All 13 phases done |
| `error` | high | Hook blocks or error occurs |

### Subscribe on Mobile

```bash
# iOS/Android ntfy app
# Subscribe to your topic: hustleserver
```

---

## Subagents & Explore

### Explore Agent

Fast, read-only agent for codebase search. Used in research phases.

| Aspect | Explore Agent | Regular Agent |
|--------|---------------|---------------|
| Speed | Fast | Normal |
| Access | Read-only | Full |
| Context | Separate | Shared |
| Use Case | Find files, search code | Make changes |

### Configuration

```json
{
  "subagents": {
    "use_explore_for_research": true,
    "explore_model": "sonnet",
    "parallel_research_agents": 3,
    "background_verification": true
  }
}
```

### How Research Phases Use Subagents

```
Phase 3 (Initial Research):
  ├── Explore Agent 1: Search codebase for existing implementations
  ├── Explore Agent 2: Find related types/schemas
  └── Explore Agent 3: Check test patterns

Results return without filling main context window.
```

---

## Phase Summaries

Automatic digests after each phase for easy review.

### Configuration

```json
{
  "summaries": {
    "generate_phase_summaries": true,
    "summary_max_lines": 10,
    "summary_location": ".claude/sessions/{session_id}/phase-summaries.md",
    "include_token_usage": true,
    "include_files_modified": true
  }
}
```

### Sample Summary

```markdown
## Phase 3: INITIAL_RESEARCH
**Endpoint:** stripe-checkout
**Status:** Completed
**Duration:** 2m 34s
**Tokens Used:** 4,230

**Key Decisions:**
- Using Stripe Checkout Sessions API (not Payment Intents)
- Webhook verification with stripe-signature header
- TypeScript with Zod for schema validation

**Files Modified:**
- `.claude/research/stripe/CURRENT.md`

---
```

### View Summaries

```bash
# Latest session
cat .claude/sessions/*/phase-summaries.md

# Specific session
cat .claude/sessions/20251226_143022/phase-summaries.md
```

---

## Safety Features

### Forbidden Paths

Prevent accidental modification of sensitive files:

```json
{
  "safety": {
    "forbidden_paths": [
      ".env",
      ".env.local",
      "*.key",
      "*.pem",
      "credentials.json"
    ]
  }
}
```

### Test Requirements

```json
{
  "safety": {
    "require_tests_before_commit": true,
    "block_on_test_failure": true,
    "max_files_per_phase": 20
  }
}
```

### Retry Limits

```json
{
  "execution": {
    "max_retries_on_hook_block": 3
  }
}
```

If a hook blocks 3 times, workflow pauses and sends notification.

---

## Logging

### Session Logs

```json
{
  "logging": {
    "session_log_enabled": true,
    "log_location": ".claude/sessions/{session_id}/session.log",
    "log_level": "info",
    "log_tool_calls": true,
    "log_hook_results": true
  }
}
```

### Log Levels

| Level | Content |
|-------|---------|
| `debug` | Everything including hook internals |
| `info` | Tool calls, phase transitions, decisions |
| `warn` | Warnings and retries |
| `error` | Errors only |

---

## Troubleshooting

### Workflow Paused at Budget Limit

```bash
# Check current usage
cat .claude/api-dev-state.json | jq '.session_metrics'

# Increase budget (if you have headroom)
# Edit .claude/autonomous-config.json:
# "max_tokens_per_session": 100000

# Or wait for 5-hour window reset
```

### Hook Blocking Unexpectedly

```bash
# Check which hook is blocking
tail -50 .claude/sessions/*/session.log | grep "BLOCK"

# Check state for missing prerequisites
cat .claude/api-dev-state.json | jq '.phases'
```

### No Notifications Received

```bash
# Test ntfy directly
curl -d "Test from api-dev-tools" ntfy.sh/hustleserver

# Check config
cat .claude/autonomous-config.json | jq '.notifications'
```

### Resume After Interruption

```bash
# Use api-continue skill
/api-continue stripe-checkout

# Or manually check last phase
cat .claude/api-dev-state.json | jq '.current_phase'
```

---

## Full Configuration Reference

```json
{
  "$schema": "./autonomous-config.schema.json",
  "version": "1.0.0",

  "execution": {
    "mode": "yolo",
    "auto_continue_after_limit_reset": false,
    "max_retries_on_hook_block": 3
  },

  "budget": {
    "enabled": true,
    "max_tokens_per_session": 75000,
    "warn_at_percentage": 60,
    "pause_at_percentage": 80,
    "track_per_phase": true
  },

  "notifications": {
    "enabled": true,
    "ntfy_topic": "hustleserver",
    "notify_on": ["session_start", "phase_complete", "budget_warning", "budget_pause", "workflow_complete", "error"],
    "include_summary": true
  },

  "subagents": {
    "use_explore_for_research": true,
    "explore_model": "sonnet",
    "parallel_research_agents": 3,
    "background_verification": true
  },

  "summaries": {
    "generate_phase_summaries": true,
    "summary_max_lines": 10,
    "summary_location": ".claude/sessions/{session_id}/phase-summaries.md",
    "include_token_usage": true,
    "include_files_modified": true
  },

  "logging": {
    "session_log_enabled": true,
    "log_location": ".claude/sessions/{session_id}/session.log",
    "log_level": "info",
    "log_tool_calls": true,
    "log_hook_results": true
  },

  "integrations": {
    "greptile": {
      "enabled": true,
      "api_key_env": "GREPTILE_API_KEY",
      "github_token_env": "GITHUB_TOKEN"
    },
    "graphite": {
      "enabled": true,
      "use_stacked_prs": true,
      "trunk_branch": "main"
    }
  },

  "safety": {
    "require_tests_before_commit": true,
    "block_on_test_failure": true,
    "max_files_per_phase": 20,
    "forbidden_paths": [".env", ".env.local", "*.key", "*.pem"]
  }
}
```

---

## See Also

- [GREPTILE_INTEGRATION.md](./GREPTILE_INTEGRATION.md) - AI code review setup
- [GRAPHITE_WORKFLOW.md](./GRAPHITE_WORKFLOW.md) - Stacked PRs workflow
- [CLAUDE_CODE_FEATURES.md](./CLAUDE_CODE_FEATURES.md) - Claude Code features reference

---

**Version:** 3.12.0
**Author:** Hustle Together
