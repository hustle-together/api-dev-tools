# Hustle Combine - API and UI Orchestration Workflow v4.0.0

**Usage:** `/hustle-combine [api|ui] [--auto] [--resume [workflow-id]]`

**Purpose:** Combines existing APIs or UI elements from the registry into new orchestration endpoints or composed components.

## Arguments

- `[api|ui]` - Mode: combine APIs or UI elements
- `--auto` - Fully autonomous mode, auto-answers all questions with comprehensive defaults
- `--resume [workflow-id]` - Resume an interrupted workflow from its last phase

---

## Auto Mode (`--auto`)

When `--auto` flag is used:

1. **No Interactive Questions:**
   - All questions auto-answered with comprehensive defaults
   - Uses `.claude/hustle-build-defaults.json` for configured answers
   - Falls back to "most comprehensive" option when no default exists

2. **Comprehensive Selection Logic:**
   - Selects parallel execution (when APIs are independent)
   - Uses partial-success error handling
   - Enables unified caching strategy
   - Uses exponential retry with 30s timeout

3. **API Selection in Orchestrated Mode:**
   - When `orchestrated: true`, APIs are pre-selected by orchestrator
   - Selection phase is skipped, proceeds directly to Scope

4. **Logging:**
   - All decisions logged to `.claude/workflow-logs/hustle-combine/[workflow-id].json`
   - Review with `/hustle-combine-review [workflow-id]`

---

## Resume Mode (`--resume`)

When `--resume [workflow-id]` is used:

1. Load state from `.claude/api-dev-state.json`
2. Find the last incomplete phase
3. Continue from that point
4. Preserve all previous decisions and API selections

---

## Orchestrated Mode

When running as part of `/hustle-build`:

1. `orchestrated: true` flag is set in state
2. `shared_decisions` are pre-filled from orchestrator interview
3. Source APIs are pre-selected based on orchestrator decomposition
4. Questions covered by shared_decisions are SKIPPED
5. Only combination-specific questions are asked (execution order, caching)

---

## Overview

This command reads from `.claude/registry.json` to present available elements for combination. It creates NEW orchestration layers using EXISTING, tested components.

**Key Principle:** We're not creating new APIs from scratch - we're combining existing, working APIs into orchestration endpoints.

---

## CRITICAL: MANDATORY USER INTERACTION

**YOU MUST USE THE `AskUserQuestion` TOOL AT EVERY CHECKPOINT.**

This workflow requires REAL user input at each phase. You are **FORBIDDEN** from:

- Self-answering questions
- Assuming user responses
- Proceeding without explicit user confirmation
- Making decisions on behalf of the user

### How to Ask Questions Correctly

At every prompt in this workflow, you MUST call the `AskUserQuestion` tool with this EXACT schema:

```json
{
  "questions": [
    {
      "question": "Your question here? (must end with ?)",
      "header": "Phase",
      "multiSelect": false,
      "options": [
        { "label": "Option A", "description": "What this option means" },
        { "label": "Option B", "description": "What this option means" },
        { "label": "Other", "description": "I'll type my own answer" }
      ]
    }
  ]
}
```

**CRITICAL REQUIREMENTS:**

- `header`: Max 12 characters (e.g., "Mode", "Select", "Order")
- `options`: 2-4 options, each with `label` (1-5 words) and `description`
- `multiSelect`: Required boolean (true for checkboxes, false for radio)
- `question`: Must end with a question mark

**WAIT for the user's response before proceeding.** Do NOT continue until you receive the response.

### Phase Exit Confirmation

**Every phase requires an EXIT CONFIRMATION question** before proceeding to the next phase.

Example:

```json
{
  "questions": [
    {
      "question": "Phase complete. Ready to proceed to next phase?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        { "label": "Yes, proceed", "description": "Move to next phase" },
        {
          "label": "No, make changes",
          "description": "I need to modify something"
        }
      ]
    }
  ]
}
```

---

## Mode Selection

When running `/hustle-combine`, first determine the mode:

Use AskUserQuestion:

```json
{
  "questions": [
    {
      "question": "What would you like to combine?",
      "header": "Mode",
      "multiSelect": false,
      "options": [
        {
          "label": "APIs",
          "description": "Combine existing API endpoints into orchestration layer"
        },
        {
          "label": "UI",
          "description": "Combine existing components/pages (coming soon)"
        }
      ]
    }
  ]
}
```

---

## Mode A: Combine APIs

### 14 Phases for API Combination

```
Phase 1:  SELECTION          - Present checkboxes from registry, user selects 2+ APIs
Phase 2:  SCOPE              - "What should this combined endpoint do?"
Phase 3:  INITIAL RESEARCH   - Orchestration patterns (lighter - APIs already researched)
Phase 4:  INTERVIEW          - Flow order, error handling, caching, naming
Phase 5:  DEEP RESEARCH      - Edge cases between APIs (optional/lighter)
Phase 6:  COMBINED SCHEMA    - Zod types composing existing schemas
Phase 7:  ENVIRONMENT        - Verify all required API keys exist
Phase 8:  TDD RED            - Integration tests for combined flow
Phase 9:  TDD GREEN          - Orchestration route implementation
Phase 10: VERIFY             - Full flow works end-to-end
Phase 11: CODE REVIEW        - Greptile AI review for bugs, security, performance
Phase 12: REFACTOR           - Fix review issues + clean up, optimize
Phase 13: DOCUMENTATION      - Update manifest, document combined endpoint
Phase 14: COMPLETE           - Update registry with new combined API
```

---

### Phase 1: SELECTION (Programmatic from Registry)

Read `.claude/registry.json` and present available APIs.

**IMPORTANT:** Options are dynamically generated from registry.json. Only show APIs with `status: "complete"`.

Use AskUserQuestion with multiSelect:

```json
{
  "questions": [
    {
      "question": "Select APIs to combine (choose 2 or more):",
      "header": "Select",
      "multiSelect": true,
      "options": [
        {
          "label": "[api-name]",
          "description": "[api-description from registry]"
        }
      ]
    }
  ]
}
```

**After selection, store in state:**

```json
{
  "workflow": "combine-api",
  "combine_config": {
    "mode": "api",
    "source_elements": [
      { "type": "api", "name": "api1" },
      { "type": "api", "name": "api2" }
    ]
  }
}
```

**Phase Exit:**

```json
{
  "questions": [
    {
      "question": "Selected [N] APIs. Ready to define the purpose?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        { "label": "Yes, proceed", "description": "Move to Scope phase" },
        {
          "label": "Change selection",
          "description": "I want to select different APIs"
        }
      ]
    }
  ]
}
```

---

### Phase 2: SCOPE

Ask what the combined endpoint should do:

```json
{
  "questions": [
    {
      "question": "What should this combined endpoint do? Describe the purpose:",
      "header": "Purpose",
      "multiSelect": false,
      "options": [
        { "label": "Describe it", "description": "I'll type the purpose" }
      ]
    }
  ]
}
```

Store the purpose in state for later use in schema and tests.

**Phase Exit:**

```json
{
  "questions": [
    {
      "question": "Purpose defined. Ready to research orchestration patterns?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        { "label": "Yes, proceed", "description": "Move to Research phase" },
        {
          "label": "Refine purpose",
          "description": "I want to clarify the purpose"
        }
      ]
    }
  ]
}
```

---

### Phase 3: INITIAL RESEARCH (Lighter)

Since APIs already exist, focus ONLY on orchestration patterns:

- Gateway aggregation patterns
- Error propagation between services
- Response composition strategies

```json
{
  "questions": [
    {
      "question": "Research focus: I'll look up orchestration patterns for combining [API1] + [API2]. Proceed?",
      "header": "Research",
      "multiSelect": false,
      "options": [
        {
          "label": "Yes, proceed",
          "description": "Research orchestration patterns"
        },
        {
          "label": "Skip research",
          "description": "I know how I want to combine them"
        }
      ]
    }
  ]
}
```

If user chooses to research, use WebSearch and Context7 for:

- "API gateway aggregation patterns"
- "Service composition error handling"
- "Response aggregation TypeScript patterns"

**Phase Exit:**

```json
{
  "questions": [
    {
      "question": "Research complete. Ready for interview questions?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        { "label": "Yes, interview", "description": "Move to Interview phase" },
        {
          "label": "More research",
          "description": "I need to research [topic]"
        }
      ]
    }
  ]
}
```

---

### Phase 4: INTERVIEW

Key questions for API combination (ask one at a time):

**Q1: Endpoint Name**

```json
{
  "questions": [
    {
      "question": "What should the combined endpoint be called?",
      "header": "Name",
      "multiSelect": false,
      "options": [
        {
          "label": "[suggested-name]",
          "description": "Suggested: /api/v2/[suggested-name]"
        },
        { "label": "Custom name", "description": "I'll type my own" }
      ]
    }
  ]
}
```

**Q2: Execution Order**

```json
{
  "questions": [
    {
      "question": "How should the APIs execute?",
      "header": "Order",
      "multiSelect": false,
      "options": [
        { "label": "Parallel", "description": "All at once, combine results" },
        {
          "label": "Sequential",
          "description": "One after another, pass data between"
        },
        {
          "label": "Conditional",
          "description": "Second API depends on first result"
        }
      ]
    }
  ]
}
```

**Q3: Error Handling**

```json
{
  "questions": [
    {
      "question": "If the first API fails, what should happen?",
      "header": "Errors",
      "multiSelect": false,
      "options": [
        {
          "label": "Fail entire request",
          "description": "Return error, don't call other APIs"
        },
        {
          "label": "Continue with partial",
          "description": "Return what succeeded"
        },
        {
          "label": "Retry once",
          "description": "Retry failed API, then fail if still failing"
        }
      ]
    }
  ]
}
```

**Q4: Data Transformation**

```json
{
  "questions": [
    {
      "question": "Do you need to transform data between APIs?",
      "header": "Transform",
      "multiSelect": false,
      "options": [
        { "label": "No", "description": "Use responses as-is" },
        { "label": "Yes", "description": "I'll describe the transformation" }
      ]
    }
  ]
}
```

**Q5: Caching**

```json
{
  "questions": [
    {
      "question": "Caching strategy?",
      "header": "Cache",
      "multiSelect": false,
      "options": [
        { "label": "No caching", "description": "Always fetch fresh" },
        {
          "label": "Cache combined result",
          "description": "Cache the final response"
        },
        {
          "label": "Cache individual APIs",
          "description": "Cache each API's response separately"
        }
      ]
    }
  ]
}
```

**Store all decisions in state:**

```json
{
  "phases": {
    "interview": {
      "status": "complete",
      "decisions": {
        "endpoint_name": "brand-voice",
        "execution_order": "sequential",
        "error_strategy": "fail-fast",
        "data_transformation": false,
        "caching_strategy": "none"
      }
    }
  }
}
```

**Phase Exit:**

```json
{
  "questions": [
    {
      "question": "Interview complete. Ready for deep research?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        {
          "label": "Yes, proceed",
          "description": "Move to Deep Research phase"
        },
        {
          "label": "Change answers",
          "description": "I want to modify my answers"
        }
      ]
    }
  ]
}
```

---

### Phase 5: DEEP RESEARCH (Optional)

Based on interview answers, propose targeted research:

```json
{
  "questions": [
    {
      "question": "Based on your answers, should I research: [specific topics based on interview]?",
      "header": "Deep",
      "multiSelect": false,
      "options": [
        { "label": "Yes, research these", "description": "Run the searches" },
        {
          "label": "Add more topics",
          "description": "I need [something specific]"
        },
        { "label": "Skip to schema", "description": "I have enough info" }
      ]
    }
  ]
}
```

Topics to propose based on interview:

- If sequential: "data passing between API calls"
- If parallel: "Promise.all error handling patterns"
- If retry: "exponential backoff strategies"
- If caching: "response caching with invalidation"

---

### Phase 6: COMBINED SCHEMA

Create Zod schema that COMPOSES existing schemas:

```typescript
// src/app/api/v2/[combined-name]/schemas.ts
import { z } from "zod";
import { Api1ResponseSchema } from "../api1/schemas";
import { Api2ResponseSchema } from "../api2/schemas";

// Combined request schema
export const CombinedRequestSchema = z.object({
  // Fields needed by both APIs
});

// Combined response schema
export const CombinedResponseSchema = z.object({
  api1: Api1ResponseSchema,
  api2: Api2ResponseSchema,
  combined_at: z.string(),
});

export type CombinedRequest = z.infer<typeof CombinedRequestSchema>;
export type CombinedResponse = z.infer<typeof CombinedResponseSchema>;
```

**Ask for approval:**

```json
{
  "questions": [
    {
      "question": "Combined schema created. It imports from [API1] and [API2] schemas. Approve?",
      "header": "Schema",
      "multiSelect": false,
      "options": [
        { "label": "Yes, approved", "description": "Schema looks correct" },
        { "label": "Make changes", "description": "I need to modify something" }
      ]
    }
  ]
}
```

---

### Phase 7: ENVIRONMENT CHECK

Verify all API keys from combined APIs are available.

Read the source API entries in registry.json to determine required environment variables.

Report:

```
Environment Check:
[checkmark] API1_KEY - Found
[checkmark] API2_KEY - Found

All required keys available.
```

```json
{
  "questions": [
    {
      "question": "Environment check passed. All [N] API keys found. Ready for TDD?",
      "header": "Env",
      "multiSelect": false,
      "options": [
        { "label": "Yes, write tests", "description": "Proceed to TDD Red" },
        {
          "label": "No, need setup",
          "description": "I need to configure something"
        }
      ]
    }
  ]
}
```

---

### Phase 8: TDD RED (Integration Tests)

Write tests for the combined flow:

```typescript
// src/app/api/v2/[combined-name]/__tests__/[combined-name].api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("[Combined Name] API", () => {
  describe("POST /api/v2/[combined-name]", () => {
    it("should call both APIs and combine results", async () => {
      // Test combined flow
    });

    it("should handle first API failure correctly", async () => {
      // Test error handling based on interview decisions
    });

    // More tests based on interview decisions...
  });
});
```

Run tests - they should FAIL (Red phase).

**Phase Exit:**

```json
{
  "questions": [
    {
      "question": "Failing tests written. Ready to implement?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        { "label": "Yes, implement", "description": "Move to TDD Green phase" },
        {
          "label": "Add more tests",
          "description": "I need to test more scenarios"
        }
      ]
    }
  ]
}
```

---

### Phase 9: TDD GREEN (Orchestration Route)

Implement the orchestration logic:

```typescript
// src/app/api/v2/[combined-name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CombinedRequestSchema } from "./schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CombinedRequestSchema.parse(body);

    // Implementation based on interview decisions:
    // - Sequential/Parallel/Conditional execution
    // - Error handling strategy
    // - Data transformation
    // - Caching

    return NextResponse.json({
      // Combined response
      combined_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Run tests - all must pass (Green phase).

---

### Phase 10: VERIFY

Test the full flow end-to-end:

```json
{
  "questions": [
    {
      "question": "Integration tests pass. Should I verify the full flow manually with real API calls?",
      "header": "Verify",
      "multiSelect": false,
      "options": [
        {
          "label": "Yes, test real flow",
          "description": "Make actual API calls"
        },
        {
          "label": "Skip, tests sufficient",
          "description": "Proceed to refactor"
        }
      ]
    }
  ]
}
```

If verifying, make actual requests and report results.

---

### Phase 11: CODE REVIEW (Greptile)

Run Greptile AI code review before refactoring:

- Bug detection with full codebase context
- Security vulnerability scanning (OWASP top 10)
- Performance issue identification

**Requires:** GREPTILE_API_KEY + GITHUB_TOKEN

```json
{
  "questions": [
    {
      "question": "Code review found [N] issue(s). How should I proceed?",
      "header": "Review",
      "multiSelect": false,
      "options": [
        { "label": "Fix all", "description": "Address all issues in refactor" },
        {
          "label": "Critical only",
          "description": "Fix critical, defer others"
        },
        { "label": "Skip", "description": "No issues to fix" }
      ]
    }
  ]
}
```

---

### Phase 12: REFACTOR

Fix review issues + clean up the orchestration code:

- Address Greptile issues (bugs, security, performance)
- Extract reusable patterns
- Add error logging
- Optimize parallel calls if applicable
- Add JSDoc comments

Run tests after each change to ensure they still pass.

**Phase Exit:**

```json
{
  "questions": [
    {
      "question": "Refactoring complete. Tests still pass. Ready to document?",
      "header": "Proceed",
      "multiSelect": false,
      "options": [
        {
          "label": "Yes, document",
          "description": "Move to Documentation phase"
        },
        {
          "label": "More refactoring",
          "description": "I want to clean up more"
        }
      ]
    }
  ]
}
```

---

### Phase 13: DOCUMENTATION

Update:

1. `api-tests-manifest.json` - Add new combined endpoint
2. `registry.json` - Add to `combined` section
3. Any project docs as needed

```json
{
  "questions": [
    {
      "question": "Documentation updated. Ready to complete?",
      "header": "Docs",
      "multiSelect": false,
      "options": [
        {
          "label": "Yes, complete",
          "description": "Finalize and update registry"
        },
        { "label": "Need more docs", "description": "I want to add something" }
      ]
    }
  ]
}
```

---

### Phase 14: COMPLETION

Update registry.json with the new combined API:

```json
{
  "combined": {
    "[combined-name]": {
      "name": "[Display Name]",
      "type": "api",
      "description": "[Purpose from interview]",
      "combines": ["api1", "api2"],
      "route": "src/app/api/v2/[combined-name]/route.ts",
      "schemas": "src/app/api/v2/[combined-name]/schemas.ts",
      "tests": "src/app/api/v2/[combined-name]/__tests__/",
      "flow_type": "[sequential|parallel|conditional]",
      "created_at": "[date]",
      "status": "complete"
    }
  }
}
```

**Final confirmation:**

```json
{
  "questions": [
    {
      "question": "Combined API complete. Registry updated. Anything else?",
      "header": "Complete",
      "multiSelect": false,
      "options": [
        { "label": "Done", "description": "Workflow complete" },
        {
          "label": "Create another",
          "description": "Start new combine workflow"
        }
      ]
    }
  ]
}
```

### End-of-Workflow Summary

After successful combination, display:

```
═══════════════════════════════════════════════════════════════
✅ COMBINED API CREATED: [combined-name]

📍 Quick Links:
  • Test it:     /api-showcase
  • API Docs:    /docs/api/[combined-name]
  • Run tests:   pnpm test src/app/api/v2/[combined-name]
  • TypeDoc:     pnpm typedoc

📦 Combined:     [api1] + [api2]
📊 Dashboard:    /hustle-dev-dashboard

Next Steps:
  • /commit - Commit your changes
  • /hustle-api-create - Create another API
═══════════════════════════════════════════════════════════════
```

---

## Mode B: Combine UI (Coming Soon)

UI combination requires `/hustle-ui-create` to be implemented first.

Three sub-modes planned:

- **A) Composed Component** - Combine existing components
- **B) Page with Components** - Create page using components
- **C) Page with Components + API** - Create page with data fetching

---

## State File Structure

```json
{
  "version": "3.11.0",
  "workflow": "combine-api",
  "element_name": "brand-voice",
  "element_type": "combined",

  "combine_config": {
    "mode": "api",
    "source_elements": [
      { "type": "api", "name": "brandfetch" },
      { "type": "api", "name": "elevenlabs" }
    ],
    "flow_type": "sequential",
    "error_strategy": "fail-fast"
  },

  "phases": {
    "selection": {
      "status": "complete",
      "apis_selected": 2,
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "scope": {
      "status": "complete",
      "purpose": "...",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "research_initial": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "interview": {
      "status": "complete",
      "decisions": {},
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "research_deep": {
      "status": "skipped",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "schema_creation": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "environment_check": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "tdd_red": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "tdd_green": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "verify": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "code_review": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "tdd_refactor": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "documentation": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    },
    "completion": {
      "status": "complete",
      "user_question_asked": true,
      "phase_exit_confirmed": true
    }
  }
}
```

---

## Output Artifacts

1. **Route Handler**: `/src/app/api/v2/[combined-name]/route.ts`
2. **Schema File**: `/src/app/api/v2/[combined-name]/schemas.ts`
3. **Test Suite**: `/src/app/api/v2/[combined-name]/__tests__/`
4. **Updated Registry**: `.claude/registry.json` (combined section)
5. **Updated Manifest**: `api-tests-manifest.json`

---

## Example: WordPress + Elementor

```
/hustle-combine api

Available APIs:
[checkbox] wordpress    - WordPress REST API
[checkbox] elementor    - Elementor widget API
[checkbox] brandfetch   - Brand data extraction

> wordpress, elementor

Purpose: "Log into WordPress, then create Elementor template"

Interview:
- Order: Sequential (WordPress auth first)
- Errors: Fail if WordPress auth fails
- Name: wp-elementor-sync

Creates:
  src/app/api/v2/wp-elementor-sync/
  ├── route.ts
  ├── schemas.ts
  └── __tests__/
```

<claude-commands-template>
## Project Rules

1. **Registry Required**: Only combine APIs that exist in registry.json with `status: "complete"`
2. **No Skipping Selection**: User MUST select from available APIs
3. **Interview Required**: All decisions must come from user, not assumptions
4. **Lighter Research**: Since APIs exist, research focuses on orchestration patterns only
5. **Test Integration**: Tests verify APIs work together, not individual API behavior
6. **Update Registry**: Always update registry.json on completion

## Never Skip

- Phase 1 (Selection) - Must read from registry
- Phase 4 (Interview) - All orchestration decisions from user
- Phase 8 (TDD Red) - Integration tests first
- Phase 11 (Code Review) - Greptile review before refactoring
- Phase 14 (Complete) - Registry update required

## User Interaction Required

Every phase MUST use `AskUserQuestion` tool. Self-answering is FORBIDDEN.
</claude-commands-template>
