---
name: api-create
description: Complete API development workflow using interview-driven, research-first, test-first methodology with continuous verification loops. Use when creating new V2 API endpoints. Includes 14 phases from disambiguation through AI code review with loop-back architecture. Features async parallel research, multi-strategy documentation discovery (Context7 + WebSearch + Skills), real-time TodoWrite progress tracking, and cost/time metrics. Keywords: api, endpoint, tdd, research, interview, verification, workflow, testing, documentation, async, parallel
license: MIT
compatibility: Requires Claude Code with MCP servers (Context7 for docs, GitHub for PRs), Python 3.9+ for enforcement hooks, pnpm 10.11.0+ for package management, Vitest for testing
metadata:
  version: "3.11.0"
  category: "development"
  tags: ["api", "tdd", "workflow", "research", "interview", "verification", "testing", "async", "parallel", "todowrite"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 mcp__github AskUserQuestion Read Write Edit Bash TodoWrite Task
---

# API Create - Comprehensive API Development Workflow v3.11.0

**Usage:** `/api-create [endpoint-name]`

**Purpose:** Orchestrates the complete API development workflow using interview-driven, research-first, test-first methodology with continuous verification loops.

## ⚠️ CRITICAL: MANDATORY USER INTERACTION

**YOU MUST USE THE `AskUserQuestion` TOOL AT EVERY CHECKPOINT.**

This workflow requires REAL user input at each phase. You are **FORBIDDEN** from:
- Self-answering questions
- Assuming user responses
- Proceeding without explicit user confirmation
- Making decisions on behalf of the user

### How to Ask Questions Correctly

At every `[Y/n]` or multiple-choice prompt in this workflow, you MUST call the `AskUserQuestion` tool with this EXACT schema:

```json
{
  "questions": [
    {
      "question": "Your question here? (must end with ?)",
      "header": "Phase",
      "multiSelect": false,
      "options": [
        {"label": "Option A", "description": "What this option means"},
        {"label": "Option B", "description": "What this option means"},
        {"label": "Other", "description": "I'll type my own answer"}
      ]
    }
  ]
}
```

**CRITICAL REQUIREMENTS:**
- `header`: Max 12 characters (e.g., "Scope", "Research", "Format")
- `options`: 2-4 options, each with `label` (1-5 words) and `description`
- `multiSelect`: Required boolean (true for checkboxes, false for radio)
- `question`: Must end with a question mark
- Users can always select "Other" to provide custom input

**WAIT for the user's response before proceeding.** The tool will show a UI dialog and pause execution until the user answers. Do NOT continue until you receive the response.

### Violation Detection

The enforcement hooks will BLOCK your progress if:
- `user_question_asked` is false for any phase
- `user_confirmed`/`user_approved`/`user_completed` is false
- `phase_exit_confirmed` is false (user must explicitly approve proceeding to next phase)
- Questions were not asked via the AskUserQuestion tool

If you see "BLOCKED" messages, it means you skipped user interaction.

### Phase Exit Confirmation (NEW in v3.5.0)

**Every phase requires an EXIT CONFIRMATION question** before proceeding to the next phase. This prevents Claude from self-answering and moving on without explicit user approval.

The exit confirmation question MUST:
1. Summarize what was accomplished in the current phase
2. Ask if user is ready to proceed to the next phase
3. Include options like "Yes, proceed", "No, I have changes", "Add more"

Example exit confirmation:
```json
{
  "questions": [{
    "question": "Phase complete. Research found 5 sources. Ready to proceed to Interview phase?",
    "header": "Proceed",
    "multiSelect": false,
    "options": [
      {"label": "Yes, proceed", "description": "Move to next phase"},
      {"label": "No, more research", "description": "I need additional research on [topic]"},
      {"label": "Review sources", "description": "Show me what was found"}
    ]
  }]
}
```

The `phase_exit_confirmed` flag is automatically set when:
1. An `AskUserQuestion` is called with a question containing words like "proceed", "continue", "ready", "confirm", "approve"
2. The user responds with an affirmative answer (yes, proceed, confirm, approve, etc.)

Both conditions must be true for the flag to be set.

---

## Key Principles

1. **Loop Until Green** - Every verification phase loops back if not successful
2. **Continuous Interviews** - Checkpoints at EVERY phase transition (USE AskUserQuestion!)
3. **Adaptive Research** - Propose searches based on context, not shotgun approach
4. **Self-Documenting** - State file captures everything for re-grounding
5. **Verify After Green** - Re-research docs to catch memory-based implementation errors
6. **Real-Time Progress** - TodoWrite updates at every phase for visual tracking
7. **Parallel Research** - Background agents for 3x faster documentation discovery
8. **Multi-Strategy Coverage** - Context7 + WebSearch + Skills for 95% parameter discovery

---

## 🆕 v3.11.0 ENHANCEMENTS

### TodoWrite Integration (Real-Time Progress)

**At the START of this workflow**, initialize TodoWrite with all 14 phases:

```
TodoWrite([
  {content: "Phase 1: Disambiguation", status: "in_progress", activeForm: "Clarifying API terms"},
  {content: "Phase 2: Scope", status: "pending", activeForm: "Confirming endpoint scope"},
  {content: "Phase 3: Initial Research", status: "pending", activeForm: "Researching documentation"},
  {content: "Phase 4: Interview", status: "pending", activeForm: "Interviewing for requirements"},
  {content: "Phase 5: Deep Research", status: "pending", activeForm: "Deep diving into specifics"},
  {content: "Phase 6: Schema", status: "pending", activeForm: "Creating Zod schema"},
  {content: "Phase 7: Environment", status: "pending", activeForm: "Checking API keys"},
  {content: "Phase 8: TDD Red", status: "pending", activeForm: "Writing failing tests"},
  {content: "Phase 9: TDD Green", status: "pending", activeForm: "Implementing to pass tests"},
  {content: "Phase 10: Verify", status: "pending", activeForm: "Re-researching and verifying"},
  {content: "Phase 11: Refactor", status: "pending", activeForm: "Cleaning up code"},
  {content: "Phase 12: Documentation", status: "pending", activeForm: "Updating documentation"},
  {content: "Phase 13: Completion", status: "pending", activeForm: "Final verification"},
  {content: "Phase 14: Code Review", status: "pending", activeForm: "AI code review"}
])
```

**After completing each phase**, update TodoWrite:
- Mark completed phase as `"completed"`
- Mark next phase as `"in_progress"`

**On loop-back** (e.g., Phase 10 fails → back to Phase 8):
- Mark Phase 8+ as `"in_progress"` or `"pending"`
- This shows the user why we're going backwards

### Async Parallel Research (3x Faster)

**In Phase 3**, spawn background agents for parallel research:

```
# Instead of sequential:
1. Context7 query → wait → results
2. WebSearch query → wait → results
3. WebSearch query → wait → results
Total: 60-90 seconds

# Use parallel with Task tool:
Task({
  description: "Context7 research",
  prompt: "Use Context7 to find [library] documentation. Return endpoints, parameters, auth methods.",
  subagent_type: "general-purpose",
  run_in_background: true
})

Task({
  description: "WebSearch official docs",
  prompt: "Search for '[library] official API documentation'. Return key endpoints and parameters.",
  subagent_type: "general-purpose",
  run_in_background: true
})

Task({
  description: "WebSearch advanced features",
  prompt: "Search for '[library] webhooks rate limits batch API'. Return advanced features.",
  subagent_type: "general-purpose",
  run_in_background: true
})

# All 3 run in parallel → Total: 20-30 seconds (3x faster!)
```

**User can monitor with** `/tasks` command to see background agent progress.

### Multi-Strategy Research (95% Coverage)

**Phase 3 now uses THREE strategies** for comprehensive documentation discovery:

**Strategy 1: Context7 MCP (Official Docs) - 70% coverage**
```
1. mcp__context7__resolve-library-id: "[library-name]"
2. mcp__context7__get-library-docs with topics:
   - "api-endpoints"
   - "authentication"
   - "webhooks"
   - "rate-limits"
   - "error-handling"
```

**Strategy 2: WebSearch (Community Knowledge) - +15% = 85% coverage**
```
Search queries (run in parallel):
1. "[Library] official API documentation"
2. "[Library] webhooks setup guide"
3. "[Library] batch processing endpoints"
4. "[Library] rate limits pricing"
5. "[Library] error codes reference"
6. "[Library] advanced parameters GitHub"
```

**Strategy 3: Skill Discovery (Specialized Tools) - +10% = 95% coverage**
```
Use /skill-finder to discover API research skills:
- api-documentation-scraper
- openapi-parameter-discoverer
- sdk-method-extractor
```

### Cost/Time Tracking

**Throughout the workflow**, track:
- Start time of each phase
- Token usage per phase
- Total session cost

**At Phase 13/14**, display summary:
```
═══════════════════════════════════════════════════
🎉 API Development Complete: [endpoint-name]
═══════════════════════════════════════════════════

📊 Session Metrics:
   Duration:      35 minutes 24 seconds
   Phases:        14/14 ✓
   Async agents:  3 (parallelized research)

💰 Cost Breakdown:
   Research:      $0.32 (Context7 + WebSearch)
   Implementation: $0.95 (Claude Sonnet)
   Code Review:   $0.00 (CodeRabbit - open source)
   ─────────────────────────────
   TOTAL:         $1.27

⚡ Efficiency:
   Coverage:      95% (vs 60% in v3.0)
   Time saved:    ~15 min (async research)
```

---

## Complete Phase Flow (14 Phases)

```
/api-create [endpoint]
        │
        ▼
┌─ PHASE 1: DISAMBIGUATION ─────────────────────────────────┐
│ Search 3-5 variations of the term:                        │
│   • "[term]"                                              │
│   • "[term] API"                                          │
│   • "[term] SDK"                                          │
│   • "[term] npm package"                                  │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool with EXACT schema:  │
│                                                           │
│   {                                                       │
│     "questions": [{                                       │
│       "question": "Which interpretation of [term]?",      │
│       "header": "Disambig",                               │
│       "multiSelect": false,                               │
│       "options": [                                        │
│         {"label": "REST API", "description": "Official API"},│
│         {"label": "SDK/Package", "description": "NPM wrapper"},│
│         {"label": "Both", "description": "API + SDK"}     │
│       ]                                                   │
│     }]                                                    │
│   }                                                      │
│                                                           │
│ WAIT for user response. Do NOT proceed without it.        │
│ ──── Loop back if user selects "Something else" ────      │
└───────────────────────────────────────────────────────────┘
        │ Clear
        ▼
┌─ PHASE 2: SCOPE CONFIRMATION ─────────────────────────────┐
│                                                           │
│ Present your understanding, then:                         │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "I understand you want /api/v2/[endpoint] │
│                  to [purpose]. Using [external API].      │
│                  Is this correct?",                       │
│       header: "Scope",                                    │
│       options: [                                          │
│         "Yes, proceed",                                   │
│         "I have modifications to add",                    │
│         "No, let me clarify the purpose"                  │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT assume "yes".              │
│ ──── Loop back if user has modifications ────             │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 3: INITIAL RESEARCH ───────────────────────────────┐
│                                                           │
│ Execute 2-3 initial searches:                             │
│   • Context7: "[library/api name]"                        │
│   • WebSearch: "[name] official documentation"            │
│   • WebSearch: "site:[domain] api reference"              │
│                                                           │
│ Present summary table, then:                              │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Research summary above. Found [N]        │
│                  sources. Should I proceed or search      │
│                  for more?",                              │
│       header: "Research",                                 │
│       options: [                                          │
│         "Proceed to interview",                           │
│         "Search more - I need [specific topic]",          │
│         "Search for something specific (I'll describe)"   │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-proceed.              │
│ ──── Loop back if user wants more research ────           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 4: INTERVIEW (Generated FROM Research) ────────────┐
│                                                           │
│ For EACH parameter discovered in research, ask ONE        │
│ question at a time using AskUserQuestion:                 │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion for EACH question:       │
│                                                           │
│   // Question 1: Format preference                        │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Which response formats do you need?",    │
│       header: "Format",                                   │
│       multiSelect: true,                                  │
│       options: ["JSON", "SVG", "PNG", "All formats"]      │
│     }]                                                    │
│   })                                                      │
│   // WAIT for response, record in state, then next Q      │
│                                                           │
│   // Question 2: Error handling                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "How should errors be handled?",          │
│       header: "Errors",                                   │
│       options: [                                          │
│         "Throw exceptions",                               │
│         "Return error objects",                           │
│         "Both (configurable)"                             │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│   // Continue for ALL parameters...                       │
│                                                           │
│ After ALL questions answered:                             │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Interview complete. Your decisions:      │
│                  [summary]. All correct?",                │
│       header: "Confirm",                                  │
│       options: [                                          │
│         "Yes, proceed to schema",                         │
│         "Change an answer",                               │
│         "Add another question"                            │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ Decisions saved to state file for consistency.            │
│ ──── Loop back if user wants to change answers ────       │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 5: DEEP RESEARCH (Adaptive) ───────────────────────┐
│                                                           │
│ Based on interview answers, PROPOSE additional research.  │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Based on your interview answers, I       │
│                  want to research: [list]. Approve?",     │
│       header: "Deep Research",                            │
│       options: [                                          │
│         "Yes, run these searches",                        │
│         "Add more - I also need [topic]",                 │
│         "Skip deep research, proceed to schema"           │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-approve.              │
│ KEY: Research is PROPOSED, not automatic shotgun.         │
│ ──── Loop back if user wants to add topics ────           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 6: SCHEMA DESIGN ──────────────────────────────────┐
│                                                           │
│ Create Zod schema from research + interview, then:        │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Schema created based on your interview.  │
│                  [show schema]. Does this match your      │
│                  requirements?",                          │
│       header: "Schema",                                   │
│       options: [                                          │
│         "Yes, schema looks correct",                      │
│         "No, I need changes (I'll describe)",             │
│         "Let's redo the interview"                        │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT assume approval.           │
│ ──── Loop back if schema needs changes ────               │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 7: ENVIRONMENT CHECK ──────────────────────────────┐
│                                                           │
│ Check required API keys, show status table, then:         │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Environment check: [N] keys found,       │
│                  [M] missing. Ready to start TDD?",       │
│       header: "Environment",                              │
│       options: [                                          │
│         "Yes, ready to write tests",                      │
│         "No, need to set up API keys first",              │
│         "No, need to fix something else"                  │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-proceed.              │
│ ──── Loop back if keys missing ────                       │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 8: TDD RED (Write Failing Tests) ──────────────────┐
│                                                           │
│ Generate test matrix from schema + interview, then:       │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Test matrix: [N] test scenarios based    │
│                  on your interview. Covers: [list].       │
│                  Approve this test plan?",                │
│       header: "Tests",                                    │
│       options: [                                          │
│         "Yes, write these tests",                         │
│         "Add more scenarios (I'll describe)",             │
│         "Change a scenario (I'll describe)"               │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-approve.              │
│ HOOK: PreToolUse blocks Write if no research/interview    │
│ ──── Loop back if user wants changes ────                 │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 9: TDD GREEN (Minimal Implementation) ─────────────┐
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
┌─ PHASE 10: VERIFY (Re-Research After Green) ───────────────┐
│                                                           │
│ MANDATORY: Re-read original documentation.                │
│ Compare implementation to docs, then:                     │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Verification found [N] gap(s) between    │
│                  docs and implementation: [list].         │
│                  How should I proceed?",                  │
│       header: "Verify",                                   │
│       options: [                                          │
│         "Fix gaps - loop back to Red phase",              │
│         "Skip - these are intentional omissions",         │
│         "Fix some, skip others (I'll specify)"            │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-decide.               │
│ HOOK: PostToolUse triggers after test pass                │
│ ──── Loop back to Phase 8 if user wants fixes ────        │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 11: TDD REFACTOR ──────────────────────────────────┐
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
┌─ PHASE 12: DOCUMENTATION ─────────────────────────────────┐
│                                                           │
│ Update documentation files, then:                         │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Documentation checklist: [list files].   │
│                  All documentation complete?",            │
│       header: "Docs",                                     │
│       options: [                                          │
│         "Yes, all documentation is done",                 │
│         "No, I need to add something (I'll describe)",    │
│         "Skip docs for now (not recommended)"             │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-complete.             │
│ HOOK: Stop hook blocks if docs incomplete                 │
│ ──── Loop back if user needs to add docs ────             │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 13: COMPLETION ────────────────────────────────────┐
│                                                           │
│ Final verification:                                       │
│   • All tests passing                                     │
│   • 100% coverage                                         │
│   • TypeScript compiles                                   │
│   • Docs updated                                          │
│   • State file shows all phases complete                  │
│                                                           │
│ Proceed to AI Code Review before committing.              │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 14: AI CODE REVIEW (NEW in v3.11.0) ──────────────┐
│                                                           │
│ Run AI-powered code review using multiple tools:          │
│                                                           │
│ 1. **CodeRabbit** (if installed):                         │
│    npx coderabbitai-mcp@latest                           │
│    - 95%+ bug detection                                   │
│    - Security vulnerability scanning                      │
│    - Code smell detection                                 │
│    - Performance optimization suggestions                 │
│                                                           │
│ 2. **Greptile** (if API key available):                   │
│    mcp__greptile__search with code review query           │
│    - Semantic code understanding                          │
│    - Cross-file dependency analysis                       │
│    - $0.15 per query (cost-effective)                     │
│                                                           │
│ 3. **Manual Claude Review** (fallback):                   │
│    If no external tools, Claude performs:                 │
│    - Security audit (OWASP Top 10)                        │
│    - Error handling verification                          │
│    - Edge case detection                                  │
│    - Type safety check                                    │
│                                                           │
│ ⚠️ REQUIRED: Use AskUserQuestion tool:                    │
│                                                           │
│   AskUserQuestion({                                       │
│     questions: [{                                         │
│       question: "Code review found [N] issues:            │
│                  [summary]. How should I proceed?",       │
│       header: "Review",                                   │
│       options: [                                          │
│         "Fix all issues",                                 │
│         "Fix critical only (defer minor)",                │
│         "Skip review (not recommended)",                  │
│         "Show detailed findings"                          │
│       ]                                                   │
│     }]                                                    │
│   })                                                      │
│                                                           │
│ WAIT for user response. Do NOT auto-proceed.              │
│ ──── Loop back to Phase 8/9 if fixes needed ────          │
│                                                           │
│ 4. **Graphite** (for stacked PRs):                        │
│    gt create --stack [endpoint-name]                      │
│    - Stacked PRs for dependent changes                    │
│    - Parallel team collaboration                          │
│    - Incremental reviews without blocking                 │
│                                                           │
│ After review approved:                                    │
│   • Display cost/time summary (via /stats)                │
│   • Run /commit to create semantic commit                 │
│   • Optionally run /pr to create pull request             │
│   • For stacked changes: gt stack submit                  │
└───────────────────────────────────────────────────────────┘
```

## State File Tracking

All phases are tracked in `.claude/api-dev-state.json`:

```json
{
  "version": "3.11.0",
  "endpoint": "brandfetch",
  "turn_count": 23,
  "session": {
    "started_at": "2025-12-24T10:30:00Z",
    "ended_at": "2025-12-24T11:05:24Z",
    "duration_seconds": 2124,
    "async_agents_used": 3,
    "total_cost_usd": 1.27
  },
  "phases": {
    "disambiguation": { "status": "complete", "started_at": "...", "ended_at": "..." },
    "scope": { "status": "complete" },
    "research_initial": {
      "status": "complete",
      "sources": [...],
      "strategy": "multi",
      "coverage_pct": 95
    },
    "interview": { "status": "complete", "decisions": {...} },
    "research_deep": { "status": "complete" },
    "schema_creation": { "status": "complete" },
    "environment_check": { "status": "complete" },
    "tdd_red": { "status": "complete", "test_count": 23 },
    "tdd_green": { "status": "complete" },
    "verify": { "status": "complete", "gaps_found": 2, "gaps_fixed": 2 },
    "tdd_refactor": { "status": "complete" },
    "documentation": { "status": "complete" },
    "completion": { "status": "complete" },
    "code_review": {
      "status": "complete",
      "tool": "coderabbit",
      "issues_found": 2,
      "issues_fixed": 2,
      "issues_deferred": 0
    }
  },
  "research_cache": {
    "location": ".claude/research/brandfetch/",
    "files": ["CURRENT.md", "2025-12-24_initial.md", "2025-12-24_deep.md"],
    "freshness_days": 7,
    "last_updated": "2025-12-24T10:45:00Z"
  },
  "cost_breakdown": {
    "research": 0.32,
    "implementation": 0.95,
    "code_review": 0.00,
    "total": 1.27
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

- Phase 1 (Disambiguation) - Clarify before research
- Phase 3 (Initial Research) - Find ALL parameters
- Phase 4 (Interview) - Questions FROM research, not templates
- Phase 8 (TDD Red) - Failing tests FIRST
- Phase 10 (Verify) - Re-research after Green
- Phase 12 (Documentation) - Keep docs in sync
- Coverage verification - 100% required
</claude-commands-template>
