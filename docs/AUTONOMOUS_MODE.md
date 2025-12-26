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

### How Budget Tracking Works

> **Important:** Built-in budget tracking uses **estimates** based on tool usage patterns.
> For accurate token counts, use Claude Code's `/cost` command or the `ccusage` tool.

The hook-based tracking estimates tokens per tool call:
- WebSearch: ~2,000 tokens
- WebFetch: ~3,000 tokens
- Read (file): ~1,500 tokens
- Write/Edit: ~500 tokens

This provides **macro-level cost prevention** but is not precise. A small file and large file get similar estimates.

### Accurate Token Tracking

```bash
# Claude Code built-in (shows actual session cost)
/cost

# ccusage tool (reads JSONL logs for detailed breakdown)
npx ccusage
npx ccusage --live  # Real-time monitoring

# Install ccusage globally
npm install -g ccusage
```

Learn more: [ccusage on GitHub](https://github.com/ryoppippi/ccusage)

### Behavior

1. **60% (warning):** Message injected, workflow continues
2. **80% (pause):** Workflow blocked, ntfy notification sent
3. **Reset:** Wait for 5-hour window reset, then continue

### Check Current Usage

```bash
# Quick check from state file (estimated)
cat .claude/api-dev-state.json | jq '.session_metrics.total_tokens'

# Accurate check with Claude Code
/cost

# Detailed breakdown with ccusage
npx ccusage
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
    "parallel_research_agents": 5,
    "parallel_test_agents": 3,
    "parallel_docs_agents": 2,
    "max_parallel_total": 10,
    "background_verification": true
  }
}
```

### Subagent Usage Points

| Phase | Subagent Use | Count | Purpose |
|-------|--------------|-------|---------|
| **Research** | Explore agents | 5 | Context7, WebSearch, codebase analysis |
| **Verification** | Test runners | 3 | Unit, integration, e2e tests in parallel |
| **Documentation** | Doc generators | 2 | Multi-file doc updates |
| **Schema** | Validators | 2 | Validate multiple endpoints |

### How Research Phases Use Subagents

```
Phase 3 (Initial Research):
  ├── Explore Agent 1: Search codebase for existing implementations
  ├── Explore Agent 2: Find related types/schemas
  ├── Explore Agent 3: Check test patterns
  ├── Explore Agent 4: Search Context7 for library docs
  └── Explore Agent 5: WebSearch for official documentation

Phase 10 (Verification):
  ├── Test Agent 1: Run unit tests (Vitest)
  ├── Test Agent 2: Run integration tests
  └── Test Agent 3: Run e2e tests (Playwright)

All results return without filling main context window.
```

### Limits

- **Maximum:** 10 parallel tasks (Claude Code hard limit)
- **Beyond 10:** Tasks queue into batches
- **Recommended:** 3-5 for typical workflows (balance speed vs resources)

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

## Test Mode (v3.12.0)

Run complete workflows without user interaction using explicit decision fixtures.

### Why Explicit Decisions (Not Pattern Matching)

Interview questions are **dynamically generated from research findings** - they can't be predicted in advance. If research discovers 7 different API providers, the question will list those 7 options. Pattern matching would never work reliably.

**Solution:** Test mode uses **explicit decisions** that SKIP the interview phase entirely and inject decisions directly into state, as if the user had already answered.

### Enable Test Mode

```json
// .claude/autonomous-config.json
{
  "execution": {
    "test_mode": true
  }
}
```

### Create Test Fixtures (v2.0 Format)

Create fixture files in `.claude/test-fixtures/{endpoint}.json`:

```json
{
  "version": "2.0.0",
  "endpoint": "weather-forecast",
  "description": "Test fixture with EXPLICIT decisions (not pattern matching)",

  "explicit_decisions": {
    "provider": {
      "value": "OpenWeatherMap",
      "rationale": "Free tier available, well-documented API"
    },
    "authentication": {
      "value": "API key in query parameter (appid=KEY)",
      "rationale": "OpenWeatherMap standard auth method"
    },
    "rate_limiting": {
      "value": "60 requests/minute",
      "rationale": "Free tier limit"
    },
    "caching": {
      "value": "5 minute TTL",
      "rationale": "Weather doesn't change that fast"
    },
    "error_handling": {
      "value": "Return structured error objects",
      "rationale": "Client can handle gracefully"
    }
  },

  "skip_phases": {
    "interview": true,
    "reason": "Test mode injects explicit_decisions directly"
  },

  "mock_research": {
    "use_cached": true,
    "cache_path": ".claude/research/openweathermap/",
    "fallback_to_live": false
  }
}
```

### How It Works

1. When `test_mode: true`, hooks check for fixture files
2. If fixture has `skip_phases.interview: true`:
   - Interview phase is **SKIPPED entirely**
   - `explicit_decisions` are injected into state
   - Decisions appear as if user had answered each question
3. Workflow continues with research → schema → TDD phases
4. All other phases run normally (just no user prompts)

### Key Fields

| Field | Purpose |
|-------|---------|
| `explicit_decisions` | Key-value pairs of decisions to inject |
| `skip_phases.interview` | Set to `true` to skip interview entirely |
| `mock_research.use_cached` | Use cached research instead of live calls |
| `mock_research.cache_path` | Path to cached research directory |

### Sample Fixture

Pre-built fixture available:

| Fixture | Endpoint | Decisions |
|---------|----------|-----------|
| `weather-forecast.json` | Weather API | Provider, auth, caching, errors |

### Run Test Mode

```bash
# Enable test mode and run workflow
claude --dangerously-skip-permissions -p "/api-create weather-forecast"
```

With `test_mode: true` in config, the workflow runs fully autonomously:
- Research phase uses cached data (if configured)
- Interview phase is skipped, decisions injected
- TDD phases run with explicit decisions guiding implementation
- All 13 phases complete without user prompts

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
      "github_token_env": "GITHUB_TOKEN",
      "mcp_setup": "claude mcp add --transport http greptile https://api.greptile.com/mcp --header \"Authorization: Bearer $GREPTILE_API_KEY\""
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
- [CLAUDE_CODE_FEATURES.md](./CLAUDE_CODE_FEATURES.md) - Claude Code features reference

---

**Version:** 3.12.0
**Author:** Hustle Together
