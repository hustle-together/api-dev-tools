# Hustle Build - Master Orchestrator v4.6.0

**Usage:** `/hustle-build [description] [--auto] [--parallel] [--resume] [--dry-run]`

**Purpose:** Build complete features from natural language descriptions. Orchestrates API, Component, Page, and Combined workflows automatically with shared decisions.

## Arguments

- `$ARGUMENTS` - Natural language description of what to build
- `--auto` - Fully autonomous mode, auto-answers questions with comprehensive defaults
- `--parallel` - Run up to 5 Opus agents in parallel (requires worktrees)
- `--resume [id]` - Resume an interrupted build from last checkpoint
- `--dry-run` - Show what would be created without executing
- `--max-iterations [N]` - Max retry iterations per phase (default: 5)
- `--skip-document` - Skip the project document prompt
- `--from-document [path]` - Use specified file as project document (PRD, spec)

---

## Quick Start

```bash
# Simple build
/hustle-build weather dashboard with search and forecast

# With a PRD/spec document
/hustle-build --from-document ./specs/feature.md

# Fully autonomous
/hustle-build --auto e-commerce checkout with cart and payments

# Parallel execution (5 agents)
/hustle-build --parallel dashboard with stats, charts, and user settings
```

---

## 10-Phase Workflow

### Phase 1: Document Intake & Parsing

- Prompts for project document (PRD, spec, requirements)
- Parses document to extract pages, components, APIs
- Builds dependency graph
- User approves decomposition

### Phase 2: Decomposition

- Analyzes request to identify:
  - **APIs** needed (Tier 1 - no dependencies)
  - **Components** needed (Tier 2 - depend on APIs)
  - **Pages** needed (Tier 3 - depend on components)
- Determines execution order based on dependencies

### Phase 3: Orchestrator Interview

- Single interview for shared decisions:
  - Authentication method
  - Error handling strategy
  - Brand guide usage
  - Caching strategy
- Answers propagate to ALL sub-workflows

### Phases 4-6: Sub-Workflow Execution

- Executes each workflow with injected context
- Uses `/api-create` for APIs
- Uses `/hustle-ui-create` for components
- Uses `/hustle-ui-create-page` for pages
- Ralph Wiggum loops ensure quality

### Phase 7: Integration & Wiring

- Connects components to API data
- Wires up state management
- Creates data flow patterns

### Phase 8: Unified Testing

- Runs full test suite across all created elements
- Integration tests for API → Component → Page flow
- Visual regression tests

### Phase 9: Documentation

- Updates registry with all new elements
- Generates API documentation
- Creates component Storybook stories

### Phase 10: Completion

- Final verification
- Commits all changes
- Summary of created elements

---

## Auto Mode (`--auto`)

When `--auto` flag is used:

1. **No Interactive Questions:**
   - All questions auto-answered with comprehensive defaults
   - Uses `.claude/hustle-build-defaults.json` for configured answers
   - Falls back to "most comprehensive" option when no default exists

2. **Default Selections:**
   - Auth: As configured in defaults (typically JWT or API Key)
   - Error Handling: partial-success
   - Brand Guide: enabled
   - Testing: full coverage

3. **Logging:**
   - All decisions logged to `.claude/hustle-build-state.json`
   - Review with `/hustle-build-review [build-id]`

---

## Parallel Execution (`--parallel`)

When `--parallel` flag is used:

1. **Creates git worktrees** for each independent workflow
2. **Spawns up to 5 Opus agents** simultaneously
3. **Injects shared decisions** from interview into each agent
4. **Merges results** when all complete

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL ORCHESTRATOR                        │
├─────────────────────────────────────────────────────────────────┤
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
└─────────────────────────────────────────────────────────────────┘
```

---

## Ralph Wiggum Loops (Self-Terminating)

Each quality gate loops until passing:

| Phase        | Loop Until      | Promise Signal                     |
| ------------ | --------------- | ---------------------------------- |
| TDD Green    | All tests pass  | `<promise>TESTS_PASSING</promise>` |
| Code Review  | Greptile clean  | `<promise>REVIEW_CLEAN</promise>`  |
| Visual QA    | Haiku approves  | `<promise>VISUAL_CLEAN</promise>`  |
| Verification | Docs match code | `<promise>VERIFIED</promise>`      |

---

## State Tracking

All progress tracked in `.claude/hustle-build-state.json`:

```json
{
  "build_id": "weather-dashboard-20231215",
  "status": "in_progress",
  "current_phase": 4,
  "decomposition": {
    "apis": ["weather-current", "weather-forecast"],
    "components": ["SearchBar", "WeatherCard", "ForecastList"],
    "pages": ["WeatherDashboard"]
  },
  "shared_decisions": {
    "auth": "none",
    "error_handling": "partial-success",
    "brand_guide": true
  },
  "completed_workflows": ["weather-current", "weather-forecast"],
  "pending_workflows": ["SearchBar", "WeatherCard"]
}
```

---

## Remote Dashboard

Monitor builds from your phone:

```bash
# Start the dashboard server
python hooks/remote-question-server.py
```

Access at `http://localhost:8765` or `http://YOUR_COMPUTER_IP:8765` on same network.

Features:

- Real-time phase progress
- Answer questions remotely
- Browser notifications for new questions
- Build queue visualization

---

## Examples

### Example 1: Weather Dashboard

```
/hustle-build weather dashboard with city search, current conditions, and 5-day forecast
```

Creates:

- `weather-geocoding` API (Open-Meteo)
- `weather-forecast` API (Open-Meteo)
- `SearchBar` component
- `WeatherCard` component
- `ForecastList` component
- `WeatherDashboard` page

### Example 2: E-commerce Checkout

```
/hustle-build --auto checkout flow with cart summary, payment form, and order confirmation
```

Creates:

- `cart` API
- `payments` API (Stripe)
- `orders` API
- `CartSummary` component
- `PaymentForm` component
- `OrderConfirmation` component
- `CheckoutPage` page

### Example 3: User Dashboard

```
/hustle-build --parallel user dashboard with profile, stats, activity feed, and settings
```

Creates (in parallel):

- `user-profile` API
- `user-stats` API
- `activity-feed` API
- `ProfileCard` component
- `StatsGrid` component
- `ActivityFeed` component
- `SettingsPanel` component
- `DashboardPage` page

---

## See Also

- `/hustle-combine` - Combine existing APIs/components
- `/hustle-ui-create` - Create single component
- `/hustle-ui-create-page` - Create single page
- `/api-create` - Create single API integration
