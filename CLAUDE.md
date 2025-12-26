# Project Instructions

## API Development Workflow (v3.12.0)

This project uses **@hustle-together/api-dev-tools** for interview-driven, research-first API development.

**Current Status:** Autonomous Mode + Integrations | YOLO mode default
**Last Updated:** 2025-12-26

---

## Architecture: Agent Skills (Cross-Platform)

This toolkit uses the **Agent Skills open standard** ([agentskills.io](https://agentskills.io)):
- **33 Agent Skills** in `.skills/` directory
- **42 Enforcement Hooks** in `.claude/hooks/`
- **Cross-platform**: Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot

---

## Available Skills (33 Total)

### API Development (8 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **api-create** | `/api-create [endpoint]` | Complete 13-phase workflow with interview, research, TDD |
| **api-interview** | `/api-interview [endpoint]` | Questions FROM research findings |
| **api-research** | `/api-research [library]` | Adaptive propose-approve research |
| **api-verify** | `/api-verify [endpoint]` | Re-research and verify implementation |
| **api-env** | `/api-env [endpoint]` | Check API keys and environment |
| **api-status** | `/api-status [endpoint]` | Track progress through phases |
| **api-continue** | `/api-continue [endpoint]` | Resume interrupted workflow |
| **api-sessions** | `/api-sessions [options]` | Browse/export session history |

### UI Development (3 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **hustle-ui-create** | `/hustle-ui-create [component]` | 13-phase component workflow with brand guide |
| **hustle-ui-create-page** | `/hustle-ui-create-page [page]` | 13-phase page workflow with Playwright E2E |
| **hustle-combine** | `/hustle-combine` | Orchestrate 2+ existing APIs from registry |

### TDD Workflow (4 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **red** | `/red` | Write ONE failing test |
| **green** | `/green` | Minimal implementation to pass |
| **refactor** | `/refactor` | Clean up while tests pass |
| **cycle** | `/cycle [description]` | Complete Red → Green → Refactor |

### Planning & Analysis (4 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **plan** | `/plan [feature]` | PRD-style implementation planning |
| **gap** | `/gap` | Analyze code vs requirements |
| **issue** | `/issue [url]` | TDD plan from GitHub issue |
| **spike** | `/spike` | Exploratory coding before TDD |

### Git Operations (5 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **commit** | `/commit` | Semantic commit with co-author |
| **pr** | `/pr` | Create PR with summary |
| **busycommit** | `/busycommit` | Multiple atomic commits |
| **worktree-add** | `/worktree-add [branch]` | Add git worktree |
| **worktree-cleanup** | `/worktree-cleanup` | Clean merged worktrees |

### Utilities (9 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **tdd** | `/tdd` | Remind about TDD approach |
| **beepboop** | `/beepboop` | AI attribution markers |
| **summarize** | `/summarize` | Conversation summary |
| **add-command** | `/add-command` | Guide for new skills |
| **stats** | `/stats` | Track workflow statistics |
| **rename** | `/rename [old] [new]` | Rename across codebase |
| **skill-finder** | `/skill-finder [query]` | Find relevant skills |
| **test-toolkit** | `/test-toolkit` | Validate hooks/skills/templates |
| **update-todos** | `/update-todos` | Update TodoWrite list |

---

## 13-Phase Workflow (API Create)

```
Phase 1:  DISAMBIGUATION     - Clarify ambiguous terms before research
Phase 2:  SCOPE              - Confirm understanding of endpoint
Phase 3:  INITIAL RESEARCH   - 2-3 targeted searches (Context7, WebSearch)
Phase 4:  INTERVIEW          - Questions FROM discovered params
Phase 5:  DEEP RESEARCH      - Propose additional searches based on answers
Phase 6:  SCHEMA             - Create Zod schema from research + interview
Phase 7:  ENVIRONMENT        - Verify API keys exist
Phase 8:  TDD RED            - Write failing tests from schema
Phase 9:  TDD GREEN          - Minimal implementation to pass tests
Phase 10: VERIFY             - Re-research docs, compare to implementation
Phase 11: TDD REFACTOR       - Clean up code while tests pass
Phase 12: DOCUMENTATION      - Update manifests, cache research
Phase 13: COMPLETION         - Final verification, commit
```

---

## Key Principles

1. **Loop Until Green** - Every verification phase loops back if not successful
2. **Questions FROM Research** - Never use generic template questions
3. **Adaptive Research** - Propose searches based on context, not shotgun
4. **7-Turn Re-grounding** - Context injected every 7 turns to prevent dilution
5. **Verify After Green** - Re-research to catch memory-based implementation errors

---

## Enforcement Hooks (42 Total)

### API Workflow Hooks (22)

| Hook | Event | Purpose |
|------|-------|---------|
| `session-startup.py` | SessionStart | Inject state context |
| `enforce-external-research.py` | UserPromptSubmit | Require research first |
| `enforce-disambiguation.py` | PreToolUse | Enforce Phase 1 |
| `enforce-scope.py` | PreToolUse | Enforce Phase 2 |
| `enforce-research.py` | PreToolUse | Block writes without research |
| `enforce-interview.py` | PreToolUse | Inject interview decisions |
| `enforce-deep-research.py` | PreToolUse | Enforce Phase 5 |
| `enforce-schema.py` | PreToolUse | Enforce Phase 6 |
| `enforce-environment.py` | PreToolUse | Enforce Phase 7 |
| `enforce-tdd-red.py` | PreToolUse | Enforce Phase 8 |
| `verify-implementation.py` | PreToolUse | Require test before route |
| `enforce-verify.py` | PreToolUse | Enforce Phase 10 |
| `enforce-refactor.py` | PreToolUse | Enforce Phase 11 |
| `enforce-documentation.py` | PreToolUse | Enforce Phase 12 |
| `track-tool-use.py` | PostToolUse | Log research, count turns |
| `periodic-reground.py` | PostToolUse | Re-ground every 7 turns |
| `verify-after-green.py` | PostToolUse | Trigger Phase 10 after test pass |
| `track-session-metrics.py` | PostToolUse | Track cost/time metrics |
| `enforce-budget-limit.py` | PreToolUse | Check token budget limits |
| `track-usage-budget.py` | PostToolUse | Track token usage per session |
| `generate-phase-summary.py` | PostToolUse | Generate phase digests |
| `api-workflow-check.py` | Stop | Block if phases incomplete |

### UI Workflow Hooks (12)

| Hook | Event | Purpose |
|------|-------|---------|
| `enforce-ui-disambiguation.py` | PreToolUse | UI component disambiguation |
| `enforce-ui-interview.py` | PreToolUse | UI interview enforcement |
| `enforce-brand-guide.py` | PreToolUse | Brand guide compliance |
| `enforce-a11y-audit.py` | PreToolUse | Accessibility checks |
| `enforce-page-components.py` | PreToolUse | Page component validation |
| `enforce-page-data-schema.py` | PreToolUse | Page data schema |
| `enforce-freshness.py` | PreToolUse | Research freshness check |
| `enforce-questions-sourced.py` | PreToolUse | Sourced interview questions |
| `enforce-schema-from-interview.py` | PreToolUse | Schema from interview |
| `check-api-routes.py` | PreToolUse | API route validation |
| `check-storybook-setup.py` | PreToolUse | Storybook configuration |
| `check-playwright-setup.py` | PreToolUse | Playwright E2E setup |

### Utility Hooks (8)

| Hook | Event | Purpose |
|------|-------|---------|
| `cache-research.py` | PostToolUse | Cache research results |
| `session-logger.py` | PostToolUse | Log session activity |
| `track-scope-coverage.py` | PostToolUse | Track scope coverage |
| `update-registry.py` | PostToolUse | Update API registry |
| `update-api-showcase.py` | PostToolUse | Update API showcase |
| `update-ui-showcase.py` | PostToolUse | Update UI showcase |
| `generate-manifest-entry.py` | PostToolUse | Generate manifest entries |
| `detect-interruption.py` | Stop | Detect workflow interruption |

---

## State Tracking

All progress tracked in `.claude/api-dev-state.json`:
- Current phase and status
- Interview decisions (injected during implementation)
- Research sources with freshness tracking
- Turn count for re-grounding

## Research Cache

Research cached in `.claude/research/` with 7-day freshness:
- `index.json` - Freshness tracking
- `[api-name]/CURRENT.md` - Latest research
- Stale research (>7 days) triggers re-research prompt

---

## Autonomous Mode (v3.12.0)

Run workflows unattended with YOLO mode (default):

```bash
claude --dangerously-skip-permissions -p "/api-create stripe-checkout"
```

**Features:**
- Budget tracking with pause at 80% usage
- ntfy notifications for progress/errors
- Phase summaries for review
- Hooks still enforce 13-phase workflow

See [docs/AUTONOMOUS_MODE.md](docs/AUTONOMOUS_MODE.md) for full guide.

---

## Integrations

| Integration | Purpose | Guide |
|-------------|---------|-------|
| **Greptile** | AI code review via MCP | [GREPTILE_INTEGRATION.md](docs/GREPTILE_INTEGRATION.md) |
| **Context7** | Documentation lookup | Required MCP server |

---

## Quick Start

```bash
# Full automated workflow
/api-create my-endpoint

# UI component workflow
/hustle-ui-create my-component

# UI page workflow
/hustle-ui-create-page my-page

# Combine existing APIs
/hustle-combine

# Manual step-by-step
/api-research [library]
/api-interview [endpoint]
/api-env [endpoint]
/red
/green
/api-verify [endpoint]
/refactor
/commit
```

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [docs/TLDR.md](docs/TLDR.md) | Quick command reference |
| [docs/AUTONOMOUS_MODE.md](docs/AUTONOMOUS_MODE.md) | YOLO mode, budget, notifications |
| [docs/GREPTILE_INTEGRATION.md](docs/GREPTILE_INTEGRATION.md) | AI code review setup |
| [docs/GRAPHITE_WORKFLOW.md](docs/GRAPHITE_WORKFLOW.md) | Stacked PRs guide |
| [docs/CLAUDE_CODE_FEATURES.md](docs/CLAUDE_CODE_FEATURES.md) | Claude Code features reference |
| [.skills/README.md](.skills/README.md) | Skills documentation (33 skills) |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |

---

## Requirements

- **Claude Code**: 1.0.0+ (or compatible platform)
- **Python**: 3.9+ (for hooks)
- **Node.js**: 18+
- **pnpm**: 10.11.0+
- **MCP Servers**: Context7 (required), GitHub (recommended)

---

**Version:** 3.12.0
**License:** MIT
**Author:** Hustle Together
