---
name: hustle-build
description: Build complete features from natural language. Orchestrates API, component, page, and combined workflows automatically.
license: MIT
compatibility: Requires Claude Code with hooks and MCP servers configured
metadata:
  version: "4.6.0"
  category: "orchestration"
  tags: ["build", "workflow", "orchestrator", "autonomous"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 mcp__github AskUserQuestion Read Write Edit Bash Task TodoWrite Skill
---

# Hustle Build - Master Orchestrator

Build complete features from natural language descriptions. This skill orchestrates multiple workflows (API, Component, Page, Combined) in the correct order with shared decisions.

## Usage

```
/hustle-build [description]
/hustle-build --auto [description]
/hustle-build --parallel [description]
/hustle-build --resume [build-id]
/hustle-build --dry-run [description]
/hustle-build --max-iterations [N] [description]
```

## Arguments

- `$ARGUMENTS` - Natural language description of what to build
- `--auto` - Fully autonomous mode, auto-answers questions
- `--parallel` - Run up to 5 Opus agents in parallel (requires worktrees)
- `--resume [id]` - Resume an interrupted build
- `--dry-run` - Show what would be created without executing
- `--max-iterations [N]` - Max retry iterations per phase (default: 5)
- `--skip-document` - Skip the project document prompt
- `--from-document [path]` - Use specified file as project document (PRD, spec)

## Parallel Execution (Recommended for Large Builds)

When `--parallel` is used, the orchestrator:

1. **Creates git worktrees** for each independent workflow
2. **Spawns up to 5 Opus agents** simultaneously
3. **Injects shared decisions** into each agent
4. **Merges results** when all complete

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL ORCHESTRATOR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Shared Context (from Interview)                               │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ Auth: JWT | Errors: partial-success | Brand: yes      │     │
│  └───────────────────────────────────────────────────────┘     │
│                          │                                      │
│          ┌───────────────┼───────────────┐                     │
│          ▼               ▼               ▼                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Agent #1     │ │ Agent #2     │ │ Agent #3     │           │
│  │ /api-create  │ │ /api-create  │ │ /hustle-ui   │           │
│  │ user-stats   │ │ chart-data   │ │ StatCard     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│          │               │               │                     │
│          └───────────────┼───────────────┘                     │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────┐     │
│  │              MERGE COORDINATOR                         │     │
│  │  • Combines registry entries                          │     │
│  │  • Resolves conflicts                                 │     │
│  │  • Creates unified PR                                 │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

See [PARALLEL_AUTONOMOUS_WORKFLOW.md](../../docs/PARALLEL_AUTONOMOUS_WORKFLOW.md) for details.

## Max Iterations

Each phase has a maximum iteration count to prevent infinite loops:

```json
{
  "max_iterations": {
    "default": 5,
    "phases": {
      "disambiguation": 2,
      "research": 3,
      "interview": 1,
      "schema": 3,
      "tdd_red": 5,
      "tdd_green": 10,
      "verify": 3,
      "code_review": 3,
      "refactor": 5
    }
  }
}
```

Override with `--max-iterations`:
```bash
# Allow more retries for complex builds
/hustle-build --max-iterations 10 --auto complex e-commerce system
```

When max iterations reached:
1. Log issue to `session_archives.interrupted`
2. Create partial PR with work completed
3. Notify via NTFY
4. Continue with other workflows

---

## Phase 1: Document Intake & Parsing (Optional)

At the start of `/hustle-build`, the `project-document-prompt.py` hook asks if you have a comprehensive project document.

**Supported Document Types:**
- PRD (Product Requirements Document)
- Technical specifications
- Deep research outputs (from `/plan` or `/spike`)
- API definitions (OpenAPI, JSON specs)

**How to provide:**
```
# When prompted, you can:
1. Provide a file path: ./docs/my-prd.md
2. Paste content directly
3. Provide a URL to fetch
4. Say "no document" to skip

# Or skip the prompt entirely:
/hustle-build --skip-document [description]

# Or provide a document directly:
/hustle-build --from-document ./docs/spec.md [description]
```

The document is stored in `state.project_spec.raw_content` for parsing.

### Document Parsing (When project_spec exists)

If a project document was provided, analyze it to extract structured elements.

**Extraction Targets:**

| Element Type | Keywords to Find | What to Extract |
|-------------|------------------|-----------------|
| Pages | "page", "screen", "route", "/path", "view" | name, route, description, features |
| Components | "component", "widget", "card", "form", "button" | name, type (display/input/composite), props, variants |
| APIs | "API", "endpoint", "/api/", "fetch", "GET", "POST" | name, method, path, request/response schemas |
| Data Models | "model", "schema", "type", "interface", "entity" | name, fields, relationships |
| Integrations | service names (Stripe, Supabase, Auth0) | service, features used, env vars |

**Dependency Graph Construction:**
- APIs = Tier 1 (no dependencies)
- Components = Tier 2 (depend on APIs for types)
- Pages = Tier 3 (depend on components)

**Store extracted data in state:**

```json
{
  "project_spec": {
    "source": "file|paste|url",
    "file_path": "./docs/my-prd.md",
    "raw_content": "[original document]",
    "format": "markdown|json|text",
    "parsed_at": "[timestamp]",
    "word_count": 2500,
    "extracted": {
      "summary": "E-commerce dashboard with user stats and order tracking",
      "pages": [
        {
          "name": "Dashboard",
          "route": "/dashboard",
          "description": "Main user dashboard",
          "features": ["stats display", "order list", "notifications"],
          "uses_components": ["StatCard", "OrderTable"],
          "uses_apis": ["user-stats", "orders"]
        }
      ],
      "components": [
        {
          "name": "StatCard",
          "type": "display",
          "description": "Display individual statistic with trend",
          "props": ["title", "value", "trend", "icon"],
          "variants": ["primary", "secondary", "success", "warning"]
        }
      ],
      "apis": [
        {
          "name": "user-stats",
          "method": "GET",
          "path": "/api/v2/user-stats",
          "description": "User statistics endpoint",
          "response_fields": ["totalOrders", "revenue", "growth"]
        }
      ],
      "data_models": [
        {
          "name": "UserStats",
          "fields": ["totalOrders: number", "revenue: number", "growth: number"]
        }
      ],
      "integrations": [
        {
          "service": "supabase",
          "features": ["auth", "database"],
          "env_vars": ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
        }
      ]
    },
    "user_modifications": {
      "added": [],
      "removed": [],
      "modified": []
    }
  }
}
```

**Present decomposition for approval:**

Use AskUserQuestion:

```
Based on your project document, I've identified:

**Pages (2):**
  - Dashboard (/dashboard) - Main user dashboard
  - Orders (/orders) - Order management

**Components (4):**
  - StatCard (display) - Display statistic with trend
  - OrderTable (composite) - Order listing
  - OrderRow (display) - Single order row
  - StatusBadge (display) - Order status indicator

**APIs (3):**
  - user-stats (GET /api/v2/user-stats)
  - orders (GET /api/v2/orders)
  - order-detail (GET /api/v2/orders/[id])

**Data Models (2):**
  - UserStats, Order

**Integrations (1):**
  - Supabase (auth, database)

Is this decomposition correct?
```

Options:
- "Yes, proceed with this plan (Recommended)"
- "Add missing elements"
- "Remove elements"
- "Re-parse document"
- "Skip document, use description instead"

---

## Phase 2: Parse Request

Parse the user's natural language request to identify required elements.

**Note:** If `project_spec.extracted` exists from Phase 1, use it as the primary decomposition source and skip manual parsing.

**Input:** $ARGUMENTS

**Look for:**
- Data requirements (implies APIs)
- UI elements mentioned (implies components)
- Page/route requirements (implies pages)
- Integration patterns (implies combined APIs)

**Output:** Initial decomposition with element types and names.

---

## Phase 3: Decompose Into Workflows

For each identified element, determine:

1. **Element Type:**
   - `api` - Data fetching, external service integration
   - `component` - Reusable UI building block
   - `combined_api` - Aggregation of multiple APIs
   - `page` - Full page with route

2. **Dependencies:**
   - APIs have no dependencies (execute first)
   - Components may depend on APIs (for types)
   - Combined APIs depend on source APIs
   - Pages depend on components and APIs

3. **Execution Order:**
   - Build dependency graph
   - Topological sort for execution order
   - Group into tiers for potential parallelism

**Present decomposition to user:**

```
I've analyzed your request and identified these elements:

APIs (Tier 1):
  - user-stats: User statistics endpoint
  - chart-data: Chart data endpoint

Components (Tier 2):
  - StatCard: Display individual stat (uses user-stats types)
  - ChartWidget: Render chart (uses chart-data types)

Pages (Tier 3):
  - Dashboard: Main dashboard page (uses all components)

Does this look correct?
```

Use AskUserQuestion with options:
- "Yes, proceed with this plan (Recommended)"
- "Add more elements"
- "Remove elements"
- "Let me describe differently"

---

## Phase 4: Orchestrator Interview

Ask HIGH-LEVEL questions that apply to ALL sub-workflows.

**These questions are asked ONCE and shared:**

### Q1: Authentication
"What's the authentication requirement for this feature?"
- Protected (requires login) (Recommended)
- Public (no auth)
- Mixed (specify per element)

### Q2: Error Handling
"How should errors be handled across APIs?"
- Partial success (show what works) (Recommended)
- Fail-fast (one fails = all fail)
- Retry with fallback

### Q3: Brand Guide
"Use project brand guide for styling?"
- Yes, use .claude/BRAND_GUIDE.md (Recommended)
- No, custom theme
- Match existing page

### Q4: Testing Level
"What level of testing?"
- Full TDD (all 14 phases per element) (Recommended)
- Essential tests only
- Smoke tests only

Store all answers in `shared_decisions` - these will be injected into sub-workflows.

---

## Phase 5: Create Orchestration State

Create `.claude/hustle-build-state.json`:

```json
{
  "version": "4.6.0",
  "build_id": "build-[timestamp]-[name]",
  "status": "in_progress",
  "mode": "interactive|auto",
  "created_at": "[ISO timestamp]",

  "request": {
    "original": "[user's original request]",
    "parsed_at": "[timestamp]"
  },

  "project_spec": {
    "source": "file|paste|url|none",
    "file_path": "[optional - path to document]",
    "raw_content": "[document content if provided]",
    "format": "markdown|json|text",
    "parsed_at": "[timestamp]",
    "extracted": {
      "summary": "[AI-generated summary]",
      "pages": [],
      "components": [],
      "apis": [],
      "data_models": [],
      "integrations": []
    }
  },

  "orchestrator_interview": {
    "status": "complete",
    "decisions": {
      "auth_required": true,
      "error_handling": "partial-success",
      "brand_guide": true,
      "testing_level": "full"
    }
  },

  "decomposition": {
    "apis": [
      {"name": "user-stats", "status": "pending", "depends_on": [], "from_project_spec": true}
    ],
    "components": [
      {"name": "StatCard", "status": "pending", "depends_on": ["user-stats"], "from_project_spec": true}
    ],
    "combined_apis": [],
    "pages": [
      {"name": "Dashboard", "status": "pending", "depends_on": ["StatCard"], "from_project_spec": true}
    ]
  },

  "shared_decisions": {
    "auth_required": true,
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "full"
  },

  "active_sub_workflow": null,
  "completed_sub_workflows": []
}
```

**Note:** Elements with `from_project_spec: true` were extracted from the project document. This helps track provenance and allows referencing the original spec during implementation.

---

## Phase 6: Execute Workflows

For each workflow in execution order:

### 6.1 Set Active Workflow

Update state:
```json
"active_sub_workflow": {
  "type": "api",
  "name": "user-stats",
  "workflow_id": "wf-001",
  "started_at": "[timestamp]"
}
```

### 6.2 Invoke Sub-Workflow

The orchestrator hooks will automatically:
1. Inject `shared_decisions` into `api-dev-state.json`
2. Mark workflow as `orchestrated: true`
3. Pass mode (interactive/auto)

Run the appropriate skill:

| Element Type | Skill to Run |
|--------------|--------------|
| api | `/api-create [name]` |
| component | `/hustle-ui-create [name]` |
| combined_api | `/hustle-combine api` |
| page | `/hustle-ui-create-page [name]` |

### 6.3 Sub-Workflow Behavior

When `orchestrated: true`:
- Skip questions answered in `shared_decisions`
- Only ask element-specific questions
- Report completion back to orchestrator

### 6.4 On Completion

The `orchestrator-completion.py` hook will:
1. Mark workflow as complete in state
2. Find next pending workflow
3. Inject context for next workflow

---

## Phase 7: Cross-Workflow Wiring

After all workflows complete, wire them together:

### 7.1 Import Generation

For pages that use components and APIs:

```typescript
// Auto-generated imports based on registry
import { UserStatsResponse } from '@/lib/schemas/user-stats.schema';
import { StatCard } from '@/components/StatCard';
import { ChartWidget } from '@/components/ChartWidget';
```

### 7.2 Prop Wiring

Wire component props to API response types:

```typescript
interface DashboardProps {
  stats: UserStatsResponse;
  chartData: ChartDataResponse;
}
```

### 7.3 Registry Updates

Update `.claude/registry.json` with all created elements and their relationships.

---

## Phase 8: Final Verification

Run comprehensive test suite:

```bash
# Run all API tests
pnpm test src/app/api/v2/[endpoints]

# Run component tests
pnpm test src/components/[components]

# Run page E2E tests
pnpm playwright test src/app/[pages]

# Run integration tests
pnpm test:integration
```

Report results:
- Total tests passed/failed
- Coverage percentage
- Performance metrics

---

## Phase 9: Documentation Rollup

Generate unified documentation:

1. **Feature Doc:** `docs/features/[feature-name].md`
   - Overview from request
   - Architecture diagram
   - API reference links
   - Component guide
   - Testing commands

2. **Registry Updates:**
   - All elements with relationships
   - Execution timeline
   - Decision log

3. **TypeDoc Generation:**
   - Run `pnpm typedoc` for new types

---

## Phase 10: Completion

Mark build as complete:

```json
{
  "status": "complete",
  "completed_at": "[timestamp]",
  "summary": {
    "elements_created": 8,
    "total_tests": 47,
    "tests_passed": 47,
    "duration_minutes": 135
  }
}
```

**Output:**

```
BUILD COMPLETE: [Feature Name]

Created:
  APIs:       3 new + 1 combined
  Components: 3 new
  Pages:      1 new

Quick Links:
  - View page:     /[page-route]
  - API Showcase:  /api-showcase
  - UI Showcase:   /ui-showcase
  - Dashboard:     /hustle-dev-dashboard

Next Steps:
  - /commit - Commit all changes
  - /pr - Create pull request
  - /hustle-build-review [build-id] - Review decisions
```

---

## Auto Mode Behavior (Test Mode)

When `--auto` flag is used, the workflow runs end-to-end without prompts:

```bash
# Full autonomous build - perfect for testing
/hustle-build --auto "photo gallery with search and favorites"

# Autonomous with parallel execution
/hustle-build --auto --parallel "e-commerce checkout flow"
```

### How It Works

1. **No Interactive Questions:**
   - All questions auto-answered with comprehensive defaults
   - Uses `.claude/hustle-build-defaults.json` for overrides
   - Selects "recommended" option for every choice

2. **Error Handling:**
   - Test failures: Retry 3x, then log and continue
   - Verification gaps: Log, continue
   - Missing API keys: Skip element, log warning

3. **Notifications:**
   - Single NTFY notification at completion
   - Includes summary and review link

4. **Logging:**
   - All decisions logged to `.claude/workflow-logs/[build-id].json`
   - Review with `/hustle-build-review [build-id]`

### Customizing Defaults

Copy the template and customize for your project:

```bash
cp templates/hustle-build-defaults.json .claude/hustle-build-defaults.json
```

Then edit `.claude/hustle-build-defaults.json`:

```json
{
  "orchestrator": {
    "auth_required": true,        // Change to false for public APIs
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "essential"  // Change from "full" for faster runs
  },
  "testing": {
    "coverage_threshold": 80,
    "e2e_tests": false           // Skip E2E for faster testing
  }
}
```

### Use Cases

| Scenario | Command |
|----------|---------|
| Full end-to-end test | `/hustle-build --auto "feature"` |
| Quick test (skip E2E) | Edit defaults, then `--auto` |
| CI/CD integration | `/hustle-build --auto --dry-run` first |
| Demo mode | `/hustle-build --auto --parallel` |

---

## Resume Behavior

When `--resume [build-id]` is used:

1. Load state from `.claude/hustle-build-state.json`
2. Find last incomplete workflow
3. Continue from that point
4. Preserve all previous decisions

---

## Dry Run Behavior

When `--dry-run` is used:

1. Parse and decompose request
2. Show execution plan
3. No actual file writes
4. Exit after showing plan

---

## Error Recovery

If a workflow fails:

1. **Retry Logic:**
   - Automatic retry up to 3 times
   - Exponential backoff

2. **Skip and Continue:**
   - If still failing, mark as failed
   - Continue with non-dependent workflows
   - Log for review

3. **Resume Point:**
   - State preserved for `/hustle-build --resume`
   - Can fix issue and continue

---

## Integration Points

### Hooks Used:
- `orchestrator-session-startup.py` - Inject build context
- `orchestrator-handoff.py` - Pass shared decisions
- `orchestrator-completion.py` - Track progress
- `auto-answer.py` - Auto-answer in auto mode
- `ntfy-on-question.py` - Push notifications

### State Files:
- `.claude/hustle-build-state.json` - Orchestration state
- `.claude/api-dev-state.json` - Sub-workflow state
- `.claude/registry.json` - Completed elements

### Log Files:
- `.claude/workflow-logs/[build-id].json` - Build log
- `.claude/workflow-logs/ntfy-log.json` - Notification log

---

## Example Usage

**Interactive:**
```
/hustle-build dashboard page with user stats, activity charts, and notifications
```

**Autonomous:**
```
/hustle-build --auto e-commerce checkout flow with Stripe payments
```

**Resume:**
```
/hustle-build --resume build-2025-12-28-dashboard
```

**Dry Run:**
```
/hustle-build --dry-run blog system with posts, comments, and author profiles
```
