# Project Instructions

## API Development Workflow (v3.0)

This project uses **@hustle-together/api-dev-tools** for interview-driven, research-first API development.

### Available Commands

| Command | Purpose |
|---------|---------|
| `/api-create [endpoint]` | Complete 12-phase workflow |
| `/api-interview [endpoint]` | Questions FROM research findings |
| `/api-research [library]` | Adaptive propose-approve research |
| `/api-verify [endpoint]` | Re-research and verify implementation |
| `/api-env [endpoint]` | Check API keys |
| `/api-status [endpoint]` | Track progress |

### 12-Phase Flow

```
Phase 0:  DISAMBIGUATION     - Clarify ambiguous terms before research
Phase 1:  SCOPE              - Confirm understanding of endpoint
Phase 2:  INITIAL RESEARCH   - 2-3 targeted searches (Context7, WebSearch)
Phase 3:  INTERVIEW          - Questions generated FROM discovered params
Phase 4:  DEEP RESEARCH      - Propose additional searches based on answers
Phase 5:  SCHEMA             - Create Zod schema from research + interview
Phase 6:  ENVIRONMENT        - Verify API keys exist
Phase 7:  TDD RED            - Write failing tests from schema
Phase 8:  TDD GREEN          - Minimal implementation to pass tests
Phase 9:  VERIFY             - Re-research docs, compare to implementation
Phase 10: TDD REFACTOR       - Clean up code while tests pass
Phase 11: DOCUMENTATION      - Update manifests, cache research
Phase 12: COMPLETION         - Final verification, commit
```

### Key Principles

1. **Loop Until Green** - Every verification phase loops back if not successful
2. **Questions FROM Research** - Never use generic template questions
3. **Adaptive Research** - Propose searches based on context, not shotgun
4. **7-Turn Re-grounding** - Context injected every 7 turns to prevent dilution
5. **Verify After Green** - Re-research to catch memory-based implementation errors

### State Tracking

All progress is tracked in `.claude/api-dev-state.json`:
- Current phase and status for each
- Interview decisions (injected during implementation)
- Research sources with freshness tracking
- Turn count for re-grounding

### Research Cache

Research is cached in `.claude/research/` with 7-day freshness:
- `index.json` - Freshness tracking
- `[api-name]/CURRENT.md` - Latest research
- Stale research (>7 days) triggers re-research prompt

### Hooks (Automatic Enforcement)

| Hook | When | Action |
|------|------|--------|
| `session-startup.py` | Session start | Inject state context |
| `enforce-external-research.py` | API questions | Require research first |
| `enforce-research.py` | Write/Edit | Block without research |
| `enforce-interview.py` | Write/Edit | Inject interview decisions |
| `verify-after-green.py` | Tests pass | Trigger Phase 9 |
| `periodic-reground.py` | Every 7 turns | Re-inject context |
| `api-workflow-check.py` | Stop | Block if incomplete |

### Usage

```bash
# Full automated workflow
/api-create my-endpoint

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
