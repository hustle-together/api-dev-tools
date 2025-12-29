# Plugin Architecture

**Version:** 3.12.12
**Last Updated:** 2025-12-28

This document explains how Hustle API Dev Tools works as a plugin for Claude Code and other AI-assisted development environments.

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Components](#components)
- [Installation Methods](#installation-methods)
- [State Management](#state-management)
- [Lifecycle Flow](#lifecycle-flow)
- [Cross-Platform Support](#cross-platform-support)

---

## Overview

Hustle API Dev Tools is a **plugin/extension** for AI coding assistants that enforces a research-first, interview-driven development methodology.

### What It Provides

| Component | Purpose |
|-----------|---------|
| **Skills** | Slash commands (`/api-create`, `/red`, `/commit`) |
| **Hooks** | Lifecycle enforcement (block writes until research done) |
| **Agents** | Specialized sub-processors (parallel-researcher, schema-generator) |
| **Templates** | UI components, pages, configs |
| **Scripts** | Programmatic manifest generation |
| **State** | Persistent workflow tracking |

### How It Works

```
User runs: /api-create my-endpoint
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Skill: api-create.md                            │   │
│  │  - Orchestrates 14-phase workflow                │   │
│  │  - Calls tools (Read, Write, WebSearch)          │   │
│  │  - Spawns specialized agents                     │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Hooks: enforce-research.py, verify-after-green  │   │
│  │  - Block unauthorized actions                    │   │
│  │  - Inject context                                │   │
│  │  - Track progress                                │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  State: .claude/api-dev-state.json               │   │
│  │  - Current phase                                 │   │
│  │  - Interview decisions                           │   │
│  │  - Research sources                              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Plugin Package (api-dev-tools repo)

```
api-dev-tools/
├── .claude/                    # Claude Code config (development)
│   ├── settings.json           # Hook registration
│   ├── settings.local.json     # Local overrides
│   ├── api-dev-state.json      # Workflow state
│   ├── agents/                 # Agent definitions
│   │   ├── parallel-researcher.md
│   │   ├── schema-generator.md
│   │   └── ...
│   ├── commands/               # Skills (project scope)
│   │   ├── api-create.md
│   │   ├── red.md
│   │   └── ...
│   └── research/               # Research cache
│       ├── index.json
│       └── [api-name]/
│           ├── CURRENT.md
│           └── 2025-12-28_initial.md
│
├── .skills/                    # Agent Skills format (portable)
│   ├── README.md
│   ├── api-create/
│   │   └── SKILL.md
│   ├── red/
│   │   └── SKILL.md
│   └── _shared/
│       ├── hooks/
│       └── settings.json
│
├── commands/                   # User-facing skill files
│   ├── hustle-api-create.md
│   ├── hustle-combine.md
│   └── ...
│
├── hooks/                      # Python enforcement hooks
│   ├── enforce-research.py
│   ├── verify-after-green.py
│   ├── session-startup.py
│   └── lib/
│       ├── __init__.py
│       ├── greptile.py
│       └── ntfy.py
│
├── scripts/                    # Node.js automation
│   ├── install-wizard.ts
│   ├── extract-schema-docs.cjs
│   └── generate-test-manifest.ts
│
├── templates/                  # Component/page templates
│   ├── api-showcase/
│   ├── ui-showcase/
│   ├── hustle-dev-dashboard/
│   └── ...
│
├── docs/                       # Documentation
│   ├── HOOKS.md
│   ├── SKILLS.md
│   ├── AGENTS.md
│   └── PLUGIN_ARCHITECTURE.md
│
├── package.json                # NPM package config
├── CLAUDE.md                   # Project instructions
├── README.md                   # Main readme
└── CHANGELOG.md                # Version history
```

### Installed in Target Project

After installation:

```
your-project/
├── .claude/
│   ├── settings.json           # Hook registration
│   ├── api-dev-state.json      # Workflow state (created on first use)
│   ├── research/               # Research cache (created on first use)
│   └── commands/               # Symlinked or copied skills
│       └── *.md
│
├── hooks/                      # Python hooks
│   ├── enforce-research.py
│   ├── verify-after-green.py
│   └── ...
│
├── src/
│   └── app/
│       ├── api-showcase/       # API testing UI
│       ├── ui-showcase/        # Component showcase
│       └── hustle-dev-dashboard/
│
├── CLAUDE.md                   # Your project instructions
└── ...
```

---

## Components

### 1. Skills (Slash Commands)

Skills are markdown files that define slash commands.

**Location:** `.claude/commands/` or `commands/`

**Format:**
```markdown
---
name: skill-name
description: What this skill does
tools: Read, Write, Edit, Bash
model: sonnet
---

# Skill Name

Instructions for Claude...
```

**Invocation:** `/skill-name [args]`

### 2. Hooks (Lifecycle Enforcement)

Hooks are Python scripts that run at lifecycle events.

**Location:** `hooks/`

**Events:**
- `SessionStart` - Session begins
- `UserPromptSubmit` - User sends message
- `PreToolUse` - Before tool executes (can block)
- `PostToolUse` - After tool executes
- `Stop` - Session ends

**Registration (settings.json):**
```json
{
  "hooks": {
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

### 3. Agents (Specialized Workers)

Agents are sub-Claude instances for specific tasks.

**Location:** `.claude/agents/`

**Format:**
```markdown
---
name: agent-name
description: What this agent does
tools: Read, WebSearch
model: haiku
---

# Agent Instructions...
```

**Invocation:** Via Task tool with `subagent_type`

### 4. State (Workflow Tracking)

State persists across sessions.

**Location:** `.claude/api-dev-state.json`

**Structure:**
```json
{
  "version": "3.12.12",
  "workflow": "api-create",
  "active_endpoint": "my-endpoint",
  "endpoints": {
    "my-endpoint": {
      "phases": {
        "disambiguation": { "status": "complete" },
        "scope": { "status": "complete" },
        "research_initial": { "status": "in_progress" }
      }
    }
  },
  "turn_count": 5
}
```

### 5. Research Cache

Research findings are cached for freshness tracking.

**Location:** `.claude/research/`

**Structure:**
```
.claude/research/
├── index.json           # Freshness tracking
└── [api-name]/
    ├── CURRENT.md       # Current research
    └── 2025-12-28_initial.md  # Dated snapshots
```

### 6. Templates

Pre-built UI components and pages.

**Location:** `templates/`

Includes:
- API Showcase (interactive API testing)
- UI Showcase (component gallery)
- Dashboard (dev tools hub)
- Page templates (test results, docs, etc.)

---

## Installation Methods

### Method 1: NPM Package (Recommended)

```bash
# Install globally
npm install -g @hustle-together/api-dev-tools

# Run install wizard in your project
cd your-project
npx @hustle-together/api-dev-tools
```

The wizard:
1. Copies hooks to `hooks/`
2. Creates `.claude/settings.json`
3. Installs skills to `.claude/commands/`
4. Creates state file template
5. Optionally installs templates

### Method 2: Git Clone

```bash
# Clone the repo
git clone https://github.com/hustle-together/api-dev-tools

# Run install script
cd api-dev-tools
./scripts/install-to-project.sh /path/to/your-project
```

### Method 3: Manual Copy

1. Copy `hooks/` to your project
2. Copy `.claude/settings.json`
3. Copy desired skills from `.claude/commands/`
4. Create `.claude/api-dev-state.json` with template

---

## State Management

### State File Location

```
.claude/api-dev-state.json
```

### State Schema

```typescript
interface APIDevState {
  version: string;                    // Plugin version
  workflow: "api-create" | "ui-create-component" | "ui-create-page" | "combine-api";
  active_endpoint?: string;           // Current endpoint being developed
  active_element?: string;            // Current UI element
  turn_count: number;                 // Turns since last re-ground

  endpoints: {
    [name: string]: {
      phases: {
        [phaseName: string]: {
          status: "not_started" | "in_progress" | "complete";
          started_at?: string;
          completed_at?: string;
          sources?: string[];         // Research sources
          decisions?: object;         // Interview decisions
        }
      }
    }
  };

  combine_config?: {                  // For combined APIs
    source_elements: string[];
    flow_type: "sequential" | "parallel";
    error_strategy: "fail-fast" | "continue";
  };

  ui_config?: {                       // For UI workflows
    mode: "component" | "page";
    use_brand_guide: boolean;
    component_type?: string;
    accessibility_level?: string;
  };
}
```

### State Lifecycle

1. **Creation** - State created when `/api-create` or similar runs
2. **Updates** - Hooks update state on phase transitions
3. **Reads** - Session startup injects state into context
4. **Persistence** - State survives across sessions
5. **Cleanup** - Cleared when workflow completes

---

## Lifecycle Flow

### Complete Flow Example

```
1. User: /api-create unsplash-search
   │
   ├─► Skill loads: commands/api-create.md
   │   └─► Creates state with endpoint "unsplash-search"
   │
2. Phase 1: Disambiguation
   ├─► Hook: enforce-disambiguation.py
   │   └─► Ensures clear requirements
   │
3. Phase 3: Initial Research
   ├─► Agent: parallel-researcher (x3)
   │   └─► Scrapes official docs, API reference, examples
   ├─► Hook: track-tool-use.py
   │   └─► Logs sources to state
   │
4. Phase 6: Schema Creation
   ├─► Hook: enforce-interview.py
   │   └─► Injects interview decisions
   ├─► Agent: schema-generator
   │   └─► Creates Zod schema
   │
5. Phase 8: TDD Red
   ├─► Hook: enforce-research.py
   │   └─► Allows test files only
   ├─► Agent: test-writer
   │   └─► Writes failing tests
   │
6. Phase 9: TDD Green
   ├─► Hook: enforce-research.py
   │   └─► Now allows route files
   ├─► Implementation written
   │
7. Tests Run (Bash)
   ├─► Hook: verify-after-green.py
   │   └─► Detects success, triggers Phase 10
   │
8. Phase 10: Verify
   ├─► Agent: implementation-reviewer
   │   └─► Compares to documentation
   │
9. Phase 13: Documentation
   ├─► Hook: generate-manifest-entry.py
   │   └─► Updates registry programmatically
   │
10. Completion
    ├─► Hook: api-workflow-check.py
    │   └─► Validates all phases complete
    └─► State marked complete
```

---

## Cross-Platform Support

### Full Support (Claude Code)

- All hooks work
- All skills work
- Agents spawn correctly
- State persists
- Lifecycle events fire

### Partial Support (Other Platforms)

| Platform | Skills | Hooks | Agents | State |
|----------|--------|-------|--------|-------|
| VS Code + Copilot | Yes | Manual | No | Manual |
| Cursor | Yes | Manual | No | Manual |
| ChatGPT | Yes | No | No | No |
| Other Agent Skills | Yes | Varies | Varies | Varies |

### Minimal Installation (Skills Only)

For platforms without hook support:

1. Copy `.skills/` to your project
2. Skills work as prompts
3. No enforcement (honor system)
4. No state tracking

---

## Configuration Files

### settings.json

```json
{
  "permissions": {
    "allow": [
      "WebSearch",
      "mcp__context7__*",
      "Bash(pnpm test:*)"
    ],
    "deny": [
      "Read(./.env*)"
    ]
  },
  "hooks": {
    "SessionStart": [...],
    "UserPromptSubmit": [...],
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Stop": [...]
  }
}
```

### CLAUDE.md

Project-specific instructions that Claude reads:

```markdown
# Project Instructions

## API Development Workflow

This project uses @hustle-together/api-dev-tools...

### Available Commands

| Command | Purpose |
|---------|---------|
| `/api-create` | Full workflow |
| `/red` | Write failing test |
...
```

---

## See Also

- [HOOKS.md](./HOOKS.md) - Enforcement hook reference
- [SKILLS.md](./SKILLS.md) - Slash command reference
- [AGENTS.md](./AGENTS.md) - Specialized agent reference
- [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md) - Detailed setup instructions
