# API Development Tools v3.12.0

**Interview-driven, research-first API development with 13-phase TDD workflow + Autonomous Mode**

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Compatible-blue)](https://agentskills.io)
[![Cross-Platform](https://img.shields.io/badge/Cross--Platform-Claude%20%7C%20VS%20Code%20%7C%20Cursor-green)](https://github.com/hustle-together/api-dev-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **33 Agent Skills** + **Autonomous Mode** with YOLO execution, budget tracking, and ntfy push notifications

---

## Quick Start

### Install

```bash
# Via Claude Code Plugin (Recommended)
/plugin install hustle-together/api-dev-tools

# Via NPM
npx @hustle-together/api-dev-tools --scope=project
```

### Your First API

```bash
/api-create stripe-checkout
```

This runs you through 13 enforced phases:
1. **Disambiguation** → Clarify what you're building
2. **Scope** → Confirm understanding
3. **Research** → Live docs via Context7 + WebSearch
4. **Interview** → Questions FROM research findings
5. **Deep Research** → Follow-up based on your answers
6. **Schema** → Zod schema from research
7. **Environment** → Verify API keys
8. **TDD Red** → Write failing tests
9. **TDD Green** → Minimal implementation
10. **Verify** → Re-check against docs
11. **Refactor** → Clean up code
12. **Documentation** → Update manifests
13. **Complete** → Final verification

### Other Workflows

```bash
/hustle-ui-create Button       # Create UI component (Storybook + Vitest)
/hustle-ui-create-page dashboard  # Create page (Playwright E2E)
/hustle-combine                # Orchestrate 2+ existing APIs
```

### TDD Shortcuts

```bash
/red        # Write ONE failing test
/green      # Minimal implementation to pass
/refactor   # Clean up while tests pass
/cycle      # All three in sequence
```

### Git Operations

```bash
/commit     # Semantic commit with co-author
/pr         # Create pull request
/busycommit # Multiple atomic commits
```

---

## What's Included

| Category | Count | Examples |
|----------|-------|----------|
| **Skills** | 33 | api-create, hustle-ui-create, commit, pr |
| **Hooks** | 42 | Enforcement for each phase |
| **Templates** | 9 | Component, Page, API route, Showcases |

### Skills by Category

- **API Development**: api-create, api-research, api-interview, api-verify, api-env, api-status, api-continue, api-sessions
- **UI Development**: hustle-ui-create, hustle-ui-create-page, hustle-combine
- **TDD**: red, green, refactor, cycle, tdd, spike
- **Git**: commit, pr, busycommit, worktree-add, worktree-cleanup
- **Planning**: plan, gap, issue
- **Utilities**: stats, rename, skill-finder, summarize, test-toolkit

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/](./docs/) | All documentation |
| [docs/INSTALLATION_GUIDE.md](./docs/INSTALLATION_GUIDE.md) | Setup instructions |
| [docs/TLDR.md](./docs/TLDR.md) | Quick command reference |
| [docs/AUTONOMOUS_MODE.md](./docs/AUTONOMOUS_MODE.md) | YOLO mode, budget tracking, notifications |
| [docs/GREPTILE_INTEGRATION.md](./docs/GREPTILE_INTEGRATION.md) | AI code review setup |
| [docs/CLAUDE_CODE_FEATURES.md](./docs/CLAUDE_CODE_FEATURES.md) | Claude Code features reference |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Version history |
| [.skills/README.md](./.skills/README.md) | Skills documentation (33 skills) |

---

## Autonomous Mode (v3.12.0)

Run complete workflows with minimal interaction:

```bash
# YOLO mode - skip permission dialogs (hooks still enforce quality)
claude --dangerously-skip-permissions -p "/api-create stripe-checkout"
```

### Features

| Feature | Description |
|---------|-------------|
| **YOLO Mode** | `--dangerously-skip-permissions` skips dialogs, hooks still run |
| **Budget Tracking** | Warn at 60%, pause at 80% token usage |
| **ntfy Notifications** | Push notifications when user input is needed |
| **Resume Commands** | Notifications include `claude --resume {session_id}` |
| **Phase Summaries** | Automatic summaries after each phase completion |

### Configuration

All settings in `.claude/autonomous-config.json`:

```json
{
  "yolo_mode": { "enabled": true },
  "budget": { "max_tokens": 75000, "warn_at_percent": 60, "pause_at_percent": 80 },
  "notifications": { "enabled": true, "ntfy_topic": "your-topic" }
}
```

---

## Testing the Toolkit

### Prerequisites

1. Claude Code CLI installed (`npm install -g @anthropic/claude-code`)
2. Context7 MCP server configured: `claude mcp add context7 -- npx -y @upstash/context7-mcp`
3. (Optional) Greptile API key, Graphite CLI

### Quick Test - Single API Endpoint

```bash
# Interactive mode (recommended for first run)
claude -p "/api-create weather-forecast"

# Autonomous mode (YOLO)
claude --dangerously-skip-permissions -p "/api-create stripe-checkout"
```

### Test All Workflow Modes

```bash
# API Create (13 phases)
claude -p "/api-create weather-forecast"

# UI Component (13 phases with Storybook)
claude -p "/hustle-ui-create UserAvatar"

# UI Page (13 phases with Playwright E2E)
claude -p "/hustle-ui-create-page dashboard"

# Combine APIs (orchestration)
claude -p "/hustle-combine weather-forecast stripe-checkout"
```

### Verify Installation

```bash
# Check hooks are registered
cat .claude/settings.json | jq '.hooks'

# Check state file
cat .claude/api-dev-state.json | jq '.phases'

# Check budget tracking
cat .claude/api-dev-state.json | jq '.session_metrics'

# Check autonomous config
cat .claude/autonomous-config.json
```

---

## What's Installed Automatically

**Storybook** and **Playwright** are now REQUIRED and installed automatically:

| Tool | Purpose | Details |
|------|---------|---------|
| **Storybook** | Component development | Required for `/hustle-ui-create` |
| **Playwright** | E2E testing | Required for `/hustle-ui-create-page` |

## Optional Integrations

Install with flags or configure later:

```bash
npx @hustle-together/api-dev-tools --scope=project --with-greptile --with-ntfy
```

| Tool | Purpose | Flag | Setup |
|------|---------|------|-------|
| **Greptile** | AI code review via MCP | `--with-greptile` | Requires `GREPTILE_API_KEY` env var |
| **Sandpack** | Live UI previews | `--with-sandpack` | Auto-install during setup |
| **ntfy** | Push notifications | `--with-ntfy` | [ntfy.sh](https://ntfy.sh) |

These are optional - workflows complete without them.

---

## Requirements

- **Claude Code** 1.0.0+ (or compatible platform)
- **Python** 3.9+ (for hooks)
- **Node.js** 18+
- **pnpm** 10.11.0+

### Recommended MCP Servers

- **Context7** - Live documentation lookup
- **GitHub** - PR creation and management

---

## License

MIT © [Hustle Together](https://github.com/hustle-together)

---

**Full documentation**: [docs/FULL_DOCUMENTATION.md](./docs/FULL_DOCUMENTATION.md)
