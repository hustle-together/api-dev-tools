---
name: hustle-build-review
description: Review auto-build results, decisions, and logs. Analyze what happened during a /hustle-build execution.
license: MIT
compatibility: Requires Claude Code with hooks configured
metadata:
  version: "4.0.0"
  category: "review"
  tags: ["review", "audit", "analysis", "auto-mode"]
  author: "Hustle Together"
allowed-tools: Read Glob Grep WebFetch AskUserQuestion TodoWrite
---

# Hustle Build Review - Auto-Build Analysis

Review and analyze the results of a `/hustle-build` execution. Essential for understanding what decisions were made in auto-mode and identifying areas for improvement.

## Usage

```
/hustle-build-review [build-id]
/hustle-build-review --latest
/hustle-build-review --list
```

## Arguments

- `$ARGUMENTS` - Build ID to review (e.g., `build-2025-12-28-dashboard`)
- `--latest` - Review the most recent build
- `--list` - List all available build logs

---

## Phase 1: Load Build Data

### 1.1 Find Build Log

If `--list`:

```bash
ls -la .claude/workflow-logs/build-*.json
```

Display table:

```
Available Builds:
| Build ID                    | Date       | Status   | Elements |
|-----------------------------|------------|----------|----------|
| build-2025-12-28-dashboard  | 2025-12-28 | complete | 8        |
| build-2025-12-27-checkout   | 2025-12-27 | complete | 5        |
| build-2025-12-26-auth       | 2025-12-26 | failed   | 3        |
```

If `--latest`:

- Find most recent `build-*.json` file
- Load that build ID

### 1.2 Load Files

Load from `.claude/`:

- `hustle-build-state.json` - Orchestration state
- `workflow-logs/[build-id].json` - Detailed log
- `registry.json` - Created elements

---

## Phase 2: Executive Summary

Present high-level overview:

```
BUILD REVIEW: [Build ID]
============================================================

Status:     [complete/failed/interrupted]
Duration:   [X minutes]
Mode:       [interactive/auto]

CREATED:
  APIs:       X new + Y combined
  Components: X new
  Pages:      X new

TESTS:
  Total:      X tests
  Passed:     X (XX%)
  Failed:     X

DECISIONS:
  Total Questions:  X
  Auto-Answered:    X (if auto mode)
  User-Answered:    X

============================================================
```

---

## Phase 3: Decision Audit

### 3.1 Orchestrator Decisions

Show high-level decisions from orchestrator interview:

```
ORCHESTRATOR DECISIONS
----------------------

Q1: Authentication
    Answer:   Protected (requires login)
    Source:   [user | auto-comprehensive | default]
    Applied:  All 8 elements

Q2: Error Handling
    Answer:   Partial success
    Source:   [user | auto-comprehensive | default]
    Applied:  Combined API, individual APIs

Q3: Brand Guide
    Answer:   Yes, use BRAND_GUIDE.md
    Source:   [user | auto-comprehensive | default]
    Applied:  All components, page

Q4: Testing Level
    Answer:   Full TDD (all 14 phases)
    Source:   [user | auto-comprehensive | default]
    Applied:  All elements
```

### 3.2 Per-Element Decisions

For each element, show workflow-specific decisions:

```
ELEMENT: user-stats (API)
-------------------------

Interview Questions:
  Q: "Which stats to include?"
     Answer:   Comprehensive (all available)
     Source:   auto-comprehensive
     Reason:   "Selected most comprehensive option"

  Q: "Rate limiting?"
     Answer:   Yes, 100 req/min
     Source:   default (hustle-build-defaults.json)

  Q: "Caching strategy?"
     Answer:   Individual (per-endpoint)
     Source:   shared_decisions (orchestrator)

Would you have answered differently? [View code to adjust]
```

### 3.3 Decision Summary Table

```
DECISION SUMMARY
----------------

| Element      | Questions | Auto | User | Default | Shared |
|--------------|-----------|------|------|---------|--------|
| user-stats   | 3         | 1    | 0    | 1       | 1      |
| chart-data   | 3         | 2    | 0    | 0       | 1      |
| StatCard     | 4         | 3    | 0    | 0       | 1      |
| Dashboard    | 2         | 1    | 0    | 0       | 1      |
| TOTAL        | 12        | 7    | 0    | 1       | 4      |
```

---

## Phase 4: Workflow Analysis

### 4.1 Execution Timeline

Show how workflows executed:

```
EXECUTION TIMELINE
------------------

10:00:00  BUILD START
10:00:15  Orchestrator interview complete (4 questions)

TIER 1 (APIs - parallel eligible):
10:00:30  [api] user-stats      START
10:08:45  [api] user-stats      COMPLETE (8m 15s, 4 tests)
10:08:50  [api] chart-data      START
10:17:22  [api] chart-data      COMPLETE (8m 32s, 4 tests)
10:17:25  [api] dashboard-metrics START
10:25:40  [api] dashboard-metrics COMPLETE (8m 15s, 4 tests)

TIER 2 (Combined API):
10:25:45  [combined] dashboard-data START
10:38:20  [combined] dashboard-data COMPLETE (12m 35s, 8 tests)

TIER 3 (Components):
10:38:25  [component] StatCard    START
10:50:10  [component] StatCard    COMPLETE (11m 45s, 5 tests)
10:50:15  [component] ChartWidget START
11:02:30  [component] ChartWidget COMPLETE (12m 15s, 5 tests)

TIER 4 (Page):
11:02:35  [page] Dashboard        START
11:22:50  [page] Dashboard        COMPLETE (20m 15s, 17 tests)

11:23:00  Cross-workflow wiring
11:25:00  Final verification (47 tests)
11:26:30  Documentation rollup

11:27:00  BUILD COMPLETE

Total Duration: 87 minutes
```

### 4.2 Per-Element Details

For each element, show:

```
ELEMENT DETAIL: user-stats (API)
================================

Phases Completed: 14/14
Duration: 8m 15s
Tests: 4 passed, 0 failed

Files Created:
  - src/app/api/v2/user-stats/route.ts
  - src/lib/schemas/user-stats.schema.ts
  - src/app/api/v2/user-stats/__tests__/route.test.ts

Registry Entry:
  {
    "name": "user-stats",
    "type": "api",
    "path": "/api/v2/user-stats",
    "schema": "src/lib/schemas/user-stats.schema.ts",
    "exportedTypes": ["UserStatsResponse", "UserStatsParams"]
  }

Research Sources:
  - Context7: /supabase/supabase (user stats patterns)
  - WebSearch: "user statistics API best practices 2025"
```

---

## Phase 5: Issues & Resolutions

### 5.1 Issues Encountered

```
ISSUES ENCOUNTERED
------------------

Issue #1:
  Workflow:   chart-data
  Phase:      TDD Green (Phase 9)
  Problem:    Test failed on first attempt
  Error:      "TypeError: chartType is not defined"

  Resolution: Retried, passed on attempt 2
  Auto-fix:   Yes (retry logic)

  Code diff:
  - const type = chartType;
  + const type = params.chartType ?? 'line';

Issue #2:
  Workflow:   Dashboard (page)
  Phase:      Verification (Phase 10)
  Problem:    Missing loading state

  Resolution: Added Suspense boundary
  Auto-fix:   Yes (verification loop)

  Code added:
  + <Suspense fallback={<DashboardSkeleton />}>
```

### 5.2 Unresolved Issues

If any:

```
UNRESOLVED ISSUES
-----------------

Issue #1:
  Workflow:   ChartWidget
  Phase:      Code Review (Phase 11)
  Problem:    "Consider adding aria-label for accessibility"
  Status:     Logged for future improvement

  Recommended action:
  Edit src/components/ChartWidget/ChartWidget.tsx
  Add: aria-label={`${chartType} chart showing ${dataLabel}`}
```

---

## Phase 6: Test Results

### 6.1 Test Summary

```
TEST RESULTS
------------

Unit Tests:
  src/app/api/v2/user-stats/__tests__/route.test.ts    4/4  PASS
  src/app/api/v2/chart-data/__tests__/route.test.ts    4/4  PASS
  src/app/api/v2/dashboard-data/__tests__/route.test.ts 8/8  PASS
  src/components/StatCard/__tests__/StatCard.test.ts   5/5  PASS
  src/components/ChartWidget/__tests__/ChartWidget.test.ts 5/5 PASS

E2E Tests:
  e2e/dashboard.spec.ts                                12/12 PASS

Integration Tests:
  src/app/dashboard/__tests__/page.test.ts             9/9  PASS

TOTAL: 47/47 tests passing (100%)
Coverage: 94%
```

### 6.2 Coverage Breakdown

```
COVERAGE BY ELEMENT
-------------------

| Element          | Statements | Branches | Functions | Lines |
|------------------|------------|----------|-----------|-------|
| user-stats       | 98%        | 95%      | 100%      | 98%   |
| chart-data       | 96%        | 92%      | 100%      | 96%   |
| dashboard-data   | 94%        | 90%      | 100%      | 94%   |
| StatCard         | 100%       | 100%     | 100%      | 100%  |
| ChartWidget      | 92%        | 88%      | 100%      | 92%   |
| Dashboard page   | 89%        | 85%      | 100%      | 89%   |
```

---

## Phase 7: Registry Impact

### 7.1 Elements Added

```
REGISTRY ADDITIONS
------------------

APIs (3 new):
  apis.user-stats
  apis.chart-data
  apis.dashboard-metrics

Combined APIs (1 new):
  combined.dashboard-data
    Sources: [user-stats, chart-data, dashboard-metrics]

Components (2 new):
  components.StatCard
  components.ChartWidget

Pages (1 new):
  pages.Dashboard
    Route: /dashboard
    Components: [StatCard, ChartWidget]
    Data: dashboard-data

Type Exports (8 new):
  UserStatsResponse, UserStatsParams
  ChartDataResponse, ChartDataParams
  DashboardMetricsResponse
  DashboardDataResponse
  StatCardProps
  ChartWidgetProps
```

### 7.2 Relationships

```
DEPENDENCY GRAPH
----------------

dashboard-data (combined)
├── user-stats (api)
├── chart-data (api)
└── dashboard-metrics (api)

Dashboard (page)
├── StatCard (component)
│   └── uses: UserStatsResponse
├── ChartWidget (component)
│   └── uses: ChartDataResponse
└── fetches: dashboard-data
```

---

## Phase 8: Recommendations

Based on the build analysis:

### 8.1 Auto-Mode Tuning

If decisions seem suboptimal:

```
RECOMMENDED DEFAULT CHANGES
---------------------------

Based on this build, consider updating .claude/hustle-build-defaults.json:

{
  "component": {
-   "all_variants": true,
+   "all_variants": false,  // Only 2 variants used in practice

-   "animations": true,
+   "animations": false,    // Animations not used in dashboard
  }
}
```

### 8.2 Future Improvements

```
SUGGESTED IMPROVEMENTS
----------------------

1. StatCard could benefit from skeleton loading state
   File: src/components/StatCard/StatCard.tsx

2. ChartWidget accessibility could be improved
   Add: aria-label, role="img"

3. Dashboard page could use error boundary
   Currently: No error boundary
   Suggested: Add ErrorBoundary component
```

---

## Phase 9: Actions

Offer next steps:

```
AVAILABLE ACTIONS
-----------------

1. View specific element details:
   /hustle-build-review [build-id] --element user-stats

2. Re-run with different decisions:
   /hustle-build --resume [build-id] --interactive

3. Apply recommended improvements:
   /hustle-build-improve [build-id]

4. Export review as markdown:
   /hustle-build-review [build-id] --export

5. Compare with previous build:
   /hustle-build-review --compare [build-id-1] [build-id-2]
```

Ask user:

```
What would you like to do?
- View more details on a specific element
- Apply recommended changes
- Export this review
- Return to development
```

---

## Output Format

Final summary displayed:

```
============================================================
BUILD REVIEW COMPLETE: [build-id]
============================================================

Key Metrics:
  - 8 elements created
  - 47 tests passing (100%)
  - 94% code coverage
  - 87 minute build time

Decision Quality:
  - 7/12 questions auto-answered
  - 1 issue auto-resolved
  - 0 unresolved issues

Recommendations:
  - 2 optional improvements identified
  - 1 default setting could be tuned

Review exported to: docs/reviews/[build-id].md
============================================================
```

---

## Integration with Other Skills

This skill integrates with:

- `/hustle-build --resume [id]` - Resume interrupted build
- `/api-create-review [id]` - Review single API workflow
- `/hustle-ui-create-review [id]` - Review single component workflow
- `/commit` - Commit after review approval
