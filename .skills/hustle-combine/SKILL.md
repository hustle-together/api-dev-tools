---
name: hustle-combine
description: Combine existing APIs from registry into orchestration endpoints. Creates new endpoints by composing 2+ existing, tested APIs with flow control (sequential, parallel, conditional). Includes registry verification, data mapping, error strategies, and real-time TodoWrite progress tracking. Keywords: combine, orchestration, compose, api, registry, flow, parallel, sequential
license: MIT
compatibility: Requires Claude Code, existing APIs in .claude/registry.json, Vitest for testing
metadata:
  version: "3.11.0"
  category: "development"
  tags: ["combine", "orchestration", "compose", "api", "registry", "flow", "parallel", "todowrite"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 AskUserQuestion Read Write Edit Bash TodoWrite
---

# Hustle Combine - API Orchestration Workflow v3.11.0

**Usage:** `/hustle-combine`

**Purpose:** Combine 2+ existing APIs from the registry into new orchestration endpoints. Creates NEW endpoints using EXISTING, tested components.

**Key Principle:** We're not creating new APIs from scratch - we're combining existing, working APIs into orchestration endpoints.

## CRITICAL: MANDATORY USER INTERACTION

**YOU MUST USE THE `AskUserQuestion` TOOL AT EVERY CHECKPOINT.**

You are **FORBIDDEN** from:
- Self-answering questions
- Assuming user responses
- Proceeding without explicit user confirmation

---

## TodoWrite Integration (Real-Time Progress)

**At the START of this workflow**, initialize TodoWrite with all 12 phases:

```
TodoWrite([
  {content: "Phase 1: API Selection", status: "in_progress", activeForm: "Selecting APIs from registry"},
  {content: "Phase 2: Registry Verification", status: "pending", activeForm: "Verifying selected APIs"},
  {content: "Phase 3: Flow Type", status: "pending", activeForm: "Choosing orchestration pattern"},
  {content: "Phase 4: Data Mapping", status: "pending", activeForm: "Defining transformations"},
  {content: "Phase 5: Error Strategy", status: "pending", activeForm: "Setting error handling"},
  {content: "Phase 6: Combined Schema", status: "pending", activeForm: "Creating orchestration schema"},
  {content: "Phase 7: TDD Red", status: "pending", activeForm: "Writing integration tests"},
  {content: "Phase 8: TDD Green", status: "pending", activeForm: "Implementing orchestration"},
  {content: "Phase 9: Curl Examples", status: "pending", activeForm: "Generating test commands"},
  {content: "Phase 10: Performance Test", status: "pending", activeForm: "Verifying latency"},
  {content: "Phase 11: Documentation", status: "pending", activeForm: "Updating manifests"},
  {content: "Phase 12: Completion", status: "pending", activeForm: "Adding to registry"}
])
```

**After completing each phase**, update TodoWrite:
- Mark completed phase as `"completed"`
- Mark next phase as `"in_progress"`

**On loop-back** (e.g., Phase 10 fails → back to Phase 8):
- Mark Phase 8+ as `"in_progress"` or `"pending"`

---

## Flow Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Sequential** | API1 → API2 → API3 | Dependent data (fetch user → fetch orders) |
| **Parallel** | API1 + API2 + API3 | Independent data (dashboard metrics) |
| **Conditional** | If(API1) → API2 else API3 | Branching logic (payment fallback) |

---

## Complete Phase Flow (12 Phases)

```
/hustle-combine
        │
        ▼
┌─ PHASE 1: API SELECTION ──────────────────────────────────┐
│                                                           │
│ Read .claude/registry.json                                │
│ Present completed APIs as checkboxes                      │
│                                                           │
│ Use AskUserQuestion with multiSelect: true                │
│ "Select APIs to combine (choose 2 or more):"             │
│                                                           │
│ Options generated from registry:                          │
│   [ ] brandfetch - Get brand logos and colors             │
│   [ ] stripe-payment - Process payments                   │
│   [ ] sendgrid-email - Send transactional emails          │
│                                                           │
│ WAIT for user response. Must select 2+.                   │
│ Update TodoWrite: Phase 1 completed, Phase 2 in_progress  │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 2: REGISTRY VERIFICATION ──────────────────────────┐
│                                                           │
│ For each selected API, verify:                            │
│   - Status is "complete" in registry                      │
│   - Route file exists                                     │
│   - Test file exists and passes                           │
│   - Schema file exists                                    │
│                                                           │
│ If any API fails verification:                            │
│   AskUserQuestion: "API [name] incomplete. How proceed?"  │
│   Options: Fix first, Skip this API, Continue anyway      │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 3: FLOW TYPE ──────────────────────────────────────┐
│                                                           │
│ Use AskUserQuestion:                                      │
│ "How should these APIs be orchestrated?"                  │
│                                                           │
│ Options:                                                  │
│   - Sequential (A → B → C)                                │
│   - Parallel (A + B + C simultaneously)                   │
│   - Conditional (If A succeeds → B, else → C)             │
│                                                           │
│ If Sequential or Conditional:                             │
│   AskUserQuestion: "What order should they run?"          │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 4: DATA MAPPING ───────────────────────────────────┐
│                                                           │
│ For each API pair, define transformations:                │
│                                                           │
│ AskUserQuestion:                                          │
│ "How should data flow from [API1] to [API2]?"             │
│                                                           │
│ Options:                                                  │
│   - Direct (pass response as-is)                          │
│   - Transform (map fields)                                │
│   - Merge (combine with other data)                       │
│   - Custom (I'll specify)                                 │
│                                                           │
│ Store mapping in state file                               │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 5: ERROR STRATEGY ─────────────────────────────────┐
│                                                           │
│ Use AskUserQuestion:                                      │
│ "How should errors be handled?"                           │
│                                                           │
│ Options:                                                  │
│   - Fail-fast (stop on first error)                       │
│   - Fallback (use default/cached value)                   │
│   - Retry (with exponential backoff)                      │
│   - Partial (return what succeeded)                       │
│                                                           │
│ If Fallback selected:                                     │
│   AskUserQuestion: "What fallback value for each API?"    │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 6: COMBINED SCHEMA ────────────────────────────────┐
│                                                           │
│ Create Zod schema composing existing schemas:             │
│                                                           │
│ Import schemas from source APIs:                          │
│   import { API1Schema } from '@/lib/api/api1/schema'      │
│   import { API2Schema } from '@/lib/api/api2/schema'      │
│                                                           │
│ Create combined schema:                                   │
│   const CombinedRequestSchema = z.object({...})           │
│   const CombinedResponseSchema = z.object({...})          │
│                                                           │
│ AskUserQuestion: "Combined schema looks correct?"         │
│ Loop back if schema needs changes                         │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 7: TDD RED (Integration Tests) ────────────────────┐
│                                                           │
│ Create test file:                                         │
│   src/app/api/v2/[combined-name]/__tests__/               │
│                                                           │
│ Test cases:                                               │
│   - All source APIs called correctly                      │
│   - Data flows between APIs correctly                     │
│   - Error handling works per strategy                     │
│   - Response matches combined schema                      │
│                                                           │
│ Run tests (expect failure):                               │
│   pnpm test src/app/api/v2/[combined-name]                │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 8: TDD GREEN (Orchestration) ──────────────────────┐
│                                                           │
│ Create orchestration route:                               │
│   src/app/api/v2/[combined-name]/route.ts                 │
│                                                           │
│ Implementation based on flow type:                        │
│   Sequential: await Promise.resolve chain                 │
│   Parallel: await Promise.all                             │
│   Conditional: if/else with fallback                      │
│                                                           │
│ Apply error strategy from Phase 5                         │
│ Apply data mapping from Phase 4                           │
│                                                           │
│ Run tests (expect pass):                                  │
│   pnpm test src/app/api/v2/[combined-name]                │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 9: CURL EXAMPLES ──────────────────────────────────┐
│                                                           │
│ Generate curl commands for testing:                       │
│                                                           │
│ Happy path:                                               │
│   curl -X POST http://localhost:3000/api/v2/[combined]    │
│        -H "Content-Type: application/json"                │
│        -d '{"field1": "value1", "field2": "value2"}'      │
│                                                           │
│ Error cases:                                              │
│   - Missing required field                                │
│   - Invalid data type                                     │
│   - Source API failure simulation                         │
│                                                           │
│ Store in manifest for documentation                       │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 10: PERFORMANCE TEST ──────────────────────────────┐
│                                                           │
│ Measure orchestration latency:                            │
│   - Individual API latencies                              │
│   - Combined endpoint latency                             │
│   - Overhead percentage                                   │
│                                                           │
│ AskUserQuestion if latency unacceptable:                  │
│ "Combined endpoint takes [X]ms. Acceptable?"              │
│                                                           │
│ Options:                                                  │
│   - Yes, acceptable                                       │
│   - No, optimize (add caching, parallelize more)          │
│   - No, split into multiple endpoints                     │
│                                                           │
│ Loop back to Phase 8 if optimization needed               │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 11: DOCUMENTATION ─────────────────────────────────┐
│                                                           │
│ Update:                                                   │
│   - api-tests-manifest.json with combined endpoint        │
│   - v2-api-implementation-status.md                       │
│   - Add flow diagram to docs                              │
│   - Add curl examples                                     │
│                                                           │
│ AskUserQuestion: "Documentation complete?"                │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 12: COMPLETION ────────────────────────────────────┐
│                                                           │
│ Update .claude/registry.json with combined entry:         │
│   {                                                       │
│     "name": "[combined-name]",                            │
│     "type": "combined",                                   │
│     "source_apis": ["api1", "api2"],                      │
│     "flow_type": "sequential|parallel|conditional",       │
│     "status": "complete"                                  │
│   }                                                       │
│                                                           │
│ Final output:                                             │
│   - List source APIs                                      │
│   - Flow diagram                                          │
│   - Test results                                          │
│   - Curl examples                                         │
│   - Performance metrics                                   │
│                                                           │
│ Mark all TodoWrite phases as completed                    │
│                                                           │
│ AskUserQuestion: "Create another combined endpoint?"      │
└───────────────────────────────────────────────────────────┘
```

---

## State File Structure

```json
{
  "version": "3.11.0",
  "workflow": "combine-api",
  "active_element": "[combined-name]",
  "elements": {
    "[combined-name]": {
      "type": "combined",
      "status": "in_progress",
      "started_at": "2025-12-25T10:00:00Z",
      "combine_config": {
        "mode": "api",
        "source_elements": [
          { "type": "api", "name": "api1", "verified": true },
          { "type": "api", "name": "api2", "verified": true }
        ],
        "flow_type": "sequential|parallel|conditional",
        "flow_order": ["api1", "api2"],
        "data_mapping": {},
        "error_strategy": "fail-fast|fallback|retry|partial"
      },
      "phases": {
        "selection": { "status": "complete" },
        "registry_verification": { "status": "complete" },
        "flow_type": { "status": "complete" },
        "data_mapping": { "status": "complete" },
        "error_strategy": { "status": "complete" },
        "combined_schema": { "status": "complete" },
        "tdd_red": { "status": "complete" },
        "tdd_green": { "status": "complete" },
        "curl_examples": { "status": "complete" },
        "performance_test": { "status": "complete" },
        "documentation": { "status": "complete" },
        "completion": { "status": "complete" }
      }
    }
  }
}
```

---

## Output Artifacts

This command creates:

1. **Route File**: `src/app/api/v2/[combined-name]/route.ts`
2. **Schema File**: `src/app/api/v2/[combined-name]/schema.ts`
3. **Test File**: `src/app/api/v2/[combined-name]/__tests__/[combined-name].test.ts`
4. **OpenAPI Spec**: Updated with combined endpoint
5. **Manifest Entry**: Updated `api-tests-manifest.json`
6. **Registry Entry**: Updated `.claude/registry.json`

---

## Key Principles

1. **Registry-driven** - Only combine APIs from registry
2. **Verify first** - All source APIs must be complete
3. **User selects flow** - Sequential, parallel, or conditional
4. **Error strategy explicit** - User chooses handling approach
5. **Performance tested** - Latency must be acceptable
6. **TodoWrite tracking** - Update progress at every phase

---

**Version:** 3.11.0
**Last Updated:** 2025-12-25
