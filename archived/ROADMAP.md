# API Dev Tools - Comprehensive Roadmap & Gap Analysis

**Current Version:** 4.0.0
**Last Updated:** 2025-12-29
**Status:** Active Development

---

## Executive Summary

This document consolidates the **roadmap** and **gap analysis** for API Dev Tools, providing a single source of truth for all planned enhancements, identified gaps, and implementation priorities.

### Current Coverage: 77%

| Category                 | Solved | Partial | Gap | Coverage |
| ------------------------ | ------ | ------- | --- | -------- |
| Context Engineering      | 6      | 1       | 0   | 93%      |
| Hooks                    | 6      | 1       | 0   | 93%      |
| Autonomous Loops         | 1      | 2       | 2   | 40%      |
| Subagents                | 5      | 1       | 1   | 79%      |
| Skills                   | 4      | 1       | 0   | 90%      |
| MCPs                     | 2      | 1       | 1   | 63%      |
| CLAUDE.md                | 5      | 0       | 0   | 100%     |
| Agentic Patterns         | 3      | 2       | 0   | 80%      |
| Security                 | 3      | 0       | 1   | 75%      |
| **Visual Testing**       | 0      | 1       | 3   | **25%**  |
| **Test Skills**          | 0      | 0       | 7   | **0%**   |
| **Token Tracking**       | 0      | 1       | 1   | **50%**  |
| **Code Quality & CI/CD** | 0      | 2       | 6   | **25%**  |

### Priority Gaps to Address

| #   | Gap                                      | Priority | Effort  | Impact                           |
| --- | ---------------------------------------- | -------- | ------- | -------------------------------- |
| 1   | **7 Missing Test Skills**                | HIGH     | 6-8 hrs | Enable test automation           |
| 2   | **Multi-Viewport Testing (7 viewports)** | HIGH     | 4-6 hrs | Real-world responsive coverage   |
| 3   | **Haiku Visual Analyzer Subagent**       | HIGH     | 2-3 hrs | AI-powered screenshot analysis   |
| 4   | **Security Deny Rules**                  | HIGH     | 1 hr    | Safety critical                  |
| 5   | **Pre-commit Hooks** (lint-staged)       | HIGH     | 2 hrs   | Fast local quality gates         |
| 6   | **Type-Aware ESLint**                    | HIGH     | 1 hr    | Catch type errors before runtime |
| 7   | **Token Tracking Per Phase**             | MEDIUM   | 2-3 hrs | Cost visibility                  |
| 8   | **Context Capacity Warning**             | MEDIUM   | 1 hr    | Prevents context degradation     |
| 9   | **Schema Lint** (Zod conventions)        | MEDIUM   | 2 hrs   | API consistency                  |
| 10  | **Dependency Audit** (npm audit)         | MEDIUM   | 1 hr    | Security baseline                |

### Deferred Gaps (Implement Later)

| #   | Gap                             | Priority | Effort  | Reason to Defer            |
| --- | ------------------------------- | -------- | ------- | -------------------------- |
| 11  | API Contract Tests (OpenAPI)    | LOW      | 4 hrs   | Need OpenAPI spec first    |
| 12  | Bundle Size Budget              | LOW      | 2 hrs   | Optimization, not blocking |
| 13  | Dead Code Detection             | LOW      | 1 hr    | Nice to have               |
| 14  | API Security Scan (OWASP)       | LOW      | 4 hrs   | Advanced security          |
| 15  | Multi-Pass Code Review          | LOW      | 4-6 hrs | Current review sufficient  |
| 16  | Parallel Worktree Orchestration | LOW      | 6-8 hrs | Complex, rare use case     |
| 17  | Sandbox Mode Integration        | LOW      | 2 hrs   | Minor UX improvement       |
| 18  | claude-mem Integration          | FUTURE   | 4 hrs   | Evaluate after v4.1        |

---

## Roadmap Phases

### Phase 1: Foundation (Current Sprint)

**Status:** In Progress

| Item                  | Status  | Notes                                                                            |
| --------------------- | ------- | -------------------------------------------------------------------------------- |
| 7 Test Skills         | GAP     | test-unit, test-e2e, test-visual, test-all, test-review, test-builds, test-debug |
| TodoWrite Integration | PARTIAL | Add to all workflow skills                                                       |
| Security Deny Rules   | GAP     | Add to settings.json template                                                    |

**Test Skills to Create:**

| Skill          | Purpose                     | Commands                                 |
| -------------- | --------------------------- | ---------------------------------------- |
| `/test-unit`   | Run Vitest unit tests       | `pnpm test` or `npm test`                |
| `/test-e2e`    | Run Playwright E2E tests    | `npx playwright test`                    |
| `/test-visual` | Run visual regression tests | Storybook + Playwright screenshots       |
| `/test-all`    | Run all test suites         | unit → e2e → visual in sequence          |
| `/test-review` | Analyze test coverage       | Coverage reports + suggestions           |
| `/test-builds` | Test across 5 platforms     | Web, macOS, Windows, iOS, Android        |
| `/test-debug`  | Diagnose test failures      | Parse reports, DOM snapshots, root cause |

---

### Phase 2: Visual Testing (Next Sprint)

**Status:** Planned

#### Multi-Viewport Testing

**Current State:** 3 viewports (mobile 375, tablet 768, desktop 1920)
**Target State:** 7 viewports with safe area support

| Viewport         | Dimensions | Notes                         |
| ---------------- | ---------- | ----------------------------- |
| Mobile Portrait  | 375×667    | iPhone SE baseline            |
| Mobile Notch     | 393×852    | iPhone 14 Pro with safe areas |
| Mobile Landscape | 667×375    | Rotated view                  |
| Tablet Portrait  | 768×1024   | iPad Mini baseline            |
| Tablet Landscape | 1024×768   | Rotated tablet                |
| Small Desktop    | 1280×720   | Laptop screens                |
| Desktop          | 1920×1080  | Standard desktop              |

**Safe Area Insets (iOS notch devices):**

```json
{
  "top": 47,
  "bottom": 34,
  "left": 0,
  "right": 0
}
```

**Files to Update:**

- `templates/performance-budgets.json` - Add 7 viewports
- `templates/component/Component.visual.spec.ts` - Iterate all viewports
- `templates/page/page.e2e.test.ts` - Update responsive tests

#### Haiku Visual Analyzer Subagent

**Purpose:** AI-powered screenshot analysis using Claude Haiku within Claude Code (no external APIs needed).

**New Agent:** `.claude/agents/visual-analyzer.md`

```yaml
---
name: visual-analyzer
description: AI-powered screenshot analysis for UI verification
tools: Read, Glob
model: haiku  # Multimodal - can analyze images natively!
---

# Visual Analyzer Agent

You are analyzing UI screenshots for quality issues.

For each screenshot, check:
1. Layout - Are elements properly aligned? Any overlapping?
2. Typography - Is text readable? Proper contrast?
3. Touch targets - Are buttons at least 44x44px?
4. Responsiveness - Does layout adapt to viewport?
5. Brand compliance - Colors/fonts match brand guide?

Output JSON: {issues: [{type, severity, element, detail}]}
```

**Visual Analysis Flow (Opus → Haiku → Opus):**

```
1. Opus Agent: Runs Playwright headless → captures screenshots at 7 viewports
2. Opus Agent: Spawns parallel Haiku subagents (one per viewport)
3. Haiku Agents: Analyze screenshots for visual issues
4. Haiku Agents: Report back JSON with issues
5. Opus Agent: Receives all reports, aggregates issues
6. Opus Agent: IF issues found → Fix code → Re-run screenshots → Loop
7. Opus Agent: IF clean → Proceed to Phase 11 (Code Review)
```

**Example Haiku Task Call:**

```javascript
Task({
  subagent_type: "visual-analyzer",
  model: "haiku",
  prompt: `Analyze __snapshots__/Button-mobile-notch.png for:
    1. Touch targets (min 44x44px)
    2. Text contrast (min 4.5:1)
    3. Safe area violations
    Return JSON: {issues: [{type, severity, element, detail}]}`,
});
```

**Benefits of Haiku over External APIs:**

- No external API keys needed
- Stays within Claude Code ecosystem
- Works with existing subagent infrastructure
- Cost already included in Claude Code usage

---

### Phase 3: Token Tracking (Future Sprint)

**Status:** Planned

#### Per-Phase Token Tracking with ccusage

**Tool:** [ccusage](https://github.com/ryoppippi/ccusage) - 4.8k GitHub stars

**Commands:**

```bash
npx ccusage              # Daily report
npx ccusage session      # Per-session breakdown
npx ccusage blocks --live  # Real-time dashboard
```

**Implementation:**

1. **Add phase timestamps to `api-dev-state.json`:**

```json
{
  "phases": {
    "research_initial": {
      "status": "complete",
      "started_at": "2025-12-29T10:00:00Z",
      "completed_at": "2025-12-29T10:05:00Z"
    }
  }
}
```

2. **Create `/token-report` skill:**

```bash
# Correlates ccusage session data with phase timestamps
npx ccusage session --json | python hooks/correlate-phase-tokens.py
```

3. **Output:**

```
Token Usage by Phase:
─────────────────────────────────
Phase 1 (Disambiguation):     1,200 tokens
Phase 2 (Scope):              2,500 tokens
Phase 3 (Initial Research):   8,400 tokens
Phase 4 (Interview):          3,100 tokens
...
─────────────────────────────────
Total:                       45,000 tokens
Estimated Cost:              $0.45
```

**Benefits:**

- Identify expensive phases (optimize prompts)
- Budget prediction for similar endpoints
- Cost transparency for teams

---

## Gap Analysis Details

### 1. Context Engineering (93% Coverage)

| Best Practice                  | Status      | Implementation                                       | Notes                                 |
| ------------------------------ | ----------- | ---------------------------------------------------- | ------------------------------------- |
| Token accumulation awareness   | **Solved**  | 7-turn re-grounding via `periodic-reground.py`       | Injects context every 7 turns         |
| Context rot mitigation         | **Solved**  | `periodic-reground.py` + todo list refresh           | Re-injects objectives                 |
| `/clear` between tasks         | **Partial** | No automatic clearing                                | User must manually clear              |
| System reminders for attention | **Solved**  | Hooks inject `<system-reminder>` tags                | Multiple hooks do this                |
| Handoff documents              | **Solved**  | `/summarize` skill creates handoffs                  | Saves context for next session        |
| Registry awareness             | **Solved**  | Re-grounding includes existing APIs/components/pages | Prevents recreating elements          |
| Deferred features tracking     | **Solved**  | Re-grounding shows deferred features                 | Prevents re-suggesting declined items |

---

### 2. Hooks (93% Coverage)

| Best Practice                      | Status      | Implementation                                | Notes                              |
| ---------------------------------- | ----------- | --------------------------------------------- | ---------------------------------- |
| PreToolUse validation              | **Solved**  | `enforce-research.py`, `enforce-interview.py` | Block without research             |
| PostToolUse auto-formatting        | **Partial** | No auto-prettier/eslint                       | Could add formatting hook          |
| Stop hook for continuous operation | **Solved**  | `verify-after-green.py`, `run-code-review.py` | Continue until tests pass          |
| SubagentStop validation            | **Solved**  | `research-validator` agent validates findings | Quality checks on research         |
| Notification hooks                 | **Solved**  | `ntfy-on-question.py`, `ntfy-on-stop.py`      | Push notifications                 |
| SessionStart context injection     | **Solved**  | `session-startup.py`                          | Full state injection               |
| UserPromptSubmit validation        | **Solved**  | `enforce-external-research.py`                | Require research for API questions |

---

### 3. Autonomous Loops (40% Coverage)

| Best Practice                | Status      | Implementation                         | Gap/Notes                         |
| ---------------------------- | ----------- | -------------------------------------- | --------------------------------- |
| Continuous iteration loops   | **Partial** | `/hustle-build --auto` mode            | Works but less mature             |
| Completion promise detection | **Gap**     | Not implemented                        | Could add completion markers      |
| Max iterations safety        | **Partial** | No configurable max iterations         | Need `--max-iterations` flag      |
| Prompt tuning methodology    | **Solved**  | Interview-driven prompts from research | Questions generated from findings |
| Git worktree parallelism     | **Gap**     | `/worktree-add` exists                 | Need multi-worktree orchestration |

**Gaps to Fix:**

- Add `--max-iterations` flag to `/hustle-build`
- Add completion detection for autonomous loops

---

### 4. Subagents (79% Coverage)

| Best Practice               | Status      | Implementation                            | Notes                             |
| --------------------------- | ----------- | ----------------------------------------- | --------------------------------- |
| Isolated context windows    | **Solved**  | 7 specialized agents in `.claude/agents/` | Each has own context              |
| Specialized tool access     | **Solved**  | Each agent has restricted tools           | Research: read-only, Writer: full |
| Model selection per agent   | **Solved**  | Haiku for speed, Sonnet for quality       | Configured per agent              |
| Multi-pass review pattern   | **Partial** | `code-reviewer` agent exists              | Only one pass, not multi-pass     |
| Background agents           | **Solved**  | `run_in_background` parameter supported   | Async operations                  |
| Custom agent creation       | **Solved**  | Agents in `.claude/agents/` directory     | Template provided                 |
| Explore thoroughness levels | **Gap**     | Not exposing thoroughness parameter       | Should pass "quick"/"thorough"    |

**Current Agents:**

| Agent                   | Model     | Purpose                                |
| ----------------------- | --------- | -------------------------------------- |
| parallel-researcher     | Haiku     | Fast parallel documentation scraping   |
| research-validator      | Haiku     | Deep documentation validation          |
| schema-generator        | Sonnet    | Generate Zod schemas from research     |
| test-writer             | Sonnet    | Create comprehensive tests (TDD Red)   |
| implementation-reviewer | Sonnet    | Compare code to docs (Phase 10)        |
| code-reviewer           | Sonnet    | Security/performance review (Phase 11) |
| docs-generator          | Haiku     | TypeDoc generation                     |
| **visual-analyzer**     | **Haiku** | **NEW: AI screenshot analysis**        |

---

### 5. Skills (90% Coverage)

| Best Practice             | Status      | Implementation           | Notes                           |
| ------------------------- | ----------- | ------------------------ | ------------------------------- |
| On-demand domain loading  | **Solved**  | 24+ skills in `.skills/` | Loaded when invoked             |
| SKILL.md format           | **Solved**  | All skills follow format | Metadata + instructions         |
| Under 500 lines per skill | **Solved**  | Average 100-200 lines    | Concise by design               |
| Model-invoked skills      | **Partial** | Currently user-invoked   | Could add model-invocable hints |
| Plugin bundling           | **Solved**  | npm package bundles all  | Single install                  |

---

### 6. MCPs (63% Coverage)

| Best Practice                   | Status      | Implementation                    | Notes                   |
| ------------------------------- | ----------- | --------------------------------- | ----------------------- |
| Context7 for documentation      | **Solved**  | Pre-configured                    | Real-time library docs  |
| GitHub MCP for PR management    | **Solved**  | Pre-configured                    | Full GitHub integration |
| Puppeteer/Playwright for visual | **Partial** | Optional `--with-playwright`      | Not included by default |
| MCP scope management            | **Solved**  | Project `.mcp.json` + user config | Team + personal configs |
| Limit to 2-3 MCPs               | **Gap**     | No enforcement                    | Could get bloated       |

---

### 7. CLAUDE.md (100% Coverage)

| Best Practice              | Status     | Implementation                              |
| -------------------------- | ---------- | ------------------------------------------- |
| Concise project context    | **Solved** | Template in `templates/CLAUDE-SECTION.md`   |
| Key directories documented | **Solved** | Generated by `/init` or installer           |
| Commands documented        | **Solved** | All commands in CLAUDE.md template          |
| Project-specific context   | **Solved** | Placeholders for tech stack, UI library     |
| Registry reference         | **Solved** | Template references `.claude/registry.json` |

---

### 8. Security (75% Coverage)

| Best Practice                   | Status     | Implementation                        | Notes                 |
| ------------------------------- | ---------- | ------------------------------------- | --------------------- |
| Read-only by default            | **Solved** | Research phases are read-only         | Write only in Phase 9 |
| Deny dangerous operations       | **Solved** | Settings template includes deny rules | rm -rf, sudo blocked  |
| Environment variable protection | **Solved** | `/api-env` checks without exposing    | Safe key verification |
| Sandbox mode                    | **Gap**    | Not using `/sandbox` integration      | Could reduce prompts  |

**Security Deny Rules (templates/settings.json):**

```json
"deny": [
  "Read(.env*)", "Read(**/.env*)", "Read(**/secrets/**)",
  "Bash(rm -rf *)", "Bash(sudo *)",
  "Bash(git push --force *)", "Bash(git reset --hard *)",
  "Bash(curl * | bash)", "Bash(wget * | bash)"
]
```

---

### 9. Visual Testing (25% Coverage) - NEW CATEGORY

| Best Practice          | Status      | Implementation         | Notes                       |
| ---------------------- | ----------- | ---------------------- | --------------------------- |
| Multi-viewport testing | **Partial** | 3 viewports            | Need 7 viewports            |
| Safe area insets       | **Gap**     | Not implemented        | iOS notch support           |
| AI screenshot analysis | **Gap**     | Not implemented        | Haiku visual-analyzer agent |
| Pixel-diff comparison  | **Solved**  | Playwright screenshots | jest-image-snapshot         |

---

### 10. Test Automation Skills (0% Coverage) - NEW CATEGORY

| Skill          | Status  | Purpose                     |
| -------------- | ------- | --------------------------- |
| `/test-unit`   | **GAP** | Run Vitest unit tests       |
| `/test-e2e`    | **GAP** | Run Playwright E2E tests    |
| `/test-visual` | **GAP** | Run visual regression tests |
| `/test-all`    | **GAP** | Run all test suites         |
| `/test-review` | **GAP** | Analyze test coverage       |
| `/test-builds` | **GAP** | Test across 5 platforms     |
| `/test-debug`  | **GAP** | Diagnose test failures      |

---

### 11. Token Tracking (50% Coverage) - NEW CATEGORY

| Best Practice          | Status      | Implementation    | Notes                  |
| ---------------------- | ----------- | ----------------- | ---------------------- |
| Session-level tracking | **Partial** | ccusage available | Not integrated         |
| Per-phase tracking     | **Gap**     | Not implemented   | Need phase correlation |
| Cost transparency      | **Gap**     | Not implemented   | `/token-report` skill  |

---

### 12. Code Quality & CI/CD (25% Coverage) - NEW CATEGORY

| Practice               | Status      | Implementation  | Notes                   |
| ---------------------- | ----------- | --------------- | ----------------------- |
| ESLint configured      | **Partial** | Basic config    | Need type-aware rules   |
| TypeScript strict mode | **Partial** | Enabled         | Not enforced in CI      |
| Pre-commit hooks       | **Gap**     | Not implemented | lint-staged recommended |
| Schema linting         | **Gap**     | Not implemented | Zod convention checks   |
| API contract tests     | **Gap**     | Not implemented | OpenAPI validation      |
| Bundle size budget     | **Gap**     | Not implemented | Prevent bloat           |
| Dead code detection    | **Gap**     | Not implemented | Unused exports          |
| Dependency audit       | **Gap**     | Not implemented | npm audit in CI         |

**Recommended CI Pipeline:**

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    steps:
      - pnpm lint # ESLint with type info
      - pnpm typecheck # tsc --noEmit
      - pnpm test # Vitest unit tests
      - pnpm test:e2e # Playwright (optional)
      - npm audit --audit-level=high
      - pnpm build # Verify builds
```

**Pre-commit Hook Setup (lint-staged):**

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## What We Do Better

Areas where api-dev-tools exceeds best practices:

### 1. Research-First Enforcement

- `enforce-research.py` - Blocks writes without research
- `enforce-external-research.py` - Requires web/Context7 lookups
- Phase 10 verification - Re-researches after implementation

### 2. Interview-Driven Development

- Questions generated FROM research findings
- Shared decisions across orchestrated workflows
- Interview decisions injected during implementation

### 3. State Persistence Across Sessions

- Full state tracking in `api-dev-state.json`
- 7-day research cache with freshness tracking
- Registry of all created elements
- Resume capability for interrupted builds

### 4. 14-Phase Structured Workflow

- 14 explicit phases with hooks at each
- Phase gates that block progress
- Status tracking per phase
- Loop-back on verification failures

### 5. Orchestration Layer

- `/hustle-build` master orchestrator
- Dependency-aware execution order
- Shared decisions across sub-workflows
- Automatic wiring of completed elements

---

## Files to Create

### Test Skills (7 files)

- `.skills/test-unit/SKILL.md`
- `.skills/test-e2e/SKILL.md`
- `.skills/test-visual/SKILL.md`
- `.skills/test-all/SKILL.md`
- `.skills/test-review/SKILL.md`
- `.skills/test-builds/SKILL.md`
- `.skills/test-debug/SKILL.md`

### Visual Analyzer Agent

- `.claude/agents/visual-analyzer.md`

### Token Tracking

- `hooks/correlate-phase-tokens.py`
- `.skills/token-report/SKILL.md`

---

## Files to Modify

### Visual Testing Templates

- `templates/performance-budgets.json` - Add 7 viewports with safe areas
- `templates/component/Component.visual.spec.ts` - Iterate all viewports
- `templates/page/page.e2e.test.ts` - Update responsive tests

### Settings

- `templates/settings.json` - Ensure security deny rules

---

## Implementation Timeline

### Sprint 1: Foundation (~8 hours)

1. Create 7 test skills
2. Add TodoWrite calls to workflow skills
3. Add security deny rules

### Sprint 2: Visual Testing (~10 hours)

1. Update performance-budgets.json with 7 viewports + safe areas
2. Update visual test templates
3. Create visual-analyzer Haiku subagent
4. Add token tracking per phase
5. Create /token-report skill

### Sprint 3: Polish (~8 hours)

1. Add context capacity warning hook
2. Add multi-pass code review agent
3. Optimize interactive flow

---

## Model Reference (December 2025)

| Provider  | Model            | Model ID                   | Pricing                |
| --------- | ---------------- | -------------------------- | ---------------------- |
| Google    | Gemini 3 Flash   | `gemini-3-flash-preview`   | $0.50/1M in, $3/1M out |
| Anthropic | Claude Haiku 3.5 | `claude-3-5-haiku-latest`  | Fast, cheap            |
| Anthropic | Claude Sonnet 4  | `claude-sonnet-4-latest`   | Balanced               |
| Anthropic | Claude Opus 4.5  | `claude-opus-4-5-20251101` | Full capability        |

---

## See Also

- [HOOKS.md](./docs/HOOKS.md) - All 45+ enforcement hooks
- [SKILLS.md](./docs/SKILLS.md) - All 24+ skills reference
- [AGENTS.md](./docs/AGENTS.md) - Specialized subagents
- [ORCHESTRATOR.md](./docs/ORCHESTRATOR.md) - Orchestration system
- [REGROUNDING.md](./docs/REGROUNDING.md) - 7-turn context refresh
- [CLAUDE_CODE_BEST_PRACTICES.md](./docs/CLAUDE_CODE_BEST_PRACTICES.md) - Source best practices

---

**Document Version:** 4.0.0
**Last Updated:** 2025-12-29
**Author:** Claude Opus 4.5
