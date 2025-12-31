# Parallel Autonomous Workflow Architecture

> **Version:** 4.5.0
> **Status:** Implemented
> **Last Updated:** 2025-12-30

## Overview

The Hustle Dev Tools support **up to 5 Opus agents running in parallel** across different workflows. This enables rapid development where multiple APIs, components, and pages are built simultaneously.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATOR (/hustle-build)                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    SHARED CONTEXT (from Interview)                   │    │
│  │  • Error handling style: try-catch-rethrow                          │    │
│  │  • Authentication: JWT                                               │    │
│  │  • Logging: standard                                                 │    │
│  │  • API versioning: url-prefix                                        │    │
│  │  • Styling: tailwind                                                 │    │
│  │  • Brand Guide: .claude/BRAND_GUIDE.md                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                    ┌───────────────┼───────────────┐                        │
│                    ▼               ▼               ▼                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  OPUS AGENT #1   │  │  OPUS AGENT #2   │  │  OPUS AGENT #3   │          │
│  │  /api-create     │  │  /api-create     │  │  /hustle-ui      │          │
│  │  unsplash        │  │  stripe          │  │  PhotoGrid       │          │
│  │                  │  │                  │  │                  │          │
│  │  Worktree:       │  │  Worktree:       │  │  Worktree:       │          │
│  │  feature/api-1   │  │  feature/api-2   │  │  feature/ui-1    │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        MERGE COORDINATOR                             │    │
│  │  • Waits for all agents to complete                                 │    │
│  │  • Resolves conflicts in registry.json                              │    │
│  │  • Creates combined PR or merges sequentially                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Workflow Phases

### Phase 1: Orchestrator Interview (REQUIRES USER INPUT)

The orchestrator collects shared decisions that apply to ALL sub-workflows:

```
═══════════════════════════════════════════════════════════════════
                    HUSTLE BUILD ORCHESTRATOR
═══════════════════════════════════════════════════════════════════

I'll be creating multiple APIs and components in parallel.
First, let me ask a few questions that apply to ALL of them:

┌─ Error Handling ───────────────────────────────────────────────┐
│ How should errors be handled across all endpoints?             │
│                                                                │
│ [1] try-catch-rethrow (Recommended)                           │
│ [2] Error boundary pattern                                     │
│ [3] Result type (Ok/Err)                                       │
│ [4] Error codes enum                                           │
└────────────────────────────────────────────────────────────────┘

┌─ Authentication ───────────────────────────────────────────────┐
│ What authentication method should APIs use?                    │
│                                                                │
│ [1] JWT tokens (Recommended)                                   │
│ [2] Session-based                                              │
│ [3] API keys                                                   │
│ [4] OAuth                                                      │
│ [5] None (public APIs)                                         │
└────────────────────────────────────────────────────────────────┘

... (continues for logging, versioning, styling, testing)
═══════════════════════════════════════════════════════════════════
```

These answers are saved to `registry.json` under `orchestrator_defaults`:

```json
{
  "orchestrator_defaults": {
    "error_handling": { "style": "try-catch-rethrow" },
    "authentication": { "method": "jwt" },
    "logging": { "level": "standard" },
    "api_versioning": { "strategy": "url-prefix" },
    "styling": { "approach": "tailwind" }
  }
}
```

### Phase 2: Task Decomposition (AUTONOMOUS)

Orchestrator analyzes the request and creates task list:

```
═══════════════════════════════════════════════════════════════════
                    TASK DECOMPOSITION
═══════════════════════════════════════════════════════════════════

Request: "Build a photo gallery app with Unsplash, payments, and sharing"

Identified Tasks:
  API #1: /api/v2/unsplash (search, download, collections)
  API #2: /api/v2/stripe (checkout, subscriptions)
  API #3: /api/v2/share (generate links, track views)

  Component #1: PhotoGrid (masonry layout, infinite scroll)
  Component #2: PhotoModal (full view, download, share)
  Component #3: PaymentForm (Stripe Elements)

  Page #1: /gallery (main gallery view)
  Page #2: /photo/[id] (single photo page)
  Page #3: /checkout (payment flow)

Parallel Execution Plan:
  Batch 1 (3 agents): API #1, API #2, API #3
  Batch 2 (3 agents): Component #1, Component #2, Component #3
  Batch 3 (3 agents): Page #1, Page #2, Page #3

Total estimated: 3 batches × ~15 min = ~45 min
(vs sequential: 9 tasks × ~15 min = ~2+ hours)
═══════════════════════════════════════════════════════════════════
```

### Phase 3: Parallel Agent Spawn (AUTONOMOUS)

Each agent runs in its own git worktree:

```bash
# Agent #1 setup
git worktree add ../project-api-unsplash feature/api-unsplash
cd ../project-api-unsplash
# Inject shared context
# Run /api-create unsplash autonomously

# Agent #2 setup (parallel)
git worktree add ../project-api-stripe feature/api-stripe
cd ../project-api-stripe
# Inject shared context
# Run /api-create stripe autonomously

# Agent #3 setup (parallel)
git worktree add ../project-api-share feature/api-share
cd ../project-api-share
# Inject shared context
# Run /api-create share autonomously
```

### Phase 4: Autonomous Execution Loop (PER AGENT)

Each agent runs the full 14-phase workflow autonomously:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT AUTONOMOUS LOOP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │   START     │                                               │
│  └──────┬──────┘                                               │
│         ▼                                                       │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │ Phase 1-2:      │────▶│ Phase 3:        │                   │
│  │ Disambiguation  │     │ Initial Research│                   │
│  │ & Scope         │     │ (Context7 +     │                   │
│  │ (Auto if clear) │     │  WebSearch)     │                   │
│  └─────────────────┘     └────────┬────────┘                   │
│                                   ▼                             │
│                          ┌─────────────────┐                   │
│                          │ Phase 4:        │                   │
│                          │ Interview       │◀─┐                │
│                          │ (SKIP - uses    │  │                │
│                          │ orchestrator    │  │                │
│                          │ defaults)       │  │                │
│                          └────────┬────────┘  │                │
│                                   ▼           │                │
│                          ┌─────────────────┐  │                │
│                          │ Phase 5:        │  │                │
│                          │ Deep Research   │  │                │
│                          │ (if needed)     │  │                │
│                          └────────┬────────┘  │                │
│                                   ▼           │                │
│         ┌────────────────────────────────────────────┐         │
│         │              IMPLEMENTATION LOOP            │         │
│         │  ┌─────────────────────────────────────┐   │         │
│         │  │                                     │   │         │
│         │  ▼                                     │   │         │
│         │  Phase 6: Schema ──▶ Phase 7: Env ──┐ │   │         │
│         │                                     │ │   │         │
│         │  ┌──────────────────────────────────┘ │   │         │
│         │  ▼                                     │   │         │
│         │  Phase 8: TDD Red ──▶ Phase 9: Green  │   │         │
│         │         │                    │        │   │         │
│         │         │         ┌──────────┘        │   │         │
│         │         │         ▼                   │   │         │
│         │         │  ┌─────────────┐            │   │         │
│         │         │  │ Tests Pass? │            │   │         │
│         │         │  └──────┬──────┘            │   │         │
│         │         │         │                   │   │         │
│         │         │    NO ◀─┴─▶ YES             │   │         │
│         │         │    │         │              │   │         │
│         │         └────┘         ▼              │   │         │
│         │              Phase 10: Verify ────────┤   │         │
│         │                       │               │   │         │
│         │                  NO ◀─┴─▶ YES         │   │         │
│         │                  │         │          │   │         │
│         │    ┌─────────────┘         ▼          │   │         │
│         │    │            Phase 11: Code Review │   │         │
│         │    │                       │          │   │         │
│         │    │            Phase 12: Refactor    │   │         │
│         │    │                       │          │   │         │
│         │    │            Tests Pass?           │   │         │
│         │    │            NO ◀─┴─▶ YES          │   │         │
│         │    └───────────────┘      │           │   │         │
│         │                           ▼           │   │         │
│         │              Phase 13: Documentation  │   │         │
│         │                           │           │   │         │
│         │              Phase 14: Completion     │   │         │
│         └───────────────────────────────────────┘   │         │
│                                   │                             │
│                                   ▼                             │
│                          ┌─────────────────┐                   │
│                          │ Report to       │                   │
│                          │ Orchestrator    │                   │
│                          └─────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 5: Merge Coordination (AUTONOMOUS)

When all agents complete, the orchestrator merges:

```
═══════════════════════════════════════════════════════════════════
                    MERGE COORDINATION
═══════════════════════════════════════════════════════════════════

All 3 agents completed successfully!

Agent #1 (unsplash): ✅ Complete
  • Files: src/app/api/v2/unsplash/route.ts, schemas, tests
  • Registry entries: 1 API, 3 routes, 2 env_vars

Agent #2 (stripe): ✅ Complete
  • Files: src/app/api/v2/stripe/route.ts, schemas, tests
  • Registry entries: 1 API, 4 routes, 3 env_vars, 1 webhook

Agent #3 (share): ✅ Complete
  • Files: src/app/api/v2/share/route.ts, schemas, tests
  • Registry entries: 1 API, 2 routes, 1 env_var

Merging registries...
  • Combining 3 API entries
  • Combining 9 route entries
  • Combining 6 env_var entries
  • No conflicts detected ✅

Creating combined PR...
  PR #47: "feat: Add photo gallery APIs (unsplash, stripe, share)"

═══════════════════════════════════════════════════════════════════
```

## Max Iterations Flag

To prevent infinite loops, each phase has a max iteration count:

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

If max iterations reached:
1. Log the issue to `session_archives.interrupted`
2. Create a partial PR with work completed
3. Notify user via NTFY
4. Continue with other agents

## Agent Configuration

```typescript
interface ParallelAgentConfig {
  maxAgents: 5;              // Hard limit
  worktreePrefix: string;    // e.g., "feature/"
  sharedContext: {
    orchestratorDefaults: OrchestratorDefaults;
    brandGuide: BrandGuide;
    registryPath: string;
  };
  timeouts: {
    perPhase: 300000;        // 5 min per phase
    totalWorkflow: 1800000;  // 30 min total
  };
  onComplete: "merge" | "pr" | "wait";
  onFailure: "continue" | "abort-all" | "notify";
}
```

## Usage

### Full Parallel Build

```bash
# Orchestrator interview + parallel execution
/hustle-build "photo gallery with unsplash, payments, sharing"
```

### Manual Parallel Spawn

```bash
# Start 3 agents manually
/parallel-spawn api-create unsplash
/parallel-spawn api-create stripe
/parallel-spawn hustle-ui-create PhotoGrid

# Check status
/parallel-status

# Merge when ready
/parallel-merge
```

### Monitor Progress

```bash
/parallel-status

═══════════════════════════════════════════════════════════════════
                    PARALLEL AGENT STATUS
═══════════════════════════════════════════════════════════════════

Active Agents: 3/5

Agent #1 (unsplash)     [████████████████░░░░] 80%
  Current: Phase 11 - Code Review
  Time: 12m 34s
  Iterations: Green(3), Verify(1)

Agent #2 (stripe)       [████████████░░░░░░░░] 60%
  Current: Phase 9 - TDD Green
  Time: 10m 12s
  Iterations: Green(5) ⚠️ Approaching limit

Agent #3 (share)        [██████████████████░░] 90%
  Current: Phase 13 - Documentation
  Time: 14m 56s
  Iterations: All within limits ✅

═══════════════════════════════════════════════════════════════════
```

## Conflict Resolution

### Registry Conflicts

When multiple agents modify `registry.json`:

```typescript
// Merge strategy: combine arrays, take latest for objects
function mergeRegistries(base: Registry, agents: Registry[]): Registry {
  return {
    ...base,
    apis: { ...base.apis, ...mergeAll(agents.map(a => a.apis)) },
    components: { ...base.components, ...mergeAll(agents.map(a => a.components)) },
    routes: { ...base.routes, ...mergeAll(agents.map(a => a.routes)) },
    env_vars: { ...base.env_vars, ...mergeAll(agents.map(a => a.env_vars)) },
    services: { ...base.services, ...mergeAll(agents.map(a => a.services)) },
    webhooks: { ...base.webhooks, ...mergeAll(agents.map(a => a.webhooks)) },
  };
}
```

### File Conflicts

If agents modify the same file (rare):
1. Detect conflict during merge
2. Show diff to user
3. User resolves manually or picks version
4. Continue merge

## NTFY Integration

Progress updates sent to configured NTFY topic:

```
🚀 Parallel Build Started
   3 agents spawned for photo gallery

⏳ Agent #1 Progress
   Unsplash API: Phase 9 (TDD Green)

⚠️ Agent #2 Warning
   Stripe API: Approaching max iterations on Green phase

✅ Build Complete!
   All 3 agents finished successfully
   PR #47 created: https://github.com/user/repo/pull/47
```

## See Also

- [`/hustle-build`](../.skills/hustle-build/SKILL.md) - Orchestrator command
- [`/parallel-spawn`](../.skills/parallel-spawn/SKILL.md) - Spawn parallel agents (v4.5.0)
- [`/worktree-add`](../.skills/worktree-add/SKILL.md) - Git worktree management
- [`parallel-orchestrator.py`](../hooks/parallel-orchestrator.py) - Hook for parallel coordination (v4.5.0)
- [`REGROUNDING.md`](./REGROUNDING.md) - Context injection
- [`registry.json`](../templates/registry.json) - Shared registry
