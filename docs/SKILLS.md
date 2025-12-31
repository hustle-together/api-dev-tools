# Skills Reference (Slash Commands)

**Version:** 4.6.0
**Last Updated:** 2025-12-30

> **The Problem**
>
> AI assistants require detailed prompts for every task. Without structured workflows, developers must manually craft prompts, remember complex sequences, and ensure nothing is skipped. This leads to inconsistent results and forgotten steps.

> **The Solution**
>
> Skills are pre-defined slash commands that encapsulate entire workflows. One command like `/api-create` triggers a complete 14-phase process with research, interview, TDD, verification, and documentation - ensuring consistent, thorough execution every time.

---

## Table of Contents

- [API Development Skills](#api-development-skills)
- [UI Development Skills](#ui-development-skills)
- [TDD Skills](#tdd-skills)
- [Testing Skills](#testing-skills)
- [Git Skills](#git-skills)
- [Planning Skills](#planning-skills)
- [Autonomous Mode Skills](#autonomous-mode-skills)
- [Utility Skills](#utility-skills)
- [Hustle-Specific Skills](#hustle-specific-skills)

---

## API Development Skills

### /api-create

**Usage:** `/api-create [endpoint-name]`
**Purpose:** Complete 14-phase API development workflow

Orchestrates the entire API development process:

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Disambiguation | Clarify ambiguous terms |
| 2 | Scope | Confirm endpoint requirements |
| 3 | Initial Research | 2-3 targeted documentation searches |
| 4 | Interview | User requirements gathering |
| 5 | Deep Research | Additional research based on interview |
| 6 | Schema | Create Zod schema from findings |
| 7 | Environment | Verify API keys exist |
| 8 | TDD Red | Write failing tests |
| 9 | TDD Green | Minimal implementation |
| 10 | Verify | Re-research and compare |
| 11 | Code Review | AI-powered review |
| 12 | Refactor | Clean up code |
| 13 | Documentation | Update manifests |
| 14 | Completion | Final verification, commit |

**Example:**
```bash
/api-create unsplash-search
```

---

### /api-research

**Usage:** `/api-research [library-name]`
**Purpose:** Adaptive documentation research with caching

Researches a library/API using:
- Context7 for library documentation
- WebSearch for official docs
- WebFetch for specific pages

Research is cached in `.claude/research/[name]/` with 7-day freshness tracking.

**Example:**
```bash
/api-research stripe
```

---

### /api-interview

**Usage:** `/api-interview [endpoint-name]`
**Purpose:** Structured requirements gathering

Questions are generated FROM research findings, not generic templates:
- "Research found 7 parameters. Which do you need?"
- "Found 3 auth methods. Which should we use?"
- "Discovered pagination. Enable it?"

**Example:**
```bash
/api-interview payment-intent
```

---

### /api-verify

**Usage:** `/api-verify [endpoint-name]`
**Purpose:** Re-research and verify implementation

After tests pass, this skill:
1. Re-reads the original documentation
2. Compares every documented feature to implementation
3. Reports gaps in a comparison table
4. Asks user to fix or acknowledge gaps

**Example:**
```bash
/api-verify payment-intent
```

---

### /api-env

**Usage:** `/api-env [endpoint-name]`
**Purpose:** Check API keys and environment variables

Checks if required environment variables exist:
- Reads from `.env` and `.env.local`
- Reports missing keys
- Provides setup instructions

**Example:**
```bash
/api-env stripe
```

---

### /api-status

**Usage:** `/api-status [endpoint-name]`
**Purpose:** Track progress through phases

Shows current phase status:
```
Phase Status for: payment-intent
─────────────────────────────────
[x] Phase 1: Disambiguation
[x] Phase 2: Scope
[x] Phase 3: Initial Research
[ ] Phase 4: Interview (in progress)
[ ] Phase 5: Deep Research
...
```

**Example:**
```bash
/api-status payment-intent
```

---

## UI Development Skills

### /hustle-ui-create

**Usage:** `/hustle-ui-create [component-name]`
**Purpose:** Create UI component with Storybook

Full component creation workflow:
1. Disambiguation - Clarify what to build
2. Research - Find similar patterns
3. Interview - Requirements gathering
4. Brand Guide - Apply styling rules
5. TDD - Write tests first
6. Implementation - Build component
7. Stories - Create Storybook stories
8. A11y Audit - Accessibility check
9. Documentation - Update registry

**Example:**
```bash
/hustle-ui-create Hero
```

---

### /hustle-ui-create-page

**Usage:** `/hustle-ui-create-page [page-name]`
**Purpose:** Create full page with components

Similar to component workflow but for full pages:
- Creates page route
- Composes from existing components
- Adds data fetching schema
- Creates E2E tests with Playwright

**Example:**
```bash
/hustle-ui-create-page Dashboard
```

---

## TDD Skills

### /red

**Usage:** `/red`
**Purpose:** Write ONE failing test

TDD Red Phase - defines success before implementation:
1. Write exactly one test
2. Test must fail (red)
3. Test describes expected behavior
4. No implementation yet

**Example:**
```bash
/red
# Agent writes: it("should return search results", ...)
# Test fails because implementation doesn't exist
```

---

### /green

**Usage:** `/green`
**Purpose:** Minimal implementation to pass tests

TDD Green Phase - simplest code to pass:
1. Write minimum code to pass test
2. No refactoring
3. No extra features
4. Just make it green

**Example:**
```bash
/green
# Agent writes minimal implementation
# Test now passes
```

---

### /refactor

**Usage:** `/refactor`
**Purpose:** Clean up while keeping tests green

TDD Refactor Phase:
1. Improve code structure
2. Remove duplication
3. Tests must stay green
4. No new features

**Example:**
```bash
/refactor
# Agent improves code quality
# Tests still pass
```

---

### /cycle

**Usage:** `/cycle [description]`
**Purpose:** Complete Red-Green-Refactor loop

Runs all three TDD phases in sequence:
1. Red - Write failing test
2. Green - Make it pass
3. Refactor - Clean up

**Example:**
```bash
/cycle add pagination to search results
```

---

### /spike

**Usage:** `/spike`
**Purpose:** Exploratory coding before TDD

For when you need to understand the problem first:
1. Experiment without test constraints
2. Learn what works
3. Throw away spike code
4. Start proper TDD after

**Example:**
```bash
/spike
# Explore how Stripe webhooks work
# Then start proper TDD
```

---

## Testing Skills

### /test-unit

**Usage:** `/test-unit`
**Purpose:** Run Vitest unit tests with coverage

Executes unit test suite:
1. Runs Vitest with coverage
2. Reports pass/fail counts
3. Shows coverage percentage
4. Highlights uncovered lines

**Example:**
```bash
/test-unit
# Output: 47 passed, 2 failed (98% coverage)
```

---

### /test-e2e

**Usage:** `/test-e2e`
**Purpose:** Run Playwright E2E tests across browsers

Executes end-to-end tests:
1. Runs Playwright tests
2. Tests Chromium, Firefox, WebKit
3. Reports cross-browser results
4. Captures traces for failures

**Example:**
```bash
/test-e2e
# Output: 23 passed across 3 browsers
```

---

### /test-visual

**Usage:** `/test-visual`
**Purpose:** Visual regression with AI screenshot analysis

Captures and analyzes screenshots:
1. Screenshots across 7 viewports
2. Compares to baseline images
3. AI analysis of differences
4. Reports visual regressions

**Example:**
```bash
/test-visual
```

---

### /test-all

**Usage:** `/test-all`
**Purpose:** Complete test suite

Runs all tests in sequence:
1. Unit tests (Vitest)
2. E2E tests (Playwright)
3. Visual tests
4. Build verification
5. AI code review

**Example:**
```bash
/test-all
# Runs complete suite
```

---

### /test-builds

**Usage:** `/test-builds`
**Purpose:** Verify builds across 5 platforms

Validates build outputs:
1. Web (Next.js build)
2. macOS (Tauri)
3. Windows (Tauri)
4. iOS (Capacitor)
5. Android (Capacitor)

**Example:**
```bash
/test-builds
```

---

### /test-review

**Usage:** `/test-review`
**Purpose:** AI-powered code review

Security and performance analysis:
1. ESLint security rules
2. AI security checklist
3. Performance patterns
4. OWASP Top 10 check

**Example:**
```bash
/test-review
```

---

### /test-debug

**Usage:** `/test-debug`
**Purpose:** Diagnose test failures

Analyzes failures with context:
1. Reads failure traces
2. Analyzes screenshots
3. Examines DOM snapshots
4. Suggests root causes

**Example:**
```bash
/test-debug
```

---

## Git Skills

### /commit

**Usage:** `/commit`
**Purpose:** Create semantic commit with co-author

Creates a proper git commit:
1. Checks git status
2. Analyzes changes
3. Writes semantic commit message
4. Adds co-author attribution
5. Commits staged changes

**Example:**
```bash
/commit
# Creates: feat: Add payment processing endpoint
```

---

### /busycommit

**Usage:** `/busycommit`
**Purpose:** Multiple atomic commits

For complex changesets:
1. Analyzes all changes
2. Groups into logical commits
3. Creates multiple atomic commits
4. One logical change per commit

**Example:**
```bash
/busycommit
# Creates:
# - fix: Resolve type error in auth
# - feat: Add user avatar upload
# - docs: Update API reference
```

---

### /pr

**Usage:** `/pr`
**Purpose:** Create pull request

Creates GitHub PR:
1. Checks branch status
2. Pushes if needed
3. Analyzes all commits
4. Creates PR with summary
5. Includes test plan

**Example:**
```bash
/pr
# Creates PR with summary and test plan
```

---

### /worktree-add

**Usage:** `/worktree-add [branch-or-issue]`
**Purpose:** Add git worktree from branch or issue

Creates parallel working directory:
1. Creates worktree
2. Copies settings
3. Installs dependencies
4. Opens in IDE

**Example:**
```bash
/worktree-add feature/new-api
/worktree-add https://github.com/org/repo/issues/123
```

---

### /worktree-cleanup

**Usage:** `/worktree-cleanup`
**Purpose:** Clean up merged worktrees

Removes stale worktrees:
1. Lists all worktrees
2. Checks if merged
3. Removes merged ones
4. Consolidates settings

**Example:**
```bash
/worktree-cleanup
```

---

## Planning Skills

### /plan

**Usage:** `/plan [feature]`
**Purpose:** Create implementation plan

PRD-style discovery and planning:
1. Clarifies requirements
2. Explores codebase
3. Identifies dependencies
4. Creates step-by-step plan
5. Defines acceptance criteria

**Example:**
```bash
/plan user authentication with OAuth
```

---

### /issue

**Usage:** `/issue [github-url]`
**Purpose:** Create TDD plan from GitHub issue

Analyzes issue and creates plan:
1. Fetches issue details
2. Analyzes requirements
3. Creates TDD test plan
4. Identifies affected files

**Example:**
```bash
/issue https://github.com/org/repo/issues/123
```

---

### /gap

**Usage:** `/gap`
**Purpose:** Analyze conversation for gaps

Reviews conversation history:
1. Identifies unaddressed items
2. Lists incomplete tasks
3. Flags forgotten requirements
4. Suggests next steps

**Example:**
```bash
/gap
# Output: "Found 3 unaddressed items:
# - User mentioned dark mode
# - Error handling not discussed
# - No tests for edge cases"
```

---

## Autonomous Mode Skills

### /ralph-loop

**Usage:** `/ralph-loop [task]`
**Purpose:** Start autonomous loop with self-termination

Runs a task in autonomous mode:
1. Starts continuous execution
2. Emits promises at phase boundaries
3. Self-terminates when complete
4. Logs all decisions to workflow-logs

**Example:**
```bash
/ralph-loop build payment API with Stripe
```

---

### /ralph-status

**Usage:** `/ralph-status`
**Purpose:** Check current loop status

Shows autonomous loop state:
- Current phase and iteration
- Time elapsed
- Phases completed
- Active promises

**Example:**
```bash
/ralph-status
# Output: Phase 8 (TDD Red), Iteration 3/25, 47m elapsed
```

---

### /ralph-continue

**Usage:** `/ralph-continue [workflow-id]`
**Purpose:** Resume interrupted loop

Continues from where loop stopped:
1. Loads workflow state
2. Finds last incomplete phase
3. Clears active promises
4. Resumes execution

**Example:**
```bash
/ralph-continue
/ralph-continue wf-2025-12-30-payment
```

---

### /parallel-spawn

**Usage:** `/parallel-spawn [type:name ...]`
**Purpose:** Spawn parallel agents in git worktrees

Coordinates parallel execution:
1. Parses workflow list (api:users, component:chart)
2. Conducts shared interview once
3. Creates git worktrees per workflow
4. Spawns Task agents in parallel
5. Monitors completion
6. Merges results back

**Example:**
```bash
/parallel-spawn api:users api:products component:UserCard
```

**Related:**
- `/parallel-status` - Check parallel execution progress
- `/parallel-merge` - Merge completed worktrees
- `/parallel-abort` - Cancel and cleanup

---

## Utility Skills

### /summarize

**Usage:** `/summarize`
**Purpose:** Summarize conversation progress

Creates executive summary:
1. What was accomplished
2. Current status
3. Blockers/issues
4. Next steps

**Example:**
```bash
/summarize
```

---

### /tdd

**Usage:** `/tdd`
**Purpose:** Remind about TDD approach

Injects TDD reminder into context:
- Always write tests first
- Red before green
- Minimal implementation
- Refactor after green

**Example:**
```bash
/tdd
# Agent refocuses on TDD practices
```

---

### /beepboop

**Usage:** `/beepboop`
**Purpose:** AI attribution marker

Marks content as AI-generated:
- Adds attribution header
- Transparent AI disclosure
- Required for some contexts

**Example:**
```bash
/beepboop
# Adds: "This content was AI-generated with human review"
```

---

### /add-command

**Usage:** `/add-command`
**Purpose:** Guide for creating new skills

Provides template and instructions for creating new slash commands.

**Example:**
```bash
/add-command
# Shows skill creation template
```

---

### /docs-sync

**Usage:** `/docs-sync [feature-name]` or `/docs-sync --check`
**Purpose:** Synchronize documentation after code changes

Ensures docs stay in sync with implementation:
1. Analyze recent changes (git diff or file modifications)
2. Update relevant docs (HOOKS.md, SKILLS.md, AGENTS.md, etc.)
3. Create new docs for new features
4. Ensure Problem/Solution headers on all docs
5. Update README links

**Example:**
```bash
/docs-sync                    # Analyze and sync all docs
/docs-sync stripe-checkout    # Sync docs for specific feature
/docs-sync --check            # Check what needs updating (no writes)
```

**Doc Updates by Change Type:**

| Change Type | Doc to Update |
|-------------|---------------|
| New hook | `docs/HOOKS.md` |
| New skill | `docs/SKILLS.md` |
| New agent | `docs/AGENTS.md` |
| Orchestrator change | `docs/ORCHESTRATOR.md` |
| Re-grounding change | `docs/REGROUNDING.md` |
| Gap fixed | `docs/GAP_ANALYSIS.md` |

---

## Hustle-Specific Skills

### /hustle-build

**Usage:** `/hustle-build [description]`
**Purpose:** Master orchestrator for complete features

Builds complete features from natural language:
1. **Phase 0:** Project Document Intake (prompts for PRD/spec)
2. **Phase 0.5:** Document Parsing (AI extracts pages, components, APIs)
3. Parses request to identify elements
4. Decomposes into APIs, components, pages
5. Conducts orchestrator interview (shared decisions)
6. Executes workflows in dependency order
7. Wires elements together
8. Generates unified documentation

**Flags:**
- `--auto` — Fully autonomous, auto-answers questions
- `--parallel` — Run up to 5 Opus agents in git worktrees
- `--resume [id]` — Resume interrupted build
- `--dry-run` — Show plan without executing
- `--max-iterations [N]` — Per-phase retry limit
- `--skip-document` — Skip project document prompt (v4.6.0)
- `--from-document [path]` — Load spec from file (v4.6.0)

**Project Document Support (v4.6.0):**

When invoked, `/hustle-build` prompts for a comprehensive project document (PRD, spec, deep research output). This enables:

- **Complete extraction** - Identifies ALL pages, components, APIs upfront
- **Dependency graphs** - Builds accurate dependency trees (APIs → Components → Pages)
- **Context preservation** - Sub-workflows receive relevant spec sections
- **Provenance tracking** - Elements marked with `from_project_spec: true`

Supported formats: Markdown (`.md`), JSON (`.json`), Plain text (`.txt`)

**Example:**
```bash
/hustle-build dashboard with user stats and activity charts
/hustle-build --auto --parallel e-commerce checkout flow
/hustle-build --resume build-2025-12-30-dashboard
/hustle-build --from-document ./docs/prd.md e-commerce app
/hustle-build --skip-document quick feature
```

---

### /hustle-api-create

**Usage:** `/hustle-api-create [endpoint]`
**Purpose:** API creation with Hustle branding

Same as /api-create but with:
- Hustle brand guide integration
- API Showcase auto-update
- Registry management

---

### /hustle-combine

**Usage:** `/hustle-combine [name]`
**Purpose:** Combine multiple APIs into one

Orchestrates multiple APIs:
1. Select source APIs
2. Define flow (sequential/parallel)
3. Configure error handling
4. Create combined endpoint
5. Update registry

**Example:**
```bash
/hustle-combine location-weather
# Combines: geocoding + weather APIs
```

---

## Skill Locations

Skills can be defined in multiple locations:

| Location | Scope | Priority |
|----------|-------|----------|
| `.skills/[name]/SKILL.md` | Project | Highest |
| `.claude/commands/[name].md` | Project | High |
| `commands/[name].md` | Package | Medium |
| `~/.claude/commands/[name].md` | User | Lowest |

---

## Skill File Format

```markdown
---
name: my-skill
description: What this skill does
tools: Read, Write, Edit, Bash
model: sonnet
---

# My Skill

Instructions for Claude on how to execute this skill...

## Steps

1. First, do this
2. Then, do that
3. Finally, complete

## Output

What to produce when done.
```

---

## See Also

- [HOOKS.md](./HOOKS.md) - Enforcement hook reference
- [AGENTS.md](./AGENTS.md) - Specialized agent reference
- [PLUGIN_ARCHITECTURE.md](./PLUGIN_ARCHITECTURE.md) - How the plugin system works
