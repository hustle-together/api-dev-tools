# Claude Code Features Reference

> **Last Updated:** December 26, 2025
> **Covers:** v2.0.68 - v2.0.74 (October - December 2025)

This document tracks Claude Code features relevant to api-dev-tools development and optimization.

---

## Table of Contents

1. [LSP Support](#lsp-support)
2. [Subagents & Custom Agents](#subagents--custom-agents)
3. [Background Agents](#background-agents)
4. [Claude in Chrome](#claude-in-chrome)
5. [Thinking Mode & Extended Thinking](#thinking-mode--extended-thinking)
6. [Memory System](#memory-system)
7. [Hooks System](#hooks-system)
8. [Plugin & Skills Marketplace](#plugin--skills-marketplace)
9. [MCP Servers](#mcp-servers)
10. [Usage Tracking & Context](#usage-tracking--context)
11. [Sessions & History](#sessions--history)
12. [Model Configuration](#model-configuration)
13. [IDE Integration](#ide-integration)
14. [Terminal Features](#terminal-features)
15. [Keyboard Shortcuts](#keyboard-shortcuts)
16. [Enterprise Features](#enterprise-features)

---

## LSP Support

**Added:** v2.0.74 (December 2025)

Language Server Protocol integration for code intelligence:

| Feature | Description |
|---------|-------------|
| **Go-to-definition** | Jump to function/class definitions |
| **Find references** | See where symbols are used across codebase |
| **Hover documentation** | View type info and docs inline |
| **Instant diagnostics** | See errors without running builds |

**Impact on api-dev-tools:** Could enhance the `/api-verify` phase by using LSP to validate type definitions match research findings.

**Source:** [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

---

## Subagents & Custom Agents

**Added:** July 2025, enhanced December 2025

Subagents are separate agent instances spawned for focused subtasks.

### Why Use Subagents

1. **Parallelization** - Multiple subagents work simultaneously
2. **Context isolation** - Each subagent has its own context window
3. **Specialized instructions** - Custom prompts per agent type

### Defining Subagents

**Filesystem-based:**
```
.claude/agents/
├── docs-consultant.md    # Project-level
├── code-reviewer.md
└── test-writer.md

~/.claude/agents/
├── my-helper.md          # User-level (all projects)
```

**Agent file structure:**
```yaml
---
name: docs-consultant
description: Looks up documentation using Context7
tools:
  - mcp__context7__resolve-library-id
  - mcp__context7__get-library-docs
model: haiku
---

You are a documentation specialist. Use Context7 to find accurate, up-to-date documentation...
```

### Built-in Subagents

| Agent | Purpose | Mode | Default Model |
|-------|---------|------|---------------|
| **Explore** | Fast codebase search/analysis | Read-only | Configurable (Sonnet recommended) |
| **Plan** | Research and design before implementation | Plan mode | Same as parent |
| **General-purpose** | Multi-step autonomous tasks | Full access | Same as parent |

### Explore Agent Details

The Explore agent is optimized for fast, read-only codebase analysis:

**Characteristics:**
- Uses separate context window (doesn't fill main context)
- Read-only access (Glob, Grep, Read tools only)
- Fast responses for codebase search
- Multiple can run in parallel

**Configuring Explore Model:**
```json
// In .claude/autonomous-config.json
{
  "subagents": {
    "use_explore_for_research": true,
    "explore_model": "sonnet",  // NOT haiku - use Sonnet for quality
    "parallel_research_agents": 3,
    "background_verification": true
  }
}
```

**Why Sonnet over Haiku for Explore:**
- Better understanding of codebase patterns
- More accurate file discovery
- Fewer false positives in search results
- Worth the marginal cost increase for research quality

### Invoking Subagents

```bash
# Via /agents command
/agents

# Claude auto-invokes based on task description
# Or explicitly via Task tool with subagent_type parameter
```

**In Autonomous Mode:**
Research phases automatically spawn Explore agents:
```
Phase 3 (Initial Research):
  ├── Explore Agent 1: Search codebase for existing implementations
  ├── Explore Agent 2: Find related types/schemas
  └── Explore Agent 3: Check test patterns

Results return without filling main context window.
```

**Impact on api-dev-tools:** Parallelizes research phases (Phase 3/5) using multiple Explore agents configured with Sonnet model.

**Sources:**
- [Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

## Background Agents

**Added:** December 2025

Run agents asynchronously while continuing to work.

### How It Works

```javascript
// Launch in background
Task tool with run_in_background: true

// Monitor progress
TaskOutput tool with block: false  // Non-blocking check

// Wait for results
TaskOutput tool with block: true   // Blocking wait
```

### Key Benefits

- Long-running tasks don't block your session
- Monitor multiple agents simultaneously
- Subagents don't count against main context budget

**Impact on api-dev-tools:** Could run verification (Phase 10) in background while user reviews implementation.

**Source:** [Enabling Claude Code to Work More Autonomously](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)

---

## Claude in Chrome

**Added:** v2.0.72 (December 2025)

Browser control integration with Chrome extension.

### Features

- Control browser directly from Claude Code
- Record workflows and "teach" Claude to repeat them
- Works with Chrome extension at https://claude.ai/chrome

### Availability

- Initially Max subscribers only ($200/month)
- Expanded to all paid subscribers (December 19, 2025)

**Impact on api-dev-tools:** Could automate browser-based API testing or documentation screenshots.

**Sources:**
- [Claude in Chrome Release Notes](https://support.claude.com/en/articles/12306336-claude-in-chrome-release-notes)
- [Piloting Claude in Chrome](https://claude.com/blog/claude-for-chrome)

---

## Thinking Mode & Extended Thinking

**Enhanced:** November 2025 (Opus 4.5 release)

### Extended Thinking

- Internal reasoning before responding
- Available in Sonnet 3.7+, Haiku 4.5, Opus 4/4.1/4.5

### Budget Tokens

| Parameter | Description |
|-----------|-------------|
| `budget_tokens` | Maximum tokens for internal reasoning |
| Minimum | 1,024 tokens |
| Recommended | Start low, increase incrementally |

### Effort Parameter (Opus 4.5 Only)

Control thinking depth per-request:

| Effort | Behavior |
|--------|----------|
| `low` | Faster, fewer tokens |
| `medium` | Balanced (matches Sonnet 4.5 quality with 76% fewer tokens) |
| `high` | Maximum thoroughness (+4.3% vs Sonnet 4.5, 48% fewer tokens) |

### Claude Code Integration

```bash
# Toggle thinking mode
Alt+T (Linux/Windows) or Tab (legacy)

# Thinking enabled by default for Opus 4.5
```

**Impact on api-dev-tools:** Thinking mode could improve research quality in Phase 3/5.

**Sources:**
- [Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5)
- [Building with Extended Thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)

---

## Memory System

### Memory Locations

| Location | Scope | Purpose |
|----------|-------|---------|
| `~/.claude/CLAUDE.md` | User | Personal preferences (all projects) |
| `./CLAUDE.md` | Project | Project instructions (root) |
| `./.claude/CLAUDE.md` | Project | Alternative location |
| `./CLAUDE.local.md` | Local | Personal notes (not committed) |
| `./.claude/rules/*.md` | Project | Organized rule files |

### Import Syntax

```markdown
# In CLAUDE.md
@path/to/import.md
@docs/api-standards.md
@../shared/conventions.md
```

- Relative and absolute paths supported
- Recursive imports (max depth: 5)
- `CLAUDE.local.md` deprecated in favor of imports

### Rules Directory

```
.claude/rules/
├── code-style.md      # Auto-loaded
├── testing.md         # Auto-loaded
├── security.md        # Auto-loaded
└── frontend/          # Scoped rules with paths: frontmatter
    └── react.md
```

### Commands

| Command | Purpose |
|---------|---------|
| `/memory` | View loaded memory files |
| `/init` | Auto-generate CLAUDE.md |

**Best Practices:**
- Keep CLAUDE.md under 500 lines
- Use imports for detailed specs
- Precedence: Project > @import > User

**Impact on api-dev-tools:** Already using this system effectively. Consider migrating more to `.claude/rules/`.

**Sources:**
- [Manage Claude's Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Tips: Maximizing Memory](https://cloudartisan.com/posts/2025-04-16-claude-code-tips-memory/)

---

## Hooks System

### Lifecycle Events (8 total)

| Event | When | Use Case |
|-------|------|----------|
| `SessionStart` | New conversation begins | Load context, environment setup |
| `SessionEnd` | Session ends | Cleanup, logging |
| `UserPromptSubmit` | Before prompt processed | Validation, injection |
| `PreToolUse` | Before tool execution | Block/allow, modify params |
| `PostToolUse` | After tool completes | Logging, auto-format, cascade |
| `PermissionRequest` | Permission dialog shown | Auto-allow/deny |
| `Notification` | Notification sent | Custom alerts |
| `Stop` | Response complete | Workflow checks |

### Configuration Levels

| Level | File | Scope |
|-------|------|-------|
| User | `~/.claude/settings.json` | All projects |
| Project | `.claude/settings.json` | Team-shared |
| Local | `.claude/settings.local.json` | Personal (not committed) |

### Hook Control

| Exit Code | Effect |
|-----------|--------|
| 0 | Continue normally |
| 2 | Block action, send error to Claude |

**JSON control:**
```json
{
  "permissionDecision": "deny",  // or "allow", "ask"
  "message": "Blocked: reason here"
}
```

**Impact on api-dev-tools:** Core of our enforcement system. All 42 hooks leverage this (including 3 new autonomous mode hooks).

**Sources:**
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Hooks Mastery](https://github.com/disler/claude-code-hooks-mastery)

---

## Plugin & Skills Marketplace

### Plugin System

```bash
# Browse marketplace
/plugin

# Tabs: Discover, Installed, Errors

# Install plugin
/plugin install <name>

# Installation scopes
--scope user     # Default: yourself, all projects
--scope project  # All collaborators
--scope local    # Yourself, this repo only
```

### Official Marketplace

- `claude-plugins-official` - Auto-available
- Contains verified skills and plugins

### Third-Party Marketplaces

- JSON-based catalogs in Git repos
- Free and open-source ecosystem
- Sites like [claude-plugins.dev](https://claude-plugins.dev/) index 45,000+ skills

### Skills vs Commands

| Type | Trigger | Activation |
|------|---------|------------|
| Command | `/command` | Explicit user invocation |
| Skill | Automatic | AI decides based on context |

### Agent Skills Standard

- Released October 2025
- Open standard adopted by OpenAI (Codex CLI, ChatGPT)
- SKILL.md format with YAML frontmatter

**Impact on api-dev-tools:** We use Agent Skills format. Could publish to marketplace.

**Sources:**
- [Discover Plugins](https://code.claude.com/docs/en/discover-plugins)
- [Introducing Agent Skills](https://www.anthropic.com/news/skills)
- [Agent Skills Marketplace](https://skillsmp.com)

---

## MCP Servers

### Adding MCP Servers

```bash
# Add server
claude mcp add <name> -- <command>

# Example: Context7
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# List servers
claude mcp list

# Remove server
claude mcp remove <name>

# Test server
claude mcp get <name>
```

### Configuration Locations

| File | Scope |
|------|-------|
| `.mcp.json` | Project (checked in) |
| `.claude/settings.json` | User or project |

### Permissions

```json
{
  "permissions": {
    "allow": [
      "mcp__context7__*",
      "mcp__github__*"
    ]
  }
}
```

### Key MCP Servers

| Server | Purpose |
|--------|---------|
| **Context7** | Up-to-date documentation lookup |
| **GitHub** | PR/issue management |
| **Playwright** | Browser automation |
| **Puppeteer** | Web scraping |

**Impact on api-dev-tools:** Context7 is required for research phases. GitHub for PR creation.

**Sources:**
- [Add MCP Servers Guide](https://mcpcat.io/guides/adding-an-mcp-server-to-claude-code/)
- [Context7 GitHub](https://github.com/upstash/context7)

---

## Usage Tracking & Context

### Commands

| Command | Purpose |
|---------|---------|
| `/context` | View context usage (tokens, %) |
| `/cost` | Session cost breakdown |
| `/stats` | Usage statistics, streaks, graphs |

### Token Limits by Plan

| Plan | Limit |
|------|-------|
| Claude Max 5 | ~88,000 tokens |
| Claude Max 20 | ~220,000 tokens |
| Pro | Standard limits |

### Auto-Compaction

- Triggers at 80-95% context capacity
- Summarizes conversation history
- Session continues with summary + recent context

### Context Window Info

- Added to status line (v2.0.70)
- `current_usage` field for accurate % calculations

### Context Optimization

- **Subagents don't count** against main context
- Use Explore agents for large searches
- Imported files load on demand

**Impact on api-dev-tools:** Our `periodic-reground.py` hook injects context every 7 turns to prevent dilution before auto-compaction.

**Source:** [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

---

## Sessions & History

### Named Sessions

```bash
# Rename current session
/rename my-feature-work

# Resume by name
/resume my-feature-work

# Resume by number
/resume 3

# From CLI
claude --resume my-feature-work
claude --resume 3
```

### Session Forking

```bash
# Fork with custom ID
claude --resume <session> --fork-session --session-id my-fork
```

### Resume Screen

- Grouped forked sessions
- Keyboard shortcuts:
  - `P` - Preview session
  - `R` - Rename session

**Impact on api-dev-tools:** `/api-sessions` skill could leverage named sessions for workflow continuity.

**Source:** [Releasebot - Claude Code Updates](https://releasebot.io/updates/anthropic/claude-code)

---

## Model Configuration

### Switching Models

| Method | Usage |
|--------|-------|
| During session | `/model <alias>` or `Alt+P` / `Option+P` |
| Startup | `claude --model <alias>` |
| Environment | `ANTHROPIC_MODEL=<name>` |
| Config | `model` field in settings |

### Model Aliases

| Alias | Model |
|-------|-------|
| `sonnet` | Claude Sonnet 4.5 |
| `opus` | Claude Opus 4.5 |
| `haiku` | Claude Haiku 4.5 |
| `opusplan` | Opus in plan mode, Sonnet in execution |

### Haiku 4.5 for Agents

- 90% of Sonnet 4.5 agentic performance
- 2x faster, 3x cheaper ($1/$5 vs $3/$15)
- Optimal for lightweight, frequent agents

**Impact on api-dev-tools:** Use Sonnet for Explore subagents (better quality), Opus for complex reasoning. Avoid Haiku for research tasks.

**Sources:**
- [Model Configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code Model Configuration Help](https://support.claude.com/en/articles/11940350-claude-code-model-configuration)

---

## IDE Integration

### VSCode Features

| Feature | Version |
|---------|---------|
| Tab icon badges | v2.0.73 |
| - Blue: Pending permissions | |
| - Orange: Unread completions | |
| Copy button on code blocks | Recent |
| Windows ARM64 support | Recent |
| Gift tag for promotions | v2.0.74 |

### Clickable Links

```markdown
[filename.ts](src/filename.ts)           # File
[filename.ts:42](src/filename.ts#L42)    # Line
[filename.ts:42-51](src/filename.ts#L42-L51)  # Range
[src/utils/](src/utils/)                 # Folder
```

### Selection Context

- IDE selection auto-included in prompts
- Marked with `ide_selection` tags

**Impact on api-dev-tools:** We already use clickable links in CLAUDE.md formatting.

---

## Terminal Features

### Terminal Support (v2.0.74)

`/terminal-setup` now supports:
- Kitty
- Alacritty
- Zed
- Warp

### Syntax Highlighting

- New engine in native build (v2.0.71)
- `Ctrl+T` to toggle on/off in `/theme`
- Theme picker shows highlighting info

### Other Improvements

- Reduced flickering (v2.0.72)
- IME support for CJK languages (v2.0.68)
- Proper word navigation for non-Latin text

---

## Keyboard Shortcuts

### Key Bindings

| Shortcut | Action |
|----------|--------|
| `Alt+T` / `Option+T` | Toggle thinking mode |
| `Alt+P` / `Option+P` | Switch model |
| `Alt+Y` | Yank-pop (cycle kill ring) |
| `Ctrl+T` | Toggle syntax highlighting |
| `Ctrl+Y` | Yank (paste from kill ring) |
| `Ctrl+K` | Cut line |
| `Ctrl+S` | Copy stats screenshot |
| `Enter` | Accept and submit suggestion |
| `Tab` | Accept suggestion for editing |

---

## Enterprise Features

**Added:** v2.0.68

- Managed settings for administrators
- Contact Anthropic account team to enable
- Centralized configuration control

---

## Changelog Summary (Last 3 Months)

### December 2025 (v2.0.68 - v2.0.74)

- LSP support
- Claude in Chrome beta
- Named sessions with /rename
- Background agents
- Plugin search improvements
- IME support for CJK
- Enterprise managed settings
- Thinking mode toggle (Alt+T)
- Model switching (Alt+P)
- Session forking with custom IDs

### November 2025

- Claude Opus 4.5 release
- Extended thinking improvements
- Effort parameter (Opus 4.5)
- `.claude/rules/` directory support
- Prompt suggestions
- Context window in status line
- 3x memory usage improvement

### October 2025

- Agent Skills specification released
- Haiku 4.5 release
- Custom subagents (`/agents`)
- Plugin marketplace enhancements
- Customizable status line (`/statusline`)

---

## Recommendations for api-dev-tools

Based on this research, consider enhancing:

| Feature | Potential Use | Status |
|---------|---------------|--------|
| **Subagents** | Parallel research in Phase 3/5 | Implemented (v3.12.0) |
| **Background agents** | Run verification while user works | Configured |
| **YOLO mode** | Autonomous workflow execution | Default (v3.12.0) |
| **Budget tracking** | Token limit management | Implemented (v3.12.0) |
| **LSP integration** | Type-check schemas against docs | Future |
| **Named sessions** | Workflow continuity for `/api-continue` | Future |
| **Sonnet for Explore** | Quality research over cost savings | Implemented |
| **Effort parameter** | Control thinking depth per phase | Future |
| **Chrome integration** | Browser-based API testing | Future |

### Implemented in v3.12.0

- **Autonomous mode** with YOLO as default execution mode
- **Sonnet for Explore agents** (not Haiku - quality over cost)
- **Budget tracking** with warn at 60%, pause at 80%
- **Phase summaries** for review of autonomous runs
- **ntfy notifications** for progress and errors
- **Greptile integration** for AI code review
- **Graphite integration** for stacked PRs

---

## Sources

- [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code Documentation](https://code.claude.com/docs)
- [Claude Help Center](https://support.claude.com/)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering)
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk)
- [Releasebot Updates](https://releasebot.io/updates/anthropic/claude-code)
- [ClaudeLog](https://claudelog.com/)

---

**Version:** 3.12.0
**Author:** Hustle Together
**License:** MIT
