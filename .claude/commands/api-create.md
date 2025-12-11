# API Create - Comprehensive API Development Workflow v3.0

**Usage:** `/api-create [endpoint-name]`

**Purpose:** Orchestrates the complete API development workflow using interview-driven, research-first, test-first methodology with continuous verification loops.

## Key Principles

1. **Loop Until Green** - Every verification phase loops back if not successful
2. **Continuous Interviews** - Checkpoints at EVERY phase transition
3. **Adaptive Research** - Propose searches based on context, not shotgun approach
4. **Self-Documenting** - State file captures everything for re-grounding
5. **Verify After Green** - Re-research docs to catch memory-based implementation errors

## Complete Phase Flow

```
/api-create [endpoint]
        │
        ▼
┌─ PHASE 0: DISAMBIGUATION ─────────────────────────────────┐
│ Search 3-5 variations of the term:                        │
│   • "[term]"                                              │
│   • "[term] API"                                          │
│   • "[term] SDK"                                          │
│   • "[term] npm package"                                  │
│                                                           │
│ If multiple interpretations found, ask:                   │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ I found multiple things matching "[term]":            │ │
│ │                                                       │ │
│ │ [A] Option A - Description                            │ │
│ │ [B] Option B - Description                            │ │
│ │ [C] Both                                              │ │
│ │ [D] Something else: ____                              │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ──── Loop back if ambiguous ────                          │
└───────────────────────────────────────────────────────────┘
        │ Clear
        ▼
┌─ PHASE 1: SCOPE CONFIRMATION ─────────────────────────────┐
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ SCOPE CONFIRMATION                                    │ │
│ │                                                       │ │
│ │ I understand you want: /api/v2/[endpoint]             │ │
│ │ Purpose: [inferred purpose]                           │ │
│ │ External API: [service name] (URL)                    │ │
│ │                                                       │ │
│ │ Is this correct? [Y/n]                                │ │
│ │ Additional context? ____                              │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 2: INITIAL RESEARCH ───────────────────────────────┐
│                                                           │
│ Execute 2-3 initial searches:                             │
│   • Context7: "[library/api name]"                        │
│   • WebSearch: "[name] official documentation"            │
│   • WebSearch: "site:[domain] api reference"              │
│                                                           │
│ Present summary:                                          │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ RESEARCH SUMMARY                                      │ │
│ │                                                       │ │
│ │ │ Source         │ Found                              │ │
│ │ ├────────────────┼────────────────────────────────────│ │
│ │ │ Official docs  │ ✓ [URL]                            │ │
│ │ │ API Reference  │ ✓ REST v2                          │ │
│ │ │ Auth method    │ ✓ Bearer token                     │ │
│ │ │ NPM package    │ ? Not found                        │ │
│ │                                                       │ │
│ │ Proceed? [Y] / Search more? [n] ____                  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ──── Loop back if user wants more research ────           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 3: INTERVIEW (Generated FROM Research) ────────────┐
│                                                           │
│ Generate questions based on discovered parameters:        │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Based on research, [API] has N parameters:            │ │
│ │                                                       │ │
│ │ 1. DOMAIN (required) - string                         │ │
│ │    → No question needed (always required)             │ │
│ │                                                       │ │
│ │ 2. FORMAT: ["json", "svg", "png", "raw"]              │ │
│ │    Q: Which formats do you need?                      │ │
│ │    [x] json  [x] svg  [x] png  [ ] raw                │ │
│ │                                                       │ │
│ │ 3. QUALITY: 1-100 (continuous range)                  │ │
│ │    Q: How should we TEST this?                        │ │
│ │    [ ] All values (100 tests)                         │ │
│ │    [x] Boundary (1, 50, 100)                          │ │
│ │    [ ] Sample (1, 25, 50, 75, 100)                    │ │
│ │    [ ] Custom: ____                                   │ │
│ │                                                       │ │
│ │ ... (continues for ALL discovered parameters)         │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ Decisions are saved to state file for consistency.        │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 4: DEEP RESEARCH (Adaptive) ───────────────────────┐
│                                                           │
│ Based on interview answers, PROPOSE additional research:  │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ PROPOSED DEEP RESEARCH                                │ │
│ │                                                       │ │
│ │ Based on your selections, I want to research:         │ │
│ │                                                       │ │
│ │ [x] Error response format (for error handling)        │ │
│ │ [x] Rate limiting behavior (short cache selected)     │ │
│ │ [ ] Webhook support (not selected)                    │ │
│ │ [x] SVG optimization (SVG format selected)            │ │
│ │                                                       │ │
│ │ Approve these searches? [Y]                           │ │
│ │ Add more: ____                                        │ │
│ │ Skip and proceed: [n]                                 │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ KEY: Research is PROPOSED, not automatic shotgun.         │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 5: SCHEMA DESIGN ──────────────────────────────────┐
│                                                           │
│ Create Zod schema from research + interview:              │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ SCHEMA REVIEW                                         │ │
│ │                                                       │ │
│ │ const RequestSchema = z.object({                      │ │
│ │   domain: z.string().min(1),                          │ │
│ │   format: z.enum(["json", "svg", "png"]),             │ │
│ │   quality: z.number().min(1).max(100).default(80)     │ │
│ │ });                                                   │ │
│ │                                                       │ │
│ │ Schema matches interview answers? [Y/n]               │ │
│ │ Missing fields? ____                                  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ──── Loop back if schema wrong ────                       │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 6: ENVIRONMENT CHECK ──────────────────────────────┐
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ENVIRONMENT CHECK                                     │ │
│ │                                                       │ │
│ │ │ Variable         │ Status   │ Source               │ │
│ │ ├──────────────────┼──────────┼──────────────────────│ │
│ │ │ API_KEY          │ ✓ Found  │ .env.local           │ │
│ │                                                       │ │
│ │ Ready for testing? [Y/n]                              │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ──── Loop back if keys missing ────                       │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 7: TDD RED (Write Failing Tests) ──────────────────┐
│                                                           │
│ Generate test matrix from schema + interview decisions:   │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ TEST MATRIX REVIEW                                    │ │
│ │                                                       │ │
│ │ │ Parameter  │ Valid Values       │ Invalid Values    │ │
│ │ ├────────────┼────────────────────┼───────────────────│ │
│ │ │ domain     │ "x.com", "a.co"    │ "", null          │ │
│ │ │ format     │ "json", "svg"      │ "gif", "webp"     │ │
│ │ │ quality    │ 1, 50, 100         │ 0, 101, -1        │ │
│ │                                                       │ │
│ │ Total tests: 23 (pairwise reduction from 156)         │ │
│ │                                                       │ │
│ │ Approve test matrix? [Y/n]                            │ │
│ │ Add test cases? ____                                  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ HOOK: PreToolUse blocks Write if no research/interview    │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 8: TDD GREEN (Minimal Implementation) ─────────────┐
│                                                           │
│ Write minimal code to pass ALL tests.                     │
│ Tests derived from schema.                                │
│ Implementation validates with schema.                     │
│                                                           │
│ Run tests → All must pass before proceeding.              │
│                                                           │
│ HOOK: PreToolUse blocks Write if test file doesn't exist  │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 9: VERIFY (Re-Research After Green) ───────────────┐
│                                                           │
│ MANDATORY: Re-read original documentation.                │
│ Compare implementation to docs feature-by-feature:        │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ IMPLEMENTATION VERIFICATION                           │ │
│ │                                                       │ │
│ │ │ Feature       │ In Docs │ Implemented │ Status      │ │
│ │ ├───────────────┼─────────┼─────────────┼─────────────│ │
│ │ │ domain param  │ ✓       │ ✓           │ ✅ Match    │ │
│ │ │ format opts   │ 4       │ 3           │ ⚠️ Missing  │ │
│ │ │ size max      │ 4096    │ 2048        │ ⚠️ Wrong    │ │
│ │ │ webhook       │ ✓       │ ✗           │ ℹ️ Optional │ │
│ │                                                       │ │
│ │ DISCREPANCIES: 2 found                                │ │
│ │                                                       │ │
│ │ Fix these gaps? [Y] → Returns to Phase 7 (Red)        │ │
│ │ Skip (intentional)? [n] → Document as omissions       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ HOOK: PostToolUse triggers after test pass                │
│                                                           │
│ ──── Loop back to Phase 7 if gaps need fixing ────        │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 10: TDD REFACTOR ──────────────────────────────────┐
│                                                           │
│ Clean up code while tests stay green:                     │
│   • Extract reusable patterns                             │
│   • Improve error messages                                │
│   • Add JSDoc comments                                    │
│   • Optimize performance                                  │
│                                                           │
│ Run tests after EVERY change → Must still pass.           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 11: DOCUMENTATION ─────────────────────────────────┐
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ DOCUMENTATION REVIEW                                  │ │
│ │                                                       │ │
│ │ Files to update:                                      │ │
│ │                                                       │ │
│ │ [x] api-tests-manifest.json - Manifest entry          │ │
│ │ [x] OpenAPI spec - Endpoint documented                │ │
│ │ [x] .claude/research/[api]/CURRENT.md - Cached        │ │
│ │                                                       │ │
│ │ Documentation complete? [Y/n]                         │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ HOOK: Stop hook blocks if docs incomplete                 │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 12: COMPLETION ────────────────────────────────────┐
│                                                           │
│ Final verification:                                       │
│   • All tests passing                                     │
│   • 100% coverage                                         │
│   • TypeScript compiles                                   │
│   • Docs updated                                          │
│   • State file shows all phases complete                  │
│                                                           │
│ Run /commit to create semantic commit.                    │
└───────────────────────────────────────────────────────────┘
```

## State File Tracking

All phases are tracked in `.claude/api-dev-state.json`:

```json
{
  "endpoint": "brandfetch",
  "turn_count": 23,
  "phases": {
    "disambiguation": { "status": "complete" },
    "scope": { "status": "complete" },
    "research_initial": { "status": "complete", "sources": [...] },
    "interview": { "status": "complete", "decisions": {...} },
    "research_deep": { "status": "complete" },
    "schema_creation": { "status": "complete" },
    "environment_check": { "status": "complete" },
    "tdd_red": { "status": "complete", "test_count": 23 },
    "tdd_green": { "status": "complete" },
    "verify": { "status": "complete", "gaps_found": 2, "gaps_fixed": 2 },
    "tdd_refactor": { "status": "complete" },
    "documentation": { "status": "complete" }
  }
}
```

## Output Artifacts

This command creates:

1. **State File**: `.claude/api-dev-state.json` (tracks all progress)
2. **Research Cache**: `.claude/research/[api-name]/CURRENT.md`
3. **Route Handler**: `/src/app/api/v2/[endpoint-name]/route.ts`
4. **Test Suite**: `/src/app/api/v2/[endpoint-name]/__tests__/[endpoint-name].api.test.ts`
5. **OpenAPI Spec**: `/src/lib/openapi/endpoints/[endpoint-name].ts`
6. **Updated Manifests**:
   - `/src/app/api-test/api-tests-manifest.json`
   - `/src/v2/docs/v2-api-implementation-status.md`

## Hooks That Enforce This Workflow

| Phase | Hook | Purpose |
|-------|------|---------|
| 0 | `enforce-external-research.py` | Detects API terms, requires disambiguation |
| 2-4 | `track-tool-use.py` | Logs all research, tracks turns |
| 7-8 | `enforce-research.py` | Blocks Write if no research done |
| 7-8 | `enforce-interview.py` | Injects interview decisions |
| 8 | `verify-implementation.py` | Blocks route if no test file |
| 9 | `verify-after-green.py` | Triggers verification after tests pass |
| All | `periodic-reground.py` | Re-grounds every 7 turns |
| 11 | `api-workflow-check.py` | Blocks completion if docs incomplete |

<claude-commands-template>
## Project-Specific Rules

1. **API Location**: All V2 APIs go in `/src/app/api/v2/[endpoint-name]/`
2. **Testing**: Use Vitest, require 100% coverage
3. **Validation**: All requests/responses use Zod schemas
4. **AI SDK**: Use Vercel AI SDK 5.0.11 patterns from `/src/v2/docs/ai-sdk-catalog.json`
5. **Package Manager**: Use `pnpm` for all operations
6. **Documentation**: Follow patterns in `/src/v2/docs/Main Doc – V2 Development Patterns.md`
7. **API Keys**: Support three methods (env, NEXT_PUBLIC_, custom headers)
8. **Test Command**: `pnpm test:run` before commits

## Never Skip

- Phase 0 (Disambiguation) - Clarify before research
- Phase 2 (Initial Research) - Find ALL parameters
- Phase 3 (Interview) - Questions FROM research, not templates
- Phase 7 (TDD Red) - Failing tests FIRST
- Phase 9 (Verify) - Re-research after Green
- Phase 11 (Documentation) - Keep docs in sync
- Coverage verification - 100% required
</claude-commands-template>
