# Orchestrator Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> Building complex features requires multiple workflows (APIs, components, pages) that depend on each other. Running them manually means answering the same questions repeatedly, managing dependency order yourself, and manually wiring completed elements together.

> **The Solution**
>
> The Orchestrator decomposes natural language requests into workflows, orders them by dependency, shares decisions across all sub-workflows (ask once, apply everywhere), and automatically wires completed elements with proper imports and types.

---

## Table of Contents

- [What Is the Orchestrator?](#what-is-the-orchestrator)
- [The /hustle-build Skill](#the-hustle-build-skill)
- [How Decomposition Works](#how-decomposition-works)
- [Shared Decisions](#shared-decisions)
- [Execution Modes](#execution-modes)
- [Orchestrator Hooks](#orchestrator-hooks)
- [State Management](#state-management)
- [Error Recovery](#error-recovery)

---

## What Is the Orchestrator?

The Orchestrator is a meta-workflow that:

1. **Parses** natural language requests to identify what needs to be built
2. **Decomposes** into individual workflows (API, component, page, combined API)
3. **Orders** workflows by dependency (APIs first, then components, then pages)
4. **Executes** each sub-workflow, passing shared decisions to avoid redundant questions
5. **Wires** completed elements together with proper imports and types
6. **Verifies** everything works together with integration tests

### Why Use the Orchestrator?

| Without Orchestrator                    | With Orchestrator                |
| --------------------------------------- | -------------------------------- |
| Run `/api-create` manually for each API | Single `/hustle-build` command   |
| Answer same questions repeatedly        | Shared decisions asked once      |
| Manual dependency ordering              | Automatic topological sort       |
| Forget to wire components together      | Auto-generates imports and types |
| No unified test run                     | Runs all tests at completion     |

---

## The /hustle-build Skill

The primary entry point for orchestrated builds.

### Usage

```bash
# Interactive mode (default)
/hustle-build dashboard page with user stats, activity charts, and notifications

# Autonomous mode - no questions, uses defaults
/hustle-build --auto e-commerce checkout flow with Stripe payments

# Resume an interrupted build
/hustle-build --resume build-2025-12-28-dashboard

# Preview without executing
/hustle-build --dry-run blog system with posts and comments
```

### Arguments

| Argument        | Description                                       |
| --------------- | ------------------------------------------------- |
| `[description]` | Natural language description of what to build     |
| `--auto`        | Fully autonomous mode, auto-answers all questions |
| `--resume [id]` | Resume an interrupted build by ID                 |
| `--dry-run`     | Show decomposition plan without executing         |

### Example

```bash
/hustle-build weather dashboard with current conditions, forecast chart, and location search
```

This decomposes into:

```
APIs (Tier 1):
  - geocoding: Convert location to coordinates
  - weather-current: Get current conditions
  - weather-forecast: Get 5-day forecast

Components (Tier 2):
  - LocationSearch: Search input with autocomplete (uses geocoding)
  - CurrentWeather: Display current conditions (uses weather-current)
  - ForecastChart: Display forecast chart (uses weather-forecast)

Pages (Tier 3):
  - WeatherDashboard: Main page (uses all components)
```

---

## How Decomposition Works

### Step 1: Parse Request

The orchestrator analyzes natural language for:

| Pattern                                      | Implies               |
| -------------------------------------------- | --------------------- |
| "get data from...", "fetch...", "API for..." | API workflow          |
| "button", "card", "widget", "input"          | Component workflow    |
| "page", "route", "dashboard", "view"         | Page workflow         |
| "combine", "orchestrate", "aggregate"        | Combined API workflow |

### Step 2: Build Dependency Graph

```
┌─────────────────────────────────────────────┐
│               Dependency Graph               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ API: geo │  │ API: wx  │  │ API: fc  │   │ Tier 1 (no deps)
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │         │
│       ▼             ▼             ▼         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Comp:    │  │ Comp:    │  │ Comp:    │   │ Tier 2 (depends on APIs)
│  │ Search   │  │ Current  │  │ Chart    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │         │
│       └─────────────┼─────────────┘         │
│                     ▼                       │
│              ┌──────────┐                   │
│              │ Page:    │                   │ Tier 3 (depends on components)
│              │Dashboard │                   │
│              └──────────┘                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 3: Topological Sort

Workflows are ordered so dependencies complete first:

1. All APIs (parallel if possible)
2. All components (parallel if possible)
3. Combined APIs (depend on source APIs)
4. All pages (depend on components)

---

## Shared Decisions

The orchestrator asks high-level questions **once** and shares answers across all sub-workflows.

### Orchestrator Interview Questions

| Question       | Options                             | Applied To           |
| -------------- | ----------------------------------- | -------------------- |
| Authentication | Protected / Public / Mixed          | All API routes       |
| Error Handling | Partial success / Fail-fast / Retry | All error boundaries |
| Brand Guide    | Use .claude/BRAND_GUIDE.md / Custom | All components       |
| Testing Level  | Full TDD / Essential / Smoke        | All test phases      |

### How Sharing Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Orchestrator Interview                    │
│                                                             │
│  Q: "Authentication?"  → Answer: "Protected"                │
│  Q: "Error handling?"  → Answer: "Partial success"          │
│  Q: "Brand guide?"     → Answer: "Yes"                      │
│  Q: "Testing level?"   → Answer: "Full TDD"                 │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │       shared_decisions       │
            │  {                           │
            │    "auth_required": true,    │
            │    "error_handling": "...",  │
            │    "brand_guide": true,      │
            │    "testing_level": "full"   │
            │  }                           │
            └──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ API     │       │Component│       │ Page    │
   │Workflow │       │Workflow │       │Workflow │
   │         │       │         │       │         │
   │ Skips   │       │ Skips   │       │ Skips   │
   │ auth Q  │       │ brand Q │       │ test Q  │
   └─────────┘       └─────────┘       └─────────┘
```

Sub-workflows receive `shared_decisions` and skip those questions, only asking workflow-specific questions.

---

## Execution Modes

### Interactive Mode (Default)

- Asks clarifying questions at each decision point
- Waits for user confirmation on decomposition
- Presents each interview question
- Pauses on errors for user decision

### Auto Mode (`--auto`)

- Uses smart defaults for all decisions
- Reads overrides from `.claude/hustle-build-defaults.json`
- Continues on errors (logs and proceeds)
- Sends single NTFY notification at completion

**Default Values in Auto Mode:**

```json
{
  "auth_required": true,
  "error_handling": "partial-success",
  "brand_guide": true,
  "testing_level": "essential"
}
```

### Dry Run Mode (`--dry-run`)

- Shows decomposition plan
- Lists all workflows that would be created
- Shows dependency order
- No file writes occur

---

## Orchestrator Hooks

Three hooks manage orchestration state across sub-workflows:

### orchestrator-session-startup.py

**Type:** SessionStart
**Purpose:** Inject build context at session start

When a session starts with an active build:

- Injects current progress (X/Y workflows complete)
- Shows active workflow name
- Lists remaining workflows
- Displays shared decisions

### orchestrator-handoff.py

**Type:** PreToolUse (Skill)
**Purpose:** Pass shared decisions to sub-workflows

When a workflow skill is invoked:

- Checks if build is in progress
- Injects `shared_decisions` into `api-dev-state.json`
- Marks workflow as `orchestrated: true`
- Sets mode (interactive/auto)
- Logs handoff event

### orchestrator-completion.py

**Type:** PostToolUse (Skill)
**Purpose:** Track progress and trigger next workflow

When a workflow skill completes:

- Marks workflow as complete
- Finds next pending workflow with satisfied dependencies
- Updates active workflow
- Sends progress notifications
- Triggers build completion when all done

---

## State Management

### Build State File

`.claude/hustle-build-state.json`:

```json
{
  "version": "4.0.0",
  "build_id": "build-2025-12-29-weather-dashboard",
  "status": "in_progress",
  "mode": "interactive",
  "created_at": "2025-12-29T10:00:00Z",

  "request": {
    "original": "weather dashboard with current conditions and forecast",
    "parsed_at": "2025-12-29T10:00:05Z"
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
      { "name": "weather-current", "status": "complete", "depends_on": [] },
      { "name": "weather-forecast", "status": "in_progress", "depends_on": [] }
    ],
    "components": [
      {
        "name": "CurrentWeather",
        "status": "pending",
        "depends_on": ["weather-current"]
      },
      {
        "name": "ForecastChart",
        "status": "pending",
        "depends_on": ["weather-forecast"]
      }
    ],
    "combined_apis": [],
    "pages": [
      {
        "name": "WeatherDashboard",
        "status": "pending",
        "depends_on": ["CurrentWeather", "ForecastChart"]
      }
    ]
  },

  "shared_decisions": {
    "auth_required": true,
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "full"
  },

  "active_sub_workflow": {
    "type": "api",
    "name": "weather-forecast",
    "workflow_id": "wf-002",
    "started_at": "2025-12-29T10:30:00Z"
  },

  "completed_sub_workflows": [
    {
      "type": "api",
      "name": "weather-current",
      "completed_at": "2025-12-29T10:25:00Z"
    }
  ]
}
```

### Workflow Logs

`.claude/workflow-logs/[build-id].json`:

```json
{
  "handoffs": [
    {
      "timestamp": "2025-12-29T10:05:00Z",
      "skill": "api-create",
      "shared_decisions_applied": ["auth_required", "error_handling"],
      "mode": "interactive"
    }
  ],
  "events": [
    { "type": "decomposition_approved", "timestamp": "..." },
    {
      "type": "workflow_complete",
      "name": "weather-current",
      "timestamp": "..."
    }
  ]
}
```

---

## Error Recovery

### Automatic Retry

When a workflow fails:

1. Retry up to 3 times with exponential backoff
2. If still failing, mark as `failed`
3. Continue with non-dependent workflows
4. Log failure for review

### Resume Interrupted Builds

```bash
# List all builds
ls .claude/workflow-logs/

# Resume specific build
/hustle-build --resume build-2025-12-29-weather
```

Resume behavior:

1. Loads state from `.claude/hustle-build-state.json`
2. Finds last incomplete workflow
3. Continues from that point
4. Preserves all previous decisions

### Manual Recovery

If automatic retry fails:

1. Fix the underlying issue (missing API key, syntax error, etc.)
2. Run `/hustle-build --resume [build-id]`
3. Orchestrator continues from failed workflow

---

## Integration Points

### Related Skills

| Skill                    | Relationship                        |
| ------------------------ | ----------------------------------- |
| `/api-create`            | Invoked for each API workflow       |
| `/hustle-ui-create`      | Invoked for each component workflow |
| `/hustle-ui-create-page` | Invoked for each page workflow      |
| `/hustle-combine`        | Invoked for combined API workflows  |
| `/hustle-build-review`   | Review build decisions and results  |

### Related State Files

| File                                 | Purpose                     |
| ------------------------------------ | --------------------------- |
| `.claude/hustle-build-state.json`    | Orchestration state         |
| `.claude/api-dev-state.json`         | Sub-workflow state          |
| `.claude/registry.json`              | Completed elements registry |
| `.claude/hustle-build-defaults.json` | Auto mode defaults          |

---

## Best Practices

1. **Start Simple** - Begin with interactive mode to understand the workflow
2. **Use Dry Run** - Preview complex builds before executing
3. **Check Progress** - Watch the todo list and progress indicators
4. **Review After** - Use `/hustle-build-review` to audit decisions
5. **Commit Often** - Run `/commit` after each successful build

---

## See Also

- [SKILLS.md](./SKILLS.md) - All slash command reference
- [HOOKS.md](./HOOKS.md) - All enforcement hooks
- [AGENTS.md](./AGENTS.md) - Specialized agent reference
- [PLUGIN_ARCHITECTURE.md](./PLUGIN_ARCHITECTURE.md) - How the plugin system works
