## Hustle API Development Workflow (v4.0.0)

This project uses **@hustle-together/api-dev-tools** for interview-driven, research-first development.

### Project Context

<!-- INSTALLER: Replace these with actual project values -->
**Tech Stack:** [Framework] + [Language] + [Database]
**UI Library:** [UI framework or component library]
**Testing:** [Test framework] + [E2E framework]

### Existing Elements

<!-- AUTO-POPULATED: Updated by registry hooks -->
**APIs:** (check `.claude/registry.json`)
**Components:** (check `.claude/registry.json`)
**Pages:** (check `.claude/registry.json`)

### Available Commands

| Command                            | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `/hustle-build [description]`      | Orchestrated multi-workflow build     |
| `/api-create [endpoint]`           | Complete 14-phase API workflow        |
| `/hustle-ui-create [component]`    | Component with Storybook              |
| `/hustle-ui-create-page [page]`    | Page with Playwright E2E             |
| `/hustle-combine [name]`           | Combine multiple APIs                 |
| `/api-research [library]`          | Adaptive propose-approve research     |
| `/api-interview [endpoint]`        | Questions FROM research findings      |
| `/api-verify [endpoint]`           | Re-research and verify implementation |
| `/api-env [endpoint]`              | Check API keys                        |
| `/api-status [endpoint]`           | Track progress                        |

### 14-Phase Flow

```
Phase 1:  DISAMBIGUATION     - Clarify ambiguous terms before research
Phase 2:  SCOPE              - Confirm understanding of endpoint
Phase 3:  INITIAL RESEARCH   - 2-3 targeted searches (Context7, WebSearch)
Phase 4:  INTERVIEW          - Questions generated FROM discovered params
Phase 5:  DEEP RESEARCH      - Propose additional searches based on answers
Phase 6:  SCHEMA             - Create Zod schema from research + interview
Phase 7:  ENVIRONMENT        - Verify API keys exist
Phase 8:  TDD RED            - Write failing tests from schema
Phase 9:  TDD GREEN          - Minimal implementation to pass tests
Phase 10: VERIFY             - Re-research docs, compare to implementation
Phase 11: CODE REVIEW        - AI review (bugs, security, performance)
Phase 12: TDD REFACTOR       - Fix review issues + clean up code
Phase 13: DOCUMENTATION      - Update manifests, cache research
Phase 14: COMPLETION         - Final verification, commit
```

### Key Principles

1. **Research-First** - Never write code from memory, always verify docs
2. **Questions FROM Research** - Never use generic template questions
3. **Loop Until Green** - Every verification phase loops back if not successful
4. **7-Turn Re-grounding** - Context injected every 7 turns to prevent dilution
5. **Verify After Green** - Re-research to catch memory-based implementation errors
6. **Registry Awareness** - Don't recreate existing elements

### State Tracking

All progress is tracked in `.claude/api-dev-state.json`:

- Current phase and status for each endpoint
- Interview decisions (injected during implementation)
- Research sources with freshness tracking
- Turn count for re-grounding
- Deferred features list
- Test run history

### Registry

`.claude/registry.json` tracks all created elements:

- APIs with endpoints, schemas, and examples
- Components with props and variants
- Pages with routes and data requirements
- Combined APIs with orchestration patterns

### Research Cache

Research is cached in `.claude/research/` with 7-day freshness:

- `index.json` - Freshness tracking
- `[api-name]/CURRENT.md` - Latest research
- `[api-name]/sources.json` - Research sources
- `[api-name]/interview.json` - Interview decisions
- Stale research (>7 days) triggers re-research prompt

### Re-grounding System

Every 7 turns, the system injects a reminder with:

- Current endpoint and phase progress
- Key interview decisions
- Existing registry elements (don't recreate)
- Deferred features (don't re-suggest)
- Last test status (GREEN/RED)
- Brand guide status
- Research freshness warnings
- Orchestrator progress (if in /hustle-build)

See: [docs/REGROUNDING.md](./docs/REGROUNDING.md)

### Brand Guide

If `.claude/BRAND_GUIDE.md` exists:

- All UI components use brand colors/fonts
- Enforce hook checks before component creation
- Re-grounding reminds about brand guide

### Hooks (45+ Automatic Enforcement)

| Category | Hooks | Purpose |
| -------- | ----- | ------- |
| SessionStart | 4 | Inject state, detect interruptions, check updates |
| UserPromptSubmit | 1 | Require research before API questions |
| PreToolUse | 22 | Phase enforcement, schema validation |
| PostToolUse | 12 | Tracking, re-grounding, registry updates |
| Stop | 2 | Workflow completion, session logging |

### Usage

```bash
# Orchestrated build (recommended for features)
/hustle-build dashboard with user stats and activity charts

# Individual workflows
/api-create stripe-checkout
/hustle-ui-create StatCard
/hustle-ui-create-page Dashboard

# TDD cycle
/red
/green
/refactor

# Git
/commit
/pr
```
