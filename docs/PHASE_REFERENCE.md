# 14-Phase Workflow Reference

Complete reference for all phases, hooks, skills, and implementation status.

## Phase Status Matrix

| # | Phase | Hook | Skill | Doc | Impl |
|---|-------|------|-------|-----|------|
| 1 | Disambiguation | `enforce-disambiguation.py` | `/api-create` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 2 | Scope | `enforce-scope.py` | `/api-create` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 3 | Initial Research | `enforce-research.py` | `/api-research` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 4 | Interview | `enforce-interview.py` | `/api-interview` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 5 | Deep Research | `enforce-deep-research.py` | `/api-create` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 6 | Schema | `enforce-schema.py` | `/api-create` | [SCHEMA-LINT.md](./SCHEMA-LINT.md) | ✅ |
| 7 | Environment | `enforce-environment.py` | `/api-env` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 8 | TDD Red | `enforce-tdd-red.py` | `/red` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 9 | TDD Green | _(implicit)_ | `/green` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 10 | Verify | `verify-after-green.py` | `/api-verify` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 11 | Code Review | `run-code-review.py` | `/test-review` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 12 | TDD Refactor | `enforce-refactor.py` | `/refactor` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 13 | Documentation | `enforce-documentation.py` | `/docs-sync` | [API-CREATE.md](./API-CREATE.md) | ✅ |
| 14 | Completion | `api-workflow-check.py` | `/commit`, `/pr` | [API-CREATE.md](./API-CREATE.md) | ✅ |

---

## Phase Details

### Phase 1: Disambiguation

**Purpose:** Clarify ambiguous terms before research begins.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-disambiguation.py` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | 2+ search variations, AskUserQuestion, user selection |
| **Exit Condition** | `phase_exit_confirmed: true` |
| **Example** | "unsplash" → Random photo API vs Unsplash brand API? |

```
User: "Create an unsplash endpoint"
AI: "Did you mean Unsplash.com API or a generic random photo API?"
```

---

### Phase 2: Scope

**Purpose:** Confirm understanding of what will be built.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-scope.py` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | Endpoint path shown, user question asked, user confirmation |
| **Exit Condition** | `phase_exit_confirmed: true` |
| **Prevents** | Scope creep before research |

```
AI: "Building /api/v2/unsplash with search, random, and photo-by-id actions. Correct?"
User: "Yes"
```

---

### Phase 3: Initial Research

**Purpose:** Gather documentation before asking questions.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-research.py` |
| **Skill** | `/api-research [library]` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | 2+ sources, summary table, user approval |
| **Exit Condition** | `phase_exit_confirmed: true` |
| **Sources** | Context7, WebSearch, WebFetch |

**ADR Integration:** If research finds multiple options (e.g., auth methods), creates ADR-OPTIONS file.

---

### Phase 4: Interview

**Purpose:** Ask questions generated FROM research findings.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-interview.py`, `hooks/enforce-questions-sourced.py` |
| **Skill** | `/api-interview [endpoint]` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | 5+ structured questions, AskUserQuestion with options |
| **Exit Condition** | `user_completed: true`, `phase_exit_confirmed: true` |
| **Stored** | `.claude/research/{endpoint}/interview.json` |

**Key Principle:** Never use generic template questions. All questions come from discovered parameters.

---

### Phase 5: Deep Research

**Purpose:** Additional research based on interview answers.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-deep-research.py` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | Proposed searches shown, user approval |
| **Exit Condition** | `phase_exit_confirmed: true` |
| **Adaptive** | Based on interview, not shotgun approach |

```
AI: "Based on your rate limiting choice, I propose researching:
     1. Unsplash rate limit headers
     2. Exponential backoff patterns
     Approve?"
```

---

### Phase 6: Schema

**Purpose:** Create Zod schema from research + interview.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-schema.py` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | Zod schema created, shown to user, user confirmation |
| **Exit Condition** | `schema_shown: true`, `phase_exit_confirmed: true` |
| **Output** | `lib/schemas/{endpoint}.ts` |

Schema serves as contract between research and implementation.

---

### Phase 7: Environment

**Purpose:** Verify API keys exist before coding.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-environment.py` |
| **Skill** | `/api-env [endpoint]` |
| **Trigger** | PreToolUse on Write (route.ts) |
| **Requirements** | Keys checked, status shown, user readiness confirmed |
| **Exit Condition** | `user_ready: true`, `phase_exit_confirmed: true` |
| **Checks** | `.env.local`, `.env` for required variables |

---

### Phase 8: TDD Red

**Purpose:** Write failing tests that define expected behavior.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-tdd-red.py` |
| **Skill** | `/red` |
| **Trigger** | PreToolUse on Write (route.ts) |
| **Requirements** | Test file created, matrix shown, user approval |
| **Exit Condition** | `test_scenarios` recorded, `phase_exit_confirmed: true` |
| **Output** | `tests/{endpoint}.test.ts` |

Tests MUST fail before implementation.

---

### Phase 9: TDD Green

**Purpose:** Minimal implementation to pass all tests.

| Aspect | Details |
|--------|---------|
| **Hook** | _(implicit - tests must pass)_ |
| **Skill** | `/green` |
| **Requirements** | All tests passing |
| **Constraint** | Minimal code, no over-engineering |
| **Output** | `app/api/v2/{endpoint}/route.ts` |

---

### Phase 10: Verify

**Purpose:** Re-research docs and compare to implementation.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/verify-after-green.py`, `hooks/enforce-verify.py` |
| **Skill** | `/api-verify [endpoint]` |
| **Trigger** | PostToolUse on Bash (after tests pass) |
| **Requirements** | Re-research original docs, gap analysis, user decision |
| **Exit Condition** | Gaps addressed or skipped, `phase_exit_confirmed: true` |
| **Auto-generates** | `api-tests-manifest.json` |

Catches implementation errors from stale memory.

---

### Phase 11: Code Review

**Purpose:** AI-powered review for bugs, security, performance.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/run-code-review.py` |
| **Skill** | `/test-review` |
| **Trigger** | After Phase 10 completes |
| **Tool** | Greptile API (full codebase context) |
| **Output** | Issues with file:line references |
| **Ralph Wiggum** | Loops until `<promise>REVIEW_CLEAN</promise>` |

---

### Phase 12: TDD Refactor

**Purpose:** Fix review issues and clean up code.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-refactor.py` |
| **Skill** | `/refactor` |
| **Trigger** | PreToolUse on Write/Edit |
| **Requirements** | Verification complete |
| **Constraint** | Tests must stay green |
| **Ralph Wiggum** | Loops until `<promise>REFACTORED</promise>` |

---

### Phase 13: Documentation

**Purpose:** Update manifests, cache research, generate docs.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/enforce-documentation.py` |
| **Skill** | `/docs-sync` |
| **Trigger** | PreToolUse on completion actions |
| **Requirements** | Checklist completed, user confirmation |
| **Output** | Research cache, registry update, TypeDoc |
| **Cache** | `.claude/research/{endpoint}/` |

---

### Phase 14: Completion

**Purpose:** Final verification and commit.

| Aspect | Details |
|--------|---------|
| **Hook** | `hooks/api-workflow-check.py` (Stop) |
| **Skill** | `/commit`, `/pr` |
| **Trigger** | Stop event |
| **Requirements** | All phases complete |
| **Output** | Semantic commit, PR, curl examples |

---

## Feature Implementation Matrix

| Feature | Hook | Skill | Config | Docs |
|---------|------|-------|--------|------|
| **ADR Generation** | `generate-adr-options.py` | - | `adr.enabled` | [ARCHITECTURE_DECISION_RECORDS.md](./ARCHITECTURE_DECISION_RECORDS.md) |
| **Auto-Answer** | `auto-answer.py` | - | `autonomous.enabled` | [CONFIGURATION.md](./CONFIGURATION.md) |
| **Ralph Wiggum Loops** | `completion-promise-detector.py` | `/ralph-loop` | `autonomous.ralph_wiggum_loops` | [AUTONOMOUS_LOOPS.md](./AUTONOMOUS_LOOPS.md) |
| **7-Turn Re-grounding** | `periodic-reground.py` | - | - | [REGROUNDING.md](./REGROUNDING.md) |
| **Research Cache** | `cache-research.py` | - | - | [API-CREATE.md](./API-CREATE.md) |
| **Token Tracking** | `track-tool-use.py` | `/token-report` | - | [CONFIGURATION.md](./CONFIGURATION.md) |
| **NTFY Notifications** | `ntfy-on-question.py` | `/ntfy-setup` | - | [CONFIGURATION.md](./CONFIGURATION.md) |
| **Visual Testing** | - | `/test-visual` | - | [API-CREATE.md](./API-CREATE.md) |
| **Code Review** | `run-code-review.py` | `/test-review` | - | [API-CREATE.md](./API-CREATE.md) |
| **Registry Tracking** | `update-registry.py` | - | - | [CONFIGURATION.md](./CONFIGURATION.md) |

---

## All Slash Commands

### Main Workflows

| Command | Description | Phases |
|---------|-------------|--------|
| `/api-create [endpoint]` | Full 14-phase API workflow | 1-14 |
| `/hustle-ui-create [name]` | Component with Storybook | 1-14 |
| `/hustle-ui-create-page [name]` | Page with Playwright E2E | 1-14 |
| `/hustle-combine [type]` | Orchestrate existing APIs | 1-14 |
| `/hustle-build [description]` | Auto-decompose and build | 1-14 |

### Phase-Specific

| Command | Phase | Description |
|---------|-------|-------------|
| `/api-research [lib]` | 3 | Targeted research |
| `/api-interview [ep]` | 4 | Questions from research |
| `/api-env [ep]` | 7 | Check API keys |
| `/api-verify [ep]` | 10 | Re-research and verify |
| `/api-status [ep]` | Any | Show current progress |

### TDD Commands

| Command | Phase | Description |
|---------|-------|-------------|
| `/red` | 8 | Write failing tests |
| `/green` | 9 | Minimal implementation |
| `/refactor` | 12 | Clean up (tests stay green) |
| `/cycle` | 8-12 | Full TDD cycle |
| `/spike` | Pre-8 | Exploratory coding |

### Testing Commands

| Command | Description |
|---------|-------------|
| `/test-unit` | Run Vitest unit tests |
| `/test-e2e` | Run Playwright E2E tests |
| `/test-visual` | Storybook visual tests (7 viewports) |
| `/test-review` | AI code review (4-pass) |
| `/test-builds` | Browser build verification |
| `/test-all` | Complete test suite |
| `/test-debug` | Analyze test failures |

### Git Commands

| Command | Description |
|---------|-------------|
| `/commit` | Semantic commit |
| `/busycommit` | Multiple atomic commits |
| `/pr` | Create pull request |
| `/worktree-add` | Add git worktree |
| `/worktree-cleanup` | Clean merged worktrees |

### Utility Commands

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plan |
| `/issue` | Analyze GitHub issue |
| `/gap` | Find unaddressed items |
| `/summarize` | Summarize progress |
| `/token-report` | Token usage stats |
| `/docs-sync` | Update documentation |
| `/hustle-brand` | Brand guide creator |
| `/shadcn` | ShadCN component docs |
| `/ralph-loop` | Autonomous task loop |
| `/beepboop` | AI attribution |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.claude/hustle-build-defaults.json` | Autonomous mode, ADR config, defaults |
| `.claude/api-dev-state.json` | Current workflow state |
| `.claude/registry.json` | Created APIs/components/ADRs |
| `.claude/research/` | Cached research with 7-day freshness |
| `.claude/workflow-logs/` | Auto-answer logs |
| `.claude/adrs/` | Architecture Decision Records |

---

## Hook Types

| Type | When | Example |
|------|------|---------|
| SessionStart | Session begins | `session-startup.py` |
| PreToolUse | Before tool runs | `enforce-research.py` |
| PostToolUse | After tool runs | `generate-adr-options.py` |
| Stop | Before session ends | `api-workflow-check.py` |

---

## See Also

- [API-CREATE.md](./API-CREATE.md) - Detailed API workflow
- [HOOKS.md](./HOOKS.md) - All hook documentation
- [SKILLS.md](./SKILLS.md) - All skill documentation
- [CONFIGURATION.md](./CONFIGURATION.md) - Configuration options
- [AUTONOMOUS_LOOPS.md](./AUTONOMOUS_LOOPS.md) - Ralph Wiggum pattern
