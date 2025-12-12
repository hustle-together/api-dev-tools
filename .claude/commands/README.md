# API Development Slash Commands v3.0

**Interview-driven, research-first API development workflow with continuous verification loops**

## What's New in v3.0

- **Phase 1: Disambiguation** - Search variations before research
- **Phase 10: Verify** - Re-research after tests pass to catch memory errors
- **Adaptive Research** - Propose searches based on context, not shotgun
- **Questions FROM Research** - Interview generates questions from discovered params
- **7-Turn Re-grounding** - Periodic context injection prevents dilution
- **Research Freshness** - 7-day cache with staleness warnings

## Hook Architecture (9 Hooks)

| Hook | Event | Purpose |
|------|-------|---------|
| `session-startup.py` | SessionStart | Inject state at session start |
| `enforce-external-research.py` | UserPromptSubmit | Detect API terms, require research |
| `enforce-research.py` | PreToolUse | Block writes until research done |
| `enforce-interview.py` | PreToolUse | Inject interview decisions |
| `verify-implementation.py` | PreToolUse | Require test file before route |
| `track-tool-use.py` | PostToolUse | Log research, count turns |
| `periodic-reground.py` | PostToolUse | Re-ground every 7 turns |
| `verify-after-green.py` | PostToolUse | Trigger Phase 10 after test pass |
| `api-workflow-check.py` | Stop | Block if phases incomplete |

## Available Commands

### Complete Workflow

**`/api-create [endpoint-name]`**
- Runs all 13 phases automatically
- Loop-back architecture at every checkpoint
- See [api-create.md](api-create.md) for full flow

### Individual Phases

**`/api-interview [endpoint-name]`**
- Questions GENERATED from research findings
- Different question types: enum, continuous, boolean
- See [api-interview.md](api-interview.md)

**`/api-research [library-or-service]`**
- Adaptive propose-approve flow (not shotgun)
- Research cached with 7-day freshness
- See [api-research.md](api-research.md)

**`/api-verify [endpoint-name]`** (NEW)
- Manual Phase 10 verification
- Re-read docs, compare to implementation
- Report gaps, loop back or document omissions
- See [api-verify.md](api-verify.md)

**`/api-env [endpoint-name]`**
- Check API keys and environment
- See [api-env.md](api-env.md)

**`/api-status [endpoint-name]`**
- Track progress through 13 phases
- See [api-status.md](api-status.md)

### TDD Commands

From [@wbern/claude-instructions](https://github.com/wbern/claude-instructions):
- `/red` - Write ONE failing test
- `/green` - Minimal implementation to pass
- `/refactor` - Clean up while tests pass
- `/cycle [description]` - Full Red → Green → Refactor

## 13-Phase Flow

```
Phase 1:  DISAMBIGUATION     - Clarify ambiguous terms
Phase 2:  SCOPE              - Confirm understanding
Phase 3:  INITIAL RESEARCH   - 2-3 targeted searches
Phase 4:  INTERVIEW          - Questions FROM research
Phase 5:  DEEP RESEARCH      - Adaptive propose-approve
Phase 6:  SCHEMA             - Zod from research + interview
Phase 7:  ENVIRONMENT        - Verify API keys
Phase 8:  TDD RED            - Write failing tests
Phase 9:  TDD GREEN          - Minimal implementation
Phase 10: VERIFY             - Re-research, find gaps
Phase 11: TDD REFACTOR       - Clean up code
Phase 12: DOCUMENTATION      - Update manifests
Phase 13: COMPLETION         - Final verification
```

## State File

All progress tracked in `.claude/api-dev-state.json`:

```json
{
  "version": "3.0.0",
  "endpoint": "brandfetch",
  "turn_count": 23,
  "phases": {
    "disambiguation": { "status": "complete" },
    "scope": { "status": "complete" },
    "research_initial": { "status": "complete" },
    "interview": { "status": "complete", "decisions": {...} },
    "research_deep": {
      "proposed_searches": [...],
      "approved_searches": [...],
      "skipped_searches": [...]
    },
    "verify": {
      "gaps_found": 2,
      "gaps_fixed": 2,
      "intentional_omissions": [...]
    }
  },
  "reground_history": [...]
}
```

## Research Cache

Research cached in `.claude/research/`:

```
.claude/research/
├── brandfetch/
│   ├── 2025-12-08_initial.md
│   ├── 2025-12-08_deep.md
│   └── CURRENT.md
└── index.json  ← Freshness tracking (7-day validity)
```

## Quick Start

### Automated
```bash
/api-create my-endpoint
```

### Manual Step-by-Step
```bash
/api-research [library]      # Initial research
/api-interview [endpoint]    # Questions from research
/api-env [endpoint]          # Verify environment
/red                         # Failing tests
/green                       # Make tests pass
/api-verify [endpoint]       # Compare to docs
/refactor                    # Clean up
/commit                      # Semantic commit
```

## Installation

```bash
npx @hustle-together/api-dev-tools --scope=project
```

Installs:
- Commands in `.claude/commands/`
- Hooks in `.claude/hooks/`
- Settings in `.claude/settings.json`
- State template in `.claude/api-dev-state.json`
- Research index in `.claude/research/index.json`

### Team-Wide

Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "npx @hustle-together/api-dev-tools --scope=project"
  }
}
```

## Key Principles

1. **Loop Until Green** - Every verification loops back if not successful
2. **Continuous Interviews** - Checkpoints at EVERY phase transition
3. **Adaptive Research** - Propose based on context, not shotgun
4. **Self-Documenting** - State file captures everything
5. **Verify After Green** - Re-research to catch memory errors

---

**Version:** 3.0.0
**Last Updated:** 2025-12-08
