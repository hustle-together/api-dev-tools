---
name: hustle-build
description: Build complete features from natural language. Orchestrates API, component, page, and combined workflows automatically.
license: MIT
compatibility: Requires Claude Code with hooks and MCP servers configured
metadata:
  version: "4.0.0"
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
/hustle-build --resume [build-id]
/hustle-build --dry-run [description]
```

## Arguments

- `$ARGUMENTS` - Natural language description of what to build
- `--auto` - Fully autonomous mode, auto-answers questions
- `--resume [id]` - Resume an interrupted build
- `--dry-run` - Show what would be created without executing

---

## Phase 1: Parse Request

Parse the user's natural language request to identify required elements.

**Input:** $ARGUMENTS

**Look for:**
- Data requirements (implies APIs)
- UI elements mentioned (implies components)
- Page/route requirements (implies pages)
- Integration patterns (implies combined APIs)

**Output:** Initial decomposition with element types and names.

---

## Phase 2: Decompose Into Workflows

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
- "Yes, proceed with this plan"
- "Add more elements"
- "Remove elements"
- "Let me describe differently"

---

## Phase 3: Orchestrator Interview

Ask HIGH-LEVEL questions that apply to ALL sub-workflows.

**These questions are asked ONCE and shared:**

### Q1: Authentication
"What's the authentication requirement for this feature?"
- Protected (requires login) - DEFAULT
- Public (no auth)
- Mixed (specify per element)

### Q2: Error Handling
"How should errors be handled across APIs?"
- Partial success (show what works) - DEFAULT
- Fail-fast (one fails = all fail)
- Retry with fallback

### Q3: Brand Guide
"Use project brand guide for styling?"
- Yes, use .claude/BRAND_GUIDE.md - DEFAULT
- No, custom theme
- Match existing page

### Q4: Testing Level
"What level of testing?"
- Full TDD (all 14 phases per element) - DEFAULT
- Essential tests only
- Smoke tests only

Store all answers in `shared_decisions` - these will be injected into sub-workflows.

---

## Phase 4: Create Orchestration State

Create `.claude/hustle-build-state.json`:

```json
{
  "version": "4.0.0",
  "build_id": "build-[timestamp]-[name]",
  "status": "in_progress",
  "mode": "interactive|auto",
  "created_at": "[ISO timestamp]",

  "request": {
    "original": "[user's original request]",
    "parsed_at": "[timestamp]"
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
      {"name": "user-stats", "status": "pending", "depends_on": []}
    ],
    "components": [
      {"name": "StatCard", "status": "pending", "depends_on": ["user-stats"]}
    ],
    "combined_apis": [],
    "pages": [
      {"name": "Dashboard", "status": "pending", "depends_on": ["StatCard"]}
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

---

## Phase 5: Execute Workflows

For each workflow in execution order:

### 5.1 Set Active Workflow

Update state:
```json
"active_sub_workflow": {
  "type": "api",
  "name": "user-stats",
  "workflow_id": "wf-001",
  "started_at": "[timestamp]"
}
```

### 5.2 Invoke Sub-Workflow

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

### 5.3 Sub-Workflow Behavior

When `orchestrated: true`:
- Skip questions answered in `shared_decisions`
- Only ask element-specific questions
- Report completion back to orchestrator

### 5.4 On Completion

The `orchestrator-completion.py` hook will:
1. Mark workflow as complete in state
2. Find next pending workflow
3. Inject context for next workflow

---

## Phase 6: Cross-Workflow Wiring

After all workflows complete, wire them together:

### 6.1 Import Generation

For pages that use components and APIs:

```typescript
// Auto-generated imports based on registry
import { UserStatsResponse } from '@/lib/schemas/user-stats.schema';
import { StatCard } from '@/components/StatCard';
import { ChartWidget } from '@/components/ChartWidget';
```

### 6.2 Prop Wiring

Wire component props to API response types:

```typescript
interface DashboardProps {
  stats: UserStatsResponse;
  chartData: ChartDataResponse;
}
```

### 6.3 Registry Updates

Update `.claude/registry.json` with all created elements and their relationships.

---

## Phase 7: Final Verification

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

## Phase 8: Documentation Rollup

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

## Phase 9: Completion

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

## Auto Mode Behavior

When `--auto` flag is used:

1. **No Interactive Questions:**
   - All questions auto-answered with comprehensive defaults
   - Uses `.claude/hustle-build-defaults.json` for overrides

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
