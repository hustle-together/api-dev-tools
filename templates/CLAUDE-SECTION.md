## Hustle API Development Workflow (v3.7.0)

This project uses **@hustle-together/api-dev-tools** for interview-driven, research-first API development.

### Available Commands

| Command | Purpose |
|---------|---------|
| `/hustle-api-create [endpoint]` | Complete 13-phase workflow |
| `/hustle-api-interview [endpoint]` | Questions FROM research findings |
| `/hustle-api-research [library]` | Adaptive propose-approve research |
| `/hustle-api-verify [endpoint]` | Re-research and verify implementation |
| `/hustle-api-env [endpoint]` | Check API keys |
| `/hustle-api-status [endpoint]` | Track progress |
| `/hustle-api-continue [endpoint]` | Resume interrupted workflow |
| `/hustle-api-sessions` | Browse saved session logs |

### 13-Phase Flow

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
Phase 11: TDD REFACTOR       - Clean up code while tests pass
Phase 12: DOCUMENTATION      - Update manifests, cache research
Phase 13: COMPLETION         - Final verification, commit
```

### Key Principles

1. **Loop Until Green** - Every verification phase loops back if not successful
2. **Questions FROM Research** - Never use generic template questions
3. **Adaptive Research** - Propose searches based on context, not shotgun
4. **7-Turn Re-grounding** - Context injected every 7 turns to prevent dilution
5. **Verify After Green** - Re-research to catch memory-based implementation errors

### State Tracking

All progress is tracked in `.claude/api-dev-state.json`:
- Current phase and status for each endpoint
- Interview decisions (injected during implementation)
- Research sources with freshness tracking
- Turn count for re-grounding
- Multi-API support with active endpoint pointer

### Research Cache

Research is cached in `.claude/research/` with 7-day freshness:
- `index.json` - Freshness tracking
- `[api-name]/CURRENT.md` - Latest research
- `[api-name]/sources.json` - Research sources
- `[api-name]/interview.json` - Interview decisions
- `[api-name]/schema.json` - Schema snapshot
- Stale research (>7 days) triggers re-research prompt

### Hooks (25 Total - Automatic Enforcement)

| Hook | Event | Action |
|------|-------|--------|
| `session-startup.py` | SessionStart | Inject state context |
| `detect-interruption.py` | SessionStart | Detect interrupted workflows |
| `enforce-external-research.py` | UserPromptSubmit | Require research first |
| `enforce-disambiguation.py` | PreToolUse | Phase 1 enforcement |
| `enforce-scope.py` | PreToolUse | Phase 2 enforcement |
| `enforce-research.py` | PreToolUse | Phase 3 enforcement |
| `enforce-interview.py` | PreToolUse | Phase 4 - inject decisions |
| `enforce-deep-research.py` | PreToolUse | Phase 5 enforcement |
| `enforce-schema.py` | PreToolUse | Phase 6 enforcement |
| `enforce-environment.py` | PreToolUse | Phase 7 enforcement |
| `enforce-tdd-red.py` | PreToolUse | Phase 8 enforcement |
| `verify-implementation.py` | PreToolUse | Phase 9 helper |
| `enforce-verify.py` | PreToolUse | Phase 10 enforcement |
| `enforce-refactor.py` | PreToolUse | Phase 11 enforcement |
| `enforce-documentation.py` | PreToolUse | Phase 12 enforcement |
| `enforce-questions-sourced.py` | PreToolUse | Validate questions from research |
| `enforce-schema-from-interview.py` | PreToolUse | Validate schema from interview |
| `track-tool-use.py` | PostToolUse | Log research, count turns |
| `periodic-reground.py` | PostToolUse | Re-inject context every 7 turns |
| `track-scope-coverage.py` | PostToolUse | Track implemented vs deferred |
| `verify-after-green.py` | PostToolUse | Trigger Phase 10 after tests pass |
| `cache-research.py` | PostToolUse | Create research cache files |
| `generate-manifest-entry.py` | PostToolUse | Auto-generate API documentation |
| `api-workflow-check.py` | Stop | Block if incomplete, generate output |
| `session-logger.py` | Stop | Save session to api-sessions |

### Auto-Generated Documentation

When Phase 12 completes, `generate-manifest-entry.py` automatically creates:
- **Comprehensive curl examples** (minimal, full, auth, enum variations, boundary values)
- **Complete test cases** (success, validation, required fields, types, boundaries, arrays)
- **Parameter documentation** with all possible values
- **Ready-to-use entries** for `api-tests-manifest.json`

### Usage

```bash
# Full automated workflow
/hustle-api-create my-endpoint

# Manual step-by-step
/hustle-api-research [library]
/hustle-api-interview [endpoint]
/hustle-api-env [endpoint]
/red
/green
/hustle-api-verify [endpoint]
/refactor
/commit
```
