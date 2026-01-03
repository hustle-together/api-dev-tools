# Claude Code Implementation Patterns for Devkit

Building a production-ready AI-assisted development workflow system requires mastering hooks, subagents, autonomous loops, and state management. This guide provides the complete implementation patterns for the Devkit system with **17 hooks, 6 subagents, and 14 conditional phases**.

## Core Architecture Overview

Claude Code's extensibility rests on three pillars: **hooks** intercept tool execution and session events, **subagents** provide isolated context windows for specialized tasks, and **slash commands** encode reusable workflows. The Ralph Wiggum pattern enables autonomous loops, while MCP servers extend capabilities with external tools.

The Devkit system maps to these primitives:
- **17 hooks** → PreToolUse, PostToolUse, Stop, SubagentStop, SessionStart matchers
- **6 subagents** → Markdown files with YAML frontmatter in `.claude/agents/`
- **14 phases** → Orchestrated through state.json + registry.json
- **5 workflows** → Slash commands in `.claude/commands/`

---

## Part 1: Hooks Complete Implementation

### Settings.json Configuration Hierarchy

Files are processed in priority order (highest first):
1. **Enterprise**: `/Library/Application Support/ClaudeCode/managed-settings.json` (macOS)
2. **Local project**: `.claude/settings.local.json` (gitignored)
3. **Shared project**: `.claude/settings.json` (team-shared via git)
4. **User**: `~/.claude/settings.json` (global)

### Hook Events and Exit Code Behavior

| Event | Purpose | Exit Code 2 Effect |
|-------|---------|-------------------|
| **PreToolUse** | Before tool execution | Blocks tool, shows stderr to Claude |
| **PostToolUse** | After tool completion | Shows feedback to Claude |
| **Stop** | Main agent finishes | **Blocks stopping, forces continuation** |
| **SubagentStop** | Subagent finishes | Blocks subagent stop |
| **SessionStart** | Session begins | Context injection only |
| **UserPromptSubmit** | Before processing prompt | Blocks prompt |

Exit code meanings: **0** = success (allow), **2** = blocking error (stderr fed to Claude), **other** = non-blocking.

### Hook Configuration JSON Format

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/validate_bash.py",
            "timeout": 10
          }
        ]
      },
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/file_protection.py"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/verify_gate.py"
          }
        ]
      }
    ]
  }
}
```

Matcher patterns: exact (`"Write"`), regex (`"Edit|Write"`), all (`"*"` or `""`), MCP (`"mcp__memory__.*"`).

### JSON Output Schema for Advanced Control

Hooks can return structured JSON to stdout for sophisticated control:

```json
{
  "continue": true,
  "stopReason": "Message when continue=false",
  "suppressOutput": false,
  "decision": "block",
  "reason": "Why blocked - fed back to Claude",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": { "field": "modified_value" }
  }
}
```

---

## Part 2: Subagent Implementation

### File Format and Locations

- **Project subagents**: `.claude/agents/` (highest priority)
- **User subagents**: `~/.claude/agents/` (global)

### Complete YAML Frontmatter Configuration

```markdown
---
name: your-subagent-name
description: When this subagent should be invoked
tools: Read, Edit, Grep, Glob, Bash
model: sonnet
permissionMode: default
skills: skill1, skill2
---

Your subagent's system prompt goes here.
```

| Field | Required | Values |
|-------|----------|--------|
| `name` | Yes | lowercase-with-hyphens |
| `description` | Yes | Natural language |
| `tools` | No | Comma-separated; omit for all tools |
| `model` | No | `sonnet`, `opus`, `haiku`, `inherit`, or full string |
| `permissionMode` | No | `default`, `acceptEdits`, `bypassPermissions`, `plan` |

**Model selection guidance**: Use **Haiku** for fast searches and lookups, **Sonnet** for complex reasoning and code modification, **Opus** for high-stakes reviews.

### Spawning Subagents

Include `Task` in allowedTools to spawn subagents. Subagents **cannot spawn their own subagents** - don't include `Task` in subagent tools.

---

## Part 3: Ralph Wiggum Autonomous Loops

The Ralph Wiggum pattern transforms Claude Code from one-shot to **self-correcting autonomous agent**. Named after The Simpsons character, it embodies persistent iteration.

### Core Mechanism

Geoffrey Huntley's original pattern:
```bash
while :; do cat PROMPT.md | claude ; done
```

Modern implementation uses Stop hooks with **exit code 2** to block Claude from stopping and feed stderr back as instructions.

### Prompt Patterns for Autonomous Loops

**TDD development loop**:
```
Implement [FEATURE] using TDD.

Process:
1. Write failing test for next requirement
2. Implement minimal code to pass
3. Run tests
4. If failing, fix and retry
5. Refactor if needed
6. Repeat for all requirements

Requirements: [LIST]

Output <promise>DONE</promise> when all tests green.
```

**Bug fixing loop**:
```
Fix bug: [DESCRIPTION]

Steps:
1. Reproduce the bug
2. Identify root cause
3. Implement fix
4. Write regression test
5. Verify fix works

After 15 iterations if not fixed:
- Document blocking issues
- Suggest alternatives

Output <promise>FIXED</promise> when resolved.
```

### Safety Mechanisms

1. **Max iterations** (primary): Always set `--max-iterations`
2. **Completion promise**: Uses exact string matching
3. **stop_hook_active check**: Prevents infinite loops in hook itself
4. **Sandboxing**: Use Docker or Claude's native sandbox mode

---

## Part 4: Slash Commands

### File Format

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
model: claude-3-5-haiku-20241022
---

Your slash command prompt goes here.
```

### Key Patterns

**! prefix** executes bash before command runs:
```markdown
## Context

- Git status: !`git status`
- Current diff: !`git diff HEAD`
- Recent commits: !`git log --oneline -5`
```

**$ARGUMENTS** captures all arguments:
```markdown
Fix issue #$ARGUMENTS following our coding standards
```

---

## Part 5: MCP Server Configuration

### .mcp.json File Format

Location: project root (team-shared) or `~/.claude.json` (user-wide)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "vitest": {
      "command": "npx",
      "args": ["-y", "@djankies/vitest-mcp"]
    }
  }
}
```

### Adding MCP Servers via CLI

```bash
# Context7 for documentation lookup
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Playwright for visual testing
claude mcp add playwright npx @playwright/mcp@latest

# GitHub for PR/issue management (HTTP)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

---

## Part 6: Plan Mode and Auto-Accept

### Mode Cycling

**Shift+Tab** cycles through modes:
1. **Normal Mode** - Requires approval for edits
2. **Auto-Accept Mode** (`⏵⏵ accept edits on`) - Accepts file edits automatically
3. **Plan Mode** (`⏸ plan mode on`) - Read-only research

### Plan Mode Available Tools

Read-only tools only: `Read`, `LS`, `Glob`, `Grep`, `Task`, `WebFetch`, `WebSearch`, `TodoRead/TodoWrite`, `NotebookRead`

Blocked: `Edit`, `Write`, `Bash`, `MultiEdit`

### CLI Flags

```bash
# Start in Plan Mode
claude --permission-mode plan

# Start in Accept Edits mode
claude --permission-mode acceptEdits

# YOLO mode (use with caution in sandboxed environment)
claude --dangerously-skip-permissions
```

---

## Part 7: TDD Enforcement with Isolated Subagents

### The Context Pollution Problem

Single-context TDD fails because the LLM "cheats" - test writer's analysis bleeds into implementer's thinking. **Solution**: Subagent isolation.

### Three-Subagent TDD Workflow

**Phase 1 - RED** (tdd-test-writer): Writes failing tests with no implementation knowledge
**Phase 2 - GREEN** (tdd-implementer): Sees only the failing test, writes minimal code
**Phase 3 - REFACTOR** (tdd-refactorer): Evaluates with fresh context

### TDD Guard Integration

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [{
        "type": "command",
        "command": "tdd-guard"
      }]
    }]
  }
}
```

TDD Guard blocks:
- Implementation without failing tests
- Over-implementation beyond test requirements
- Adding multiple tests simultaneously

---

## Part 8: State Management

### Two-File Architecture

**state.json** - Workflow progress (ephemeral, resets per workflow)
**registry.json** - Created artifacts (persistent, survives across workflows)

### Checkpoint/Resume Pattern

```bash
# Resume most recent session
claude --continue

# Interactive session picker
claude --resume

# Resume specific session
claude --resume 550e8400-e29b-41d4-a716-446655440000
```

---

## Key Implementation Insights

**Boris Cherny's verification insight**: "Give Claude a way to verify its work, and it produces **2-3x better results**." Implement Stop hooks that run tests and block completion until they pass.

**Context isolation for TDD**: Use separate subagents for test writing, implementation, and refactoring. Without isolation, the LLM designs tests around anticipated implementation.

**Research caching**: Store research results in `.devkit/research-cache.json` with 7-day TTL. Check cache before web searches to save time and maintain consistency.

**Registry-aware skipping**: Before each phase, check `registry.json` for existing artifacts. Skip phases when artifacts exist with matching checksums to avoid duplicate work.

**Ralph Wiggum for autonomous loops**: Exit code 2 blocks stopping and feeds stderr back to Claude. Always set max iterations as primary safety. Use XML tag completion promises (`<promise>DONE</promise>`) for reliable detection.

This architecture consolidates the system into a maintainable, production-ready workflow with clear separation of concerns between hooks (enforcement), subagents (specialized tasks), commands (workflows), and state management (progress tracking).
