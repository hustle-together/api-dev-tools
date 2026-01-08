# Claude Code Devkit

## Overview

This project provides a **hook-enforced, interview-driven development workflow** for building APIs, UI components, and pages with Claude Code.

> **Full Reference:** Read `.claude/REFERENCE.md` for complete list of all 38 commands, 22 hooks, and 12 agents.

## Architecture

```
.claude/
  hooks/           # 22 enforcement hooks (Python scripts)
  commands/        # 38 slash commands (/api-create, /red, /commit, etc.)
  agents/          # 12 specialized agents (researcher, builder, reviewer, etc.)
  settings.json    # Hook configuration

.devkit/
  state.json       # Current workflow state (ephemeral)
  registry.json    # Artifact registry (persistent)
  research/        # Research cache with freshness tracking

templates/         # Project templates (API showcase, UI showcase, etc.)
```

## 14-Phase Workflow

| Phase | Name           | Description                              |
| ----- | -------------- | ---------------------------------------- |
| 1     | Disambiguation | Clarify ambiguous terms before research  |
| 2     | Scope          | Confirm endpoint/component understanding |
| 3     | Research       | Context7 + WebSearch (2-3 targeted)      |
| 4     | Interview      | Questions FROM research findings         |
| 5     | Deep Research  | Follow-up searches based on answers      |
| 6     | Schema         | Zod schema from research + interview     |
| 7     | Environment    | Verify API keys exist                    |
| 8     | TDD Red        | Write failing tests from schema          |
| 9     | TDD Green      | Minimal implementation to pass           |
| 10    | Verify         | Re-research docs, compare implementation |
| 11    | Code Review    | AI review (bugs, security, performance)  |
| 12    | Refactor       | Fix review issues + clean up             |
| 13    | Documentation  | Update manifests, cache research         |
| 14    | Completion     | Final verification, commit               |

## Available Commands

| Command                     | Purpose                        |
| --------------------------- | ------------------------------ |
| `/api-create [endpoint]`    | Complete 14-phase API workflow |
| `/api-research [library]`   | Research-first documentation   |
| `/api-interview [endpoint]` | Interview from research        |
| `/api-verify [endpoint]`    | Verify implementation          |
| `/api-env [endpoint]`       | Check API keys                 |
| `/api-status [endpoint]`    | Track workflow progress        |
| `/test-hooks`               | Run hook test suite            |

## Hook Enforcement

Hooks automatically enforce workflow compliance:

- **research-gate** - Blocks code changes without completed research
- **interview-gate** - Blocks without interview decisions
- **schema-gate** - Blocks without approved schema
- **tdd-gate** - Blocks production code before failing tests
- **verify-gate** - Triggers verification after tests pass
- **docs-gate** - Blocks completion without documentation

## State Management

```bash
# Check current workflow state
cat .devkit/state.json

# Check artifact registry
cat .devkit/registry.json

# Check research freshness (7-day cache)
cat .devkit/research/index.json
```

## Quick Start

```bash
# Start a new API implementation
/api-create my-endpoint

# Or step-by-step
/api-research my-library
/api-interview my-endpoint
/red
/green
/api-verify my-endpoint
/refactor
/commit
```

## Testing

```bash
# Run hook tests
cd .claude/hooks && python3 -m pytest tests/ -v

# Or use the slash command
/test-hooks
```

## Key Principles

1. **Research Before Code** - External docs before implementation
2. **Interview From Research** - Questions based on discovered params
3. **Loop Until Green** - Every phase verifies before advancing
4. **Verify After Green** - Re-research to catch memory errors
5. **7-Turn Reground** - Context re-injection prevents dilution
