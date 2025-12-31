# Changelog

All notable changes to this project will be documented in this file.

## [4.5.0] - 2025-12-30

### Added - Implementation Gap Fixes (10 Features Now Actually Work)

This release fixes 10 documented features that were not actually implemented.

#### Workflow Logging (All Sessions)

- **`hooks/hook_utils.py`** - Shared logging utility for all hooks
  - `log_workflow_event()` - Log any workflow event with timestamp
  - Event types: session_start, phase_transition, interview_decision, auto_answer, promise_emitted
  - Logs stored in `.claude/workflow-logs/{workflow_id}.json`
- Logging added to: `session-startup.py`, `auto-answer.py`, `enforce-interview.py`, `completion-promise-detector.py`

#### Directory & Registry Creation

- **Session startup now creates required directories:**
  - `.claude/workflow-logs/` - Audit trail for all sessions
  - `.claude/adrs/` - Architecture Decision Records
  - `.claude/adr-requests/` - Pending ADR research requests
  - `.claude/research/` - Cached research data
- **Registry auto-creation:** `.claude/registry.json` created from template on first session

#### `--dry-run` Flag (NEW)

- **`hooks/enforce-dry-run.py`** - Blocks Write/Edit when dry-run active
  - Allows full workflow preview without file modifications
  - Shows what WOULD be written at each step
  - Useful for testing autonomous mode safely

#### `--max-iterations` Enforcement (NEW)

- **Per-phase iteration limits** now enforced
  - Default: 25 iterations per phase (from `hustle-build-defaults.json`)
  - Blocks with clear message when limit exceeded
  - Prevents infinite loops in autonomous mode
- Added to `completion-promise-detector.py`

#### `--resume` Flag Support (NEW)

- **`hook_utils.py`** - Resume functionality
  - `handle_resume(workflow_id)` - Restore workflow from logs
  - `list_resumable_workflows()` - Show all resumable workflows
  - `snapshot_state_to_log()` - Save state for future resume

#### Ralph Wiggum Skills (NEW)

- **`.skills/ralph-status/SKILL.md`** - Show loop status
  - Current phase and iteration
  - Active promises
  - Elapsed time
- **`.skills/ralph-continue/SKILL.md`** - Resume paused loops
  - Clear active promise
  - Reset iteration counters
  - Continue from last phase

#### Parallel Execution (NEW)

- **`hooks/parallel-orchestrator.py`** - Git worktree coordination
  - Creates isolated worktrees for parallel workflows
  - Injects shared decisions to avoid re-interviewing
  - Merges results when complete
- **`.skills/parallel-spawn/SKILL.md`** - Spawn parallel agents
  - `/parallel-spawn api:users api:products api:orders`
  - Creates worktrees, spawns background Task agents
  - Monitor with `/parallel-status`, merge with `/parallel-merge`

### Changed

- **`hooks/session-startup.py`** v4.5.0
  - Now calls `ensure_directories()` and `ensure_registry()`
  - Logs `session_start` event
  - Initializes flags structure for dry-run/resume/parallel

- **`hooks/completion-promise-detector.py`** v4.5.0
  - Now logs `promise_emitted` events
  - Enforces `--max-iterations` limit
  - Logs `iteration_limit_exceeded` when hit

- **`templates/settings.json`** - New hooks registered
  - `enforce-dry-run.py` in PreToolUse (Write|Edit)
  - `parallel-orchestrator.py` in SessionStart and UserPromptSubmit
  - `completion-promise-detector.py` in PostToolUse (Bash, Write|Edit)

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ v4.5.0 - IMPLEMENTATION GAPS FIXED                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NOW WORKING:                                                   │
│  ✓ Workflow logging (all sessions)                              │
│  ✓ Directory creation (.claude/workflow-logs/, .claude/adrs/)   │
│  ✓ Registry auto-creation from template                         │
│  ✓ --dry-run flag (preview without writes)                      │
│  ✓ --max-iterations enforcement (per-phase limits)              │
│  ✓ --resume flag (restore from workflow logs)                   │
│  ✓ /ralph-status skill                                          │
│  ✓ /ralph-continue skill                                        │
│  ✓ --parallel flag (git worktree coordination)                  │
│  ✓ /parallel-spawn skill (concurrent agents)                    │
│                                                                 │
│  FILES ADDED:                                                   │
│  + hooks/enforce-dry-run.py                                     │
│  + hooks/parallel-orchestrator.py                               │
│  + .skills/ralph-status/SKILL.md                                │
│  + .skills/ralph-continue/SKILL.md                              │
│  + .skills/parallel-spawn/SKILL.md                              │
│                                                                 │
│  FILES MODIFIED:                                                │
│  ~ hooks/hook_utils.py (expanded with logging, resume, etc.)    │
│  ~ hooks/session-startup.py (directory/registry creation)       │
│  ~ hooks/auto-answer.py (uses shared logging)                   │
│  ~ hooks/enforce-interview.py (logs decisions)                  │
│  ~ hooks/completion-promise-detector.py (iterations + logging)  │
│  ~ templates/settings.json (new hooks registered)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## [4.4.0] - 2025-12-30

### Added - Deep ADR Research (Substantive Trade-offs)

**Problem solved:** ADRs were previously created with placeholder content (`_To be filled based on research_`). Now ADRs contain real, researched pros/cons.

- **`.claude/agents/adr-researcher.md`** - Parallel research agent (Haiku)
  - Researches a single technology option
  - Fetches official documentation
  - Extracts: pros, cons, pricing, best-for, limitations
  - Returns structured JSON for ADR creation

- **`.skills/adr-deep-research/SKILL.md`** - Deep research skill
  - Reads pending requests from `.claude/adr-requests/`
  - Spawns parallel `adr-researcher` agents (one per option)
  - Merges results into substantive ADR document
  - Updates registry with ADR metadata

- **`.claude/adr-requests/`** - Research request directory
  - `pending-{category}.json` - Awaiting research
  - Processed requests archived after ADR creation

### Changed - ADR Flow (Request-Based)

- **`hooks/generate-adr-options.py`** v2.0 - Creates requests, not placeholders
  - Previously: Created ADR with empty pros/cons
  - Now: Creates research REQUEST file
  - Injects context: "Run `/adr-deep-research {category}`"
  - AI then runs deep research before interview

- **`.skills/api-research/SKILL.md`** - ADR integration documented
  - Explains automatic ADR detection during research
  - Documents the Research → Deep Research → Interview flow
  - Links to `/adr-deep-research` skill

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ DEEP ADR RESEARCH FLOW                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. /api-research runs                                          │
│     ↓                                                           │
│  2. generate-adr-options.py detects decision                    │
│     → Creates: .claude/adr-requests/pending-database.json       │
│     → Injects: "Run /adr-deep-research database"                │
│     ↓                                                           │
│  3. /adr-deep-research database                                 │
│     → Spawns 3 parallel adr-researcher agents                   │
│     → Each fetches official docs, extracts pros/cons            │
│     ↓                                                           │
│  4. Creates: .claude/adrs/ADR-0001-database-choice.md           │
│     → Real pros/cons from documentation                         │
│     → Pricing, limitations, best-for recommendations            │
│     → Source URLs for verification                              │
│     ↓                                                           │
│  5. Interview references ADR for informed decision              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## [4.3.2] - 2025-12-30

### Added - Master Phase Reference

- **`docs/PHASE_REFERENCE.md`** - Complete 14-phase audit reference
  - Phase Status Matrix with hooks, skills, docs, implementation status
  - All 14 phases documented with purpose, requirements, exit conditions
  - Feature Implementation Matrix (ADR, Auto-Answer, Ralph Wiggum, etc.)
  - All Slash Commands organized by category
  - Configuration files reference

### Added - ADR Integration (Research → ADR → Interview)

- **`hooks/generate-adr-options.py`** - Creates ADRs during research phase
  - Detects multiple options for significant decisions (database, auth, cache, etc.)
  - Creates `.claude/adrs/NNNN-category-choice.md` with options and trade-offs
  - Configurable decision categories in `hustle-build-defaults.json`
- **`hooks/update-adr-decision.py`** - Updates ADRs after interview
  - Changes status from PROPOSED to ACCEPTED
  - Records user's decision and reasoning
- **Registry `adrs` section** - Track all ADRs with metadata
  - Status, category, decision, options considered
  - Links to endpoint and ADR file

### Fixed - Auto-Answer Now Actually Works

- **`hooks/auto-answer.py`** - Uses `continue: false` pattern
  - Previously: Returned `continue: true` with context (didn't skip question UI)
  - Now: Returns `continue: false` with answer in reason (AI uses the answer)
  - Shows brief "Auto-Selected: X" message before proceeding
  - Logs all auto-answers to `.claude/workflow-logs/`

### Changed

- **Skills updated with `(Recommended)` options** - Key skills updated
  - `api-create/SKILL.md` - All 14 phase options marked with (Recommended)
  - `hustle-build/SKILL.md` - Decomposition and interview options
  - `hustle-brand/SKILL.md` - Interview flow and voice options
  - Enables auto-answer hook to detect recommended options
- **`docs/CONFIGURATION.md`** - Added Auto-Answer Selection documentation
  - Explains 3-tier priority: defaults → (Recommended) → keyword fallback
  - Documents scoring algorithm for comprehensive selection
- **README.md** - Comprehensive documentation update
  - All Slash Commands section with 9 categories (40+ commands)
  - Phase-specific commands with phase numbers
  - Configuration section with all config files
  - Updated hook count (54) and component counts
  - Links to new PHASE_REFERENCE.md as master reference
  - New FAQ entries for ADRs and autonomous mode
- **`templates/hustle-build-defaults.json`** v3.1.0
  - Added `adr` section with configurable `significant_decisions`
  - Added `min_options_for_adr` threshold (default: 2)
- **`templates/registry.json`** v1.5.0
  - Added `adrs` section for tracking Architecture Decision Records
- **`templates/settings.json`** - Registered new ADR hooks

---

## [4.3.1] - 2025-12-30

### Added - Configuration Documentation

- **`docs/CONFIGURATION.md`** - Comprehensive configuration guide
  - All configurable options in `hustle-build-defaults.json`
  - How autonomous/skip interview mode works
  - Logging locations for post-hoc review
  - Question mappings and customization examples

### Added - Architecture Decision Records (ADRs)

- **`docs/ARCHITECTURE_DECISION_RECORDS.md`** - ADR integration guide
  - When to create ADRs (Interview & Deep Research phases)
  - ADR template with context, decision drivers, consequences
  - Storage in `.claude/adrs/` with index.json registry
  - Integration with dashboard
- **`templates/adr-viewer/_components/ADRViewer.tsx`** - Dashboard component
  - Filter by status (proposed, accepted, deprecated, superseded)
  - Filter by phase (initial research, interview, deep research)
  - Search across ADR titles and endpoints
  - Detail view with markdown rendering

### Changed - Autonomous Mode Now Default

- **`hustle-build-defaults.json` v3.0.0** - Autonomous mode ON by default
  - `autonomous.enabled: true` - No `--auto` flag needed
  - `autonomous.skip_interviews: true` - Uses comprehensive defaults
  - `autonomous.ralph_wiggum_loops: true` - Iterative phases loop automatically
  - `autonomous.auto_fix_visual_issues: true` - Visual QA fixes without prompting
  - `autonomous.auto_fix_review_issues: true` - Code review fixes without prompting
- **`hooks/auto-answer.py`** - Now checks defaults file for autonomous mode
  - Falls back to template defaults if no project-specific file
  - No state file required for auto-answering to work
- **`docs/AUTONOMOUS_LOOPS.md`** - Updated to reflect default-on behavior

### How to Disable

Set `autonomous.enabled: false` in `.claude/hustle-build-defaults.json` to require manual interviews.

---

## [4.3.0] - 2025-12-29

### Added - Parallel Autonomous Workflow

- **Up to 5 Opus agents** running in parallel across git worktrees
- **`/hustle-build --parallel`** flag for parallel execution
- **`docs/PARALLEL_AUTONOMOUS_WORKFLOW.md`** - Complete architecture documentation
- **Shared context injection** - Orchestrator decisions passed to all agents
- **Merge coordinator** - Combines registry entries, resolves conflicts
- **Agent status monitoring** - Track progress across all parallel agents

### Added - Multi-Pass Code Review

- **4-pass review system** with deterministic checklists:
  - Pass 1: Logic & Bugs (null handling, off-by-one, race conditions)
  - Pass 2: Security (auth, authorization, injection, data exposure)
  - Pass 3: Performance (N+1, memory leaks, re-renders)
  - Pass 4: Miscellaneous (AI judgment - clarity, patterns, docs)
- **Per-item pass/fail tracking** - Every checklist item answered
- **Combined summary report** - Aggregates all pass findings
- **Review Dashboard Template** (`templates/review-dashboard/page.tsx`) - Visual display of multi-pass results

### Added - Max Iterations Flag

- **`/hustle-build --max-iterations [N]`** - Prevent infinite loops
- **Per-phase limits** - Different defaults for each phase type
- **Graceful degradation** - Creates partial PR when limit reached
- **Session archival** - Logs interrupted workflows for review

### Added - Documentation System

- **`/docs-update`** skill - Ensures README/CHANGELOG stay current
- **`hooks/docs-update-check.py`** - PostToolUse hook reminds about doc updates
- **`docs/BRAND_GUIDE.md`** - Complete brand system setup documentation
- **README.md** updated to v4.3.0 with new counts (38+ skills, 24 hooks, 6 templates)

### Added - Research Enhancements

- **TOC Scraping** - Fetches documentation table of contents before interview
- **Comprehensive Discovery Checklist** - Auth, endpoints, params, webhooks, SDKs, errors
- **Enhanced api-research skill** with discovery flow diagram

### Added - Test Mode Enhancements

- **`/hustle-build --auto`** - Full autonomous builds without prompts
- **`templates/hustle-build-defaults.json`** v2.0.0 - Configurable default answers
- **Per-category defaults** - orchestrator, api, component, page, combined, testing
- **Use cases table** - CI/CD integration, demo mode, quick testing

### Enhanced - ShadCN Skill

- **Design System Architecture** diagram showing brand → CSS → Tailwind → ShadCN flow
- **CSS Variable Mapping** table (Brand Guide → CSS Variable → ShadCN Usage)
- **Complete globals.css template** with light/dark mode support
- **`/shadcn sync`** command for brand guide synchronization
- **Registry Integration** section showing tracked values

### Added - Final Gap Closures

- **Completion Promise Detection (Ralph Wiggum)** - Autonomous loop self-termination
  - `hooks/completion-promise-detector.py` - Detects `<promise>DONE</promise>` signals
  - `.skills/ralph-loop/SKILL.md` - `/ralph-loop` skill for autonomous tasks
  - `/ralph-status` and `/ralph-continue` commands
  - **Iterative phase integration:**
    - `/test-review` outputs `<promise>REVIEW_CLEAN</promise>` when all passes clean
    - `/refactor` outputs `<promise>REFACTORED</promise>` when complete
    - `/test-visual` outputs `<promise>VISUAL_CLEAN</promise>` when all viewports pass
  - `docs/AUTONOMOUS_LOOPS.md` - Complete pattern documentation with Geoffrey Huntley credit
- **Schema Lint ESLint Plugin** - Zod best practices enforcement
  - `templates/eslint-plugin-zod-schema/` - Full ESLint plugin
  - Rules: require-description, consistent-naming, no-unsafe-defaults, prefer-strict
  - Recommended and strict configs
- **Dependency Audit Workflow** - Security scanning in CI
  - `templates/github-workflows/security.yml` - Complete GitHub Actions workflow
  - Dependency audit, license check, secret scan, SAST
  - Auto-detects npm/pnpm/yarn
- **Credits & Acknowledgments** section added to README
  - Geoffrey Huntley (Ralph Wiggum Pattern)
  - Kent Beck (TDD Workflow)
  - Context7 and GitHub MCPs

### Changed

- **`/test-review`** - Now uses multi-pass system with promise completion signal
- **`/refactor`** - Adds promise completion signal for autonomous loops
- **`/test-visual`** - Adds promise completion signal for visual QA loops
- **`/hustle-build`** - Supports parallel, max-iterations, and auto flags
- **ROADMAP.md** - Coverage increased from 99% to 100% (MCP limit skipped by design)

---

## [4.2.0] - 2025-12-29

### Added - Brand Guide System

- **`/hustle-brand`** - Comprehensive brand guide creator with interview-driven discovery
  - Visual identity (colors, typography, spacing)
  - Motion & animation preferences (GSAP, Framer Motion, CSS)
  - Voice & tone guidelines (professional, friendly, technical, playful)
  - Custom elements (terminal animations, gradients, Three.js, etc.)
  - Do's and Don'ts for consistency
- **Brand Page Template** (`templates/brand-page/page.tsx`) - Living showcase with:
  - Color palette with copy-to-clipboard
  - Typography scale demonstration
  - Button states (all variants, sizes, loading)
  - Form elements showcase
  - Animation examples
  - Voice examples based on tone
- **Registry brand_guide section** (v1.4.0) - Tracking for:
  - Interview completion status
  - Custom elements selected
  - Voice configuration
  - ShadCN integration status

### Added - ShadCN Integration

- **`/shadcn`** - ShadCN documentation skill with 15-day freshness auto-update
  - `docs [component]` - Get latest component docs
  - `add [components]` - Install with brand theme
  - `status` - Show installed components and freshness
  - Auto-refresh via Context7 when >15 days old

### Changed - Visual Testing Output

- **Enhanced Haiku analysis output** - Now includes:
  - Haiku's detailed reasoning for each finding
  - Screenshot file paths (clickable links)
  - Storybook URLs for each viewport
  - Category-by-category pass/fail breakdown

---

## [4.1.0] - 2025-12-29

### Coverage: 77% → 91%

Major release completing all planned test skills, visual testing, token tracking, and infrastructure improvements.

### Added - Test Skills (8 new skills)

- **`/test-unit`** - Run Vitest unit tests with coverage thresholds
- **`/test-e2e`** - Run Playwright E2E with cross-browser reporting
- **`/test-visual`** - Storybook visual + interaction tests with 7 viewports
- **`/test-all`** - Complete suite: unit → e2e → visual → builds → review
- **`/test-review`** - **Tiered security strategy**: ESLint 100% + AI on critical paths
- **`/test-builds`** - **Browser-only testing** (Chrome/Firefox/WebKit = all platforms)
- **`/test-debug`** - DOM snapshots, root cause analysis
- **`/visual-qa`** - Full visual QA with Haiku analysis

### Added - Visual Testing Enhancements

- **7 Viewports**: Mobile portrait, notch, landscape; tablet portrait/landscape; small/large desktop
- **Safe Area Insets**: iOS notch support (top: 47px, bottom: 34px)
- **Haiku Visual Analyzer Agent**: AI-powered screenshot analysis
- **Enhanced Output**: Haiku's detailed reasoning for each issue
- **Quick Links**: Screenshot paths, Storybook URLs, Playwright reports

### Added - Registry Expansion (v1.3.0)

- **`routes`** - API routes + page routes tracking
- **`env_vars`** - Required environment variables with docs links
- **`services`** - External dependencies (Stripe, Supabase, OpenAI, etc.)
- **`webhooks`** - Incoming webhook endpoints with signature config

### Added - State Management (v3.11.0)

- **Session Archives** - Completed/interrupted workflow history
- **Learnings Aggregation** - Cross-session pattern learning
- **Re-grounding Integration** - Full infrastructure awareness in 7-turn reminders

### Added - Security

- **Tiered Security Review**: ESLint on ALL files + AI on changed/critical paths
- **AI Security Patterns**: SQL injection, auth bypass, CSRF, IDOR, mass assignment, data exposure
- **Security Deny Rules**: In `templates/settings.json`

### Added - Token Tracking

- **`/token-report`** skill with ccusage integration
- **Per-phase timestamps** in state for cost correlation
- **Context capacity warning** hook at 80% usage

### Added - Documentation

- **`docs/REGROUNDING.md`** v4.1.0 - Registry integration section
- **`docs/PRE-COMMIT-SETUP.md`** - lint-staged configuration
- **`docs/ESLINT-CONFIG.md`** - Type-aware rules setup

### Changed

- **`/test-builds`** - Now browser-only (Chromium/Firefox/WebKit covers Tauri/Capacitor/Electron)
- **`/test-review`** - Tiered approach for large codebases (ESLint 100% + AI on critical)
- **`periodic-reground.py`** - Now includes routes, services, webhooks, env vars

### Fixed

- **Source Repository Detection** - Hooks no longer self-enforce on api-dev-tools source
- **Hook Utils** - New `hooks/hook_utils.py` with `is_source_repository()` function

---

## [3.12.12] - 2025-12-28

### Added

- **Dashboard Page Templates** - All dashboard links now work (no more 404s)
  - `/docs` - TypeDoc documentation viewer with generation instructions
  - `/test-results` - Vitest results page with test commands reference
  - `/playwright-report` - E2E test report viewer with Playwright commands

- **Interactive Query Parameter Builder** - Enhanced API testing UX
  - Checkbox toggle to include/exclude each parameter in query string
  - Type-aware inline editors:
    - Dropdown `<select>` for enum types (order_by, color, orientation)
    - Number inputs with min/max validation for numeric types
    - Text inputs with placeholder examples for strings
  - Auto-updates query string as you check params and edit values
  - Required params locked on (can't uncheck)
  - Example preset buttons still work as quick templates

### Changed

- **ParameterDocs component** renamed to `InteractiveParamBuilder` for GET requests
- Query params now sync bidirectionally between builder and input field

### Documentation

- **[docs/HOOKS.md](./docs/HOOKS.md)** - Complete hook reference (45+ hooks)
- **[docs/SKILLS.md](./docs/SKILLS.md)** - All slash commands with usage examples
- **[docs/AGENTS.md](./docs/AGENTS.md)** - Specialized subagent reference
- **[docs/PLUGIN_ARCHITECTURE.md](./docs/PLUGIN_ARCHITECTURE.md)** - How the plugin system works

---

## [3.12.11] - 2025-12-28

### Added

- **Hustle Dev Dashboard** (`/hustle-dev-dashboard`) - Central hub page template
  - Links to API Showcase, UI Showcase, Storybook, TypeDoc, Test Results
  - Shows registry stats (APIs, Combined, Components, Pages)
  - Quick Commands section with common pnpm commands
  - Brand-themed design matching Hustle Together style

- **End-of-Workflow Summaries** - All 4 main commands now show completion summaries
  - `/hustle-api-create` - Shows API quick links and next steps
  - `/hustle-combine` - Shows combined API info and dashboard link
  - `/hustle-ui-create` - Shows component preview links and Storybook
  - `/hustle-ui-create-page` - Shows page URL and E2E test commands

### Changed

- **API Modal UX Improvements** - Better testing experience
  - Modal widened from `max-w-5xl` to `max-w-7xl` for more content space
  - "Send Request" button moved to footer (alongside View Tests/Copy Schema)
  - Reduces scrolling when testing APIs

---

## [3.12.10] - 2025-12-28

### Added

- **TypeDoc Integration** - Generate API documentation from TSDoc comments
  - `pnpm typedoc` script to generate Markdown docs
  - `pnpm typedoc:watch` for development mode
  - `templates/typedoc.json` configuration template
  - Runs during Phase 13 (Documentation)

- **API Showcase Example Requests** - Pre-built, runnable examples in the testing UI
  - Example selector UI with clickable buttons
  - Auto-fills query parameters when clicked
  - "Copy curl" button for each example
  - Examples auto-generated from Zod schema parameters

- **Enhanced extract-schema-docs.cjs** - Generates working examples from schemas
  - Detects required params, enums, and defaults
  - Builds query strings and curl commands
  - Outputs `examples` section for registry.json

### Fixed

- **APIModal 404 errors** - Fixed endpoint path building for action-based APIs
  - Action-based APIs now use query params (`/api/v2/unsplash?action=search`)
  - No longer incorrectly builds sub-paths (`/api/v2/unsplash/search`)

---

## [1.0.1] - 2025-12-28

### Fixed

- **Stop hook false positive blocking**: Fixed bug where `api-workflow-check.py` incorrectly blocked Q&A sessions when no workflow was active. The hook now correctly checks for both `None` and `"not_started"` phase statuses.

---

## [1.0.0] - 2025-12-28

### Initial Release

Interview-driven, research-first API development toolkit with 14-phase TDD workflow.

### Core Features

**Four Main Workflows:**

- `/api-create [endpoint]` - Complete 14-phase API endpoint development
- `/hustle-ui-create [name]` - Component development with Storybook
- `/hustle-ui-create-page [name]` - Page development with Playwright E2E
- `/hustle-combine [type]` - Orchestrate multiple existing APIs

**14-Phase Workflow:**

1. Disambiguation - Clarify ambiguous terms
2. Scope - Confirm understanding
3. Initial Research - Context7 + WebSearch (with async parallel subagents)
4. Interview - Questions FROM research findings
5. Deep Research - Adaptive searches based on answers
6. Schema - Zod schema from research + interview
7. Environment - Verify API keys exist
8. TDD Red - Write failing tests
9. TDD Green - Minimal implementation to pass
10. Verify - Re-research and compare to implementation
11. Code Review - Greptile AI-powered review (catches issues early)
12. TDD Refactor - Fix review issues + clean up code
13. Documentation - Update manifests, cache research
14. Completion - Final commit and PR

**23 Enforcement Hooks:**

- SessionStart: State context injection
- UserPromptSubmit: Research requirement detection
- PreToolUse: Block writes until phases complete
- PostToolUse: Auto-format, token tracking, notifications, code review
- Stop: Block if workflow incomplete

**Greptile AI Code Review (Phase 11):**

- Runs BEFORE refactoring so issues can be fixed
- Bug detection with full codebase context
- Security vulnerability scanning (OWASP top 10)
- Performance issue identification
- Returns actionable issues with file:line references
- Requires: GREPTILE_API_KEY + GITHUB_TOKEN

**Async Parallel Research:**

- Spawn multiple research subagents in parallel
- Use Ctrl+B to background agents
- Use /tasks to monitor progress
- 3x faster research with parallel Context7 + WebSearch

**7 Subagents:**

- `parallel-researcher` (Haiku) - Parallel documentation scraping
- `research-validator` (Haiku) - Find all endpoints and webhooks
- `docs-generator` (Haiku) - TypeDoc generation
- `schema-generator` (Sonnet) - Zod schema creation
- `test-writer` (Sonnet) - Comprehensive test generation
- `implementation-reviewer` (Sonnet) - Compare code to docs
- `code-reviewer` (Sonnet) - Security and performance review

**NTFY Push Notifications:**

- Phase completion updates
- Input needed alerts (interview questions)
- Token usage per phase
- `/ntfy-setup` and `/ntfy-test` commands

**Component Type System:**

- Basic components (single-purpose, few props)
- Complex components (multi-part, user flows)
- AI suggests type, user confirms via hook

**CLI Installer:**

- ASCII art banner with Hustle branding
- 8-step progress indicators
- Animated spinners for long operations
- Optional tools: Storybook, Playwright, Sandpack

**Additional Commands:**

- TDD: `/red`, `/green`, `/refactor`, `/cycle`
- Git: `/commit`, `/pr`, `/busycommit`
- Planning: `/plan`, `/gap`, `/issue`
- Worktrees: `/worktree-add`, `/worktree-cleanup`

**Infrastructure:**

- State tracking in `.claude/api-dev-state.json`
- Research cache with 7-day freshness
- Registry for all created APIs/components
- Environment template in `templates/.env.example`

---

See [ROADMAP.md](./ROADMAP.md) for planned features.
