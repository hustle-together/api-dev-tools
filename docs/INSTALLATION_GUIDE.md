# Installation Guide

> **Version:** 3.12.0 | **Last Updated:** December 26, 2025

## Quick Install

```bash
# Via NPM (recommended)
npx @hustle-together/api-dev-tools --scope=project

# With optional integrations
npx @hustle-together/api-dev-tools --scope=project --with-greptile --with-graphite --with-storybook
```

---

## Installation Options

### Basic Installation

```bash
npx @hustle-together/api-dev-tools --scope=project
```

This installs:
- 33 Agent Skills in `.claude/commands/`
- 39 Enforcement Hooks in `.claude/hooks/`
- State tracking in `.claude/api-dev-state.json`
- Autonomous config in `.claude/autonomous-config.json`
- Research cache in `.claude/research/`
- Templates in `.claude/templates/`

### With Optional Integrations

```bash
# Full installation with all optional tools
npx @hustle-together/api-dev-tools --scope=project \
  --with-storybook \
  --with-playwright \
  --with-greptile \
  --with-graphite \
  --with-ntfy
```

### Installation Flags

| Flag | Description |
|------|-------------|
| `--scope=project` | Install for current project (required) |
| `--with-storybook` | Initialize Storybook for component development |
| `--with-playwright` | Initialize Playwright for E2E testing |
| `--with-sandpack` | Install Sandpack for live code editing |
| `--with-greptile` | Create .greptile.json for AI code review |
| `--with-graphite` | Enable Graphite stacked PRs workflow |
| `--with-ntfy` | Enable ntfy push notifications |
| `-i`, `--interactive` | Run interactive setup wizard |
| `--no-interactive` | Skip interactive prompts |

---

## Post-Installation Setup

### 1. Configure MCP Servers

The installer adds these automatically, but verify they're working:

```bash
# Check MCP servers
claude mcp list

# Should show:
# - context7 (Live documentation)
# - github (GitHub integration)
```

If missing, add manually:

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp add github -- npx -y @modelcontextprotocol/server-github
```

### 2. Configure Environment Variables

For GitHub MCP:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"
```

For Greptile (if using):
```bash
export GREPTILE_API_KEY="your_greptile_key"
export GREPTILE_GITHUB_TOKEN="ghp_your_token_here"
```

### 3. Configure Autonomous Mode

Edit `.claude/autonomous-config.json`:

```json
{
  "version": "3.12.0",
  "yolo_mode": {
    "enabled": true,
    "max_retries": 3
  },
  "budget": {
    "enabled": true,
    "max_tokens": 75000,
    "warn_at_percent": 60,
    "pause_at_percent": 80
  },
  "notifications": {
    "enabled": true,
    "ntfy_topic": "your-custom-topic",
    "notify_on": [
      "session_start",
      "phase_complete",
      "budget_warning",
      "budget_pause",
      "workflow_complete",
      "error",
      "user_input_required"
    ]
  },
  "subagents": {
    "explore_model": "sonnet",
    "parallel_agents": 3
  }
}
```

### 4. Test Installation

```bash
# Verify hooks are registered
cat .claude/settings.json | jq '.hooks'

# Verify state file exists
cat .claude/api-dev-state.json | jq '.'

# Verify autonomous config
cat .claude/autonomous-config.json | jq '.'

# Run a test workflow
claude -p "/api-status"
```

---

## Configuration Reference

### autonomous-config.json

| Section | Key | Default | Description |
|---------|-----|---------|-------------|
| `yolo_mode` | `enabled` | `true` | Enable YOLO execution mode |
| `yolo_mode` | `max_retries` | `3` | Max retries on failure |
| `budget` | `enabled` | `true` | Enable token budget tracking |
| `budget` | `max_tokens` | `75000` | Maximum tokens per session |
| `budget` | `warn_at_percent` | `60` | Warning threshold |
| `budget` | `pause_at_percent` | `80` | Pause threshold |
| `notifications` | `enabled` | `true` | Enable ntfy notifications |
| `notifications` | `ntfy_topic` | `hustleserver` | ntfy topic name |
| `notifications` | `notify_on` | `[...]` | Events to notify on |
| `subagents` | `explore_model` | `sonnet` | Model for Explore agents |
| `subagents` | `parallel_agents` | `3` | Max parallel research agents |
| `integrations.greptile` | `enabled` | `false` | Enable Greptile AI review |
| `integrations.graphite` | `enabled` | `false` | Enable Graphite stacked PRs |

### Notification Events

- `session_start` - When workflow begins
- `phase_complete` - After each phase completes
- `budget_warning` - At 60% token usage
- `budget_pause` - At 80% token usage
- `workflow_complete` - When all phases done
- `error` - On workflow errors
- `user_input_required` - When waiting for user decision

---

## Updating

To update to the latest version:

```bash
npx @hustle-together/api-dev-tools@latest --scope=project
```

This preserves:
- `.claude/api-dev-state.json` (your progress)
- `.claude/autonomous-config.json` (your settings)
- `.claude/research/` (cached research)

---

## Troubleshooting

### Hooks Not Running

1. Verify Python 3 is installed:
   ```bash
   python3 --version
   ```

2. Make hooks executable:
   ```bash
   chmod +x .claude/hooks/*.py
   ```

3. Check settings.json has hooks registered:
   ```bash
   cat .claude/settings.json | jq '.hooks'
   ```

### MCP Servers Not Working

1. Restart Claude Code after adding MCP servers
2. Verify environment variables are set
3. Check server status: `claude mcp get context7`

### ntfy Notifications Not Sending

1. Verify curl is installed: `which curl`
2. Test ntfy manually: `curl -d "test" ntfy.sh/your-topic`
3. Check notifications.enabled is true in config

---

## Files Created

After installation, your project will have:

```
.claude/
├── commands/           # Skill markdown files
├── hooks/              # Python enforcement hooks
├── templates/          # Component/page templates
├── research/           # Cached API research
├── api-dev-state.json  # Workflow state
├── autonomous-config.json # Autonomous mode config
├── settings.json       # Hook registration
├── registry.json       # API/component registry
├── BRAND_GUIDE.md      # Brand colors/fonts
└── performance-budgets.json # TDD thresholds
```

---

## Support

- **Issues**: [github.com/hustle-together/api-dev-tools/issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Documentation**: [docs/FULL_DOCUMENTATION.md](./FULL_DOCUMENTATION.md)
- **Changelog**: [docs/CHANGELOG.md](./CHANGELOG.md)
