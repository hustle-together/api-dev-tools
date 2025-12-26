# Changelog

All notable changes to `@hustle-together/api-dev-tools` will be documented in this file.

## [3.12.1] - 2025-12-26

### Fixed - Scope Coverage Enforcement

- **100% Scope Coverage Required** - Changed from confusing 80% threshold to 100%
  - Every discovered feature MUST have an explicit decision
  - Coverage = (implemented + deferred + skipped) / discovered = 100%

- **Added "Skip" Decision Type** - Three-way feature decisions:
  - **Implement**: Build in this workflow
  - **Defer**: Postpone to future version
  - **Skip**: Intentionally exclude (not needed for project)

- **Interview Phase Validates Feature Decisions**
  - `enforce-interview.py` now checks that all discovered features have decisions
  - Blocks proceeding to schema until feature scope is 100% decided
  - Includes guidance on using AskUserQuestion with multiSelect for batch decisions

- **Phase Numbering Consistency** - All documentation uses Phase 1-14 (not Phase 0-13)

### Changed

- `api-workflow-check.py` - Updated `check_scope_coverage()` to include skipped features
- `api-interview/SKILL.md` - Added "Feature Scope Decisions" section with examples
- `enforce-interview.py` - Added Check 6: FEATURE DECISIONS validation
- `AUTONOMOUS_MODE.md` - Updated coverage formula and examples

---

## [3.12.0] - 2025-12-26

### Added - Autonomous Mode & Integrations

- **Autonomous Mode** - Run workflows unattended with YOLO mode
  - `--dangerously-skip-permissions` skips prompts but hooks still enforce workflow
  - Budget tracking: warn at 60%, pause at 80% token usage
  - ntfy notifications for progress, errors, and completion
  - Phase summaries for easy review of autonomous runs
  - Configuration in `.claude/autonomous-config.json`

- **New Hooks (3)**
  - `enforce-budget-limit.py` (PreToolUse) - Token budget enforcement
  - `track-usage-budget.py` (PostToolUse) - Token usage tracking
  - `generate-phase-summary.py` (PostToolUse) - Phase digest generation
  - Total hooks: 42 (was 39)

- **Greptile Integration** - AI code review
  - MCP server configuration
  - GitHub PR review automation
  - `.greptile.json` configuration file
  - CLAUDE.md context awareness
  - Documentation: [GREPTILE_INTEGRATION.md](./GREPTILE_INTEGRATION.md)

- **Graphite Integration** - Stacked PRs workflow
  - `gt` CLI commands documentation
  - Integration with `/commit` and `/pr` skills
  - Documentation: [GRAPHITE_WORKFLOW.md](./GRAPHITE_WORKFLOW.md)

- **Documentation**
  - [AUTONOMOUS_MODE.md](./AUTONOMOUS_MODE.md) - Complete autonomous guide
  - [GREPTILE_INTEGRATION.md](./GREPTILE_INTEGRATION.md) - AI code review setup
  - [GRAPHITE_WORKFLOW.md](./GRAPHITE_WORKFLOW.md) - Stacked PRs workflow
  - Updated [CLAUDE_CODE_FEATURES.md](./CLAUDE_CODE_FEATURES.md) with Explore agent details

### Changed

- **YOLO mode is default** - Autonomous execution as primary mode
- **Sonnet for Explore agents** - NOT Haiku (quality over cost savings)
- **Removed CodeRabbit** - Using Greptile instead (3-month free plan)
- **CLAUDE.md simplified** - References docs instead of inline details
- **Hook count: 42** (was 39)

### Configuration Files

- `.claude/autonomous-config.json` - Autonomous mode settings
- `.greptile.json` - Greptile code review configuration
- `.claude/settings.json` - Updated with new hooks

---

## [3.11.0] - 2025-12-24

### Added - Agent Skills Migration (Phase 1 Complete)

- **Agent Skills Architecture** - Migrated all commands to open standard ([agentskills.io](https://agentskills.io))
  - 23 Agent Skills in `.skills/` directory with SKILL.md format
  - Cross-platform: Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot
  - marketplace.json for plugin distribution
  - install.sh for automated setup

- **Skills Categories**
  - API Development: api-create, api-interview, api-research, api-verify, api-env, api-status
  - UI Development: hustle-ui-create, hustle-ui-create-page, hustle-combine
  - TDD Workflow: red, green, refactor, cycle
  - Planning: plan, gap, issue, spike
  - Git Operations: commit, pr, busycommit, worktree-add, worktree-cleanup
  - Utilities: tdd, beepboop, summarize, add-command

- **TodoWrite Helper Skill** - `.skills/update-todos/SKILL.md`
  - Progress tracking for all 4 workflow modes
  - Phase definitions for 13-phase workflows
  - Loop-back scenario handling

- **Comprehensive Planning Documentation**
  - VERSION_3.2_OVERVIEW.md - Navigation hub
  - ENHANCEMENT_ROADMAP_v3.11.0.md - Strategic overview
  - COMPREHENSIVE_ENHANCEMENT_PLAN.md - Implementation details
  - SKILLS_MIGRATION_CHECKLIST.md - Migration tracking

- **Interactive Demos** (local only)
  - execution-trace-COMPREHENSIVE.html - Full roadmap visualization
  - execution-trace-simulation.html - TodoWrite demo
  - full-workflow-simulation.html - Phase cards view
  - todowrite-workflow-demo.html - TodoWrite concept

### Changed

- **Directory Structure** - Dual distribution strategy
  - `.skills/` - Agent Skills format (new, cross-platform)
  - `.claude/commands/` - Original format (kept for backward compatibility)
  - `.skills/_shared/hooks/` - Packaged enforcement hooks

- **Documentation Updates**
  - CLAUDE.md updated to v3.11.0 with full skills list
  - .skills/README.md with installation instructions
  - Enhanced hook documentation (18 total hooks)

### Maintained (No Changes)

- 13-Phase workflow architecture
- 18 enforcement hooks
- State tracking in `.claude/api-dev-state.json`
- Research cache with 7-day freshness
- Loop-back verification at every phase

### Planned (v3.11.0 Enhancement Roadmap)

- Phase 2: TodoWrite Integration (real-time progress)
- Phase 3: Async Parallel Research (background agents)
- Phase 4: Multi-Strategy Research (95% coverage)
- Phase 5: Skill-Discovery Meta-Skill (`/skill-finder`)
- Phase 6: Per-API Research Folders (additive, no breaking changes)
- Phase 7: Cost/Time Tracking (JSON storage)
- Phase 8: Phase 14 - AI Code Review (Greptile + CodeRabbit + Graphite)
- Phase 9: Stats & Rename Commands

### User Decisions (2025-12-25)

- Priority: Implement ALL phases (no splitting v3.11/v3.12)
- Code Review Tools: Greptile + CodeRabbit + Graphite (all three)
- Stats Storage: JSON files
- Demo Hosting: Local only
- Breaking Changes: NO (backward compatible)

## [3.10.0] - 2025-12-12

### Added
- **UI Page Mode** - Full `/hustle-ui-create-page` workflow with dedicated documentation
  - Page types: landing, dashboard, form, list, detail, auth
  - Playwright E2E test generation (15+ test cases)
  - Data schema validation before implementation
- **Page-Specific Hooks**
  - `check-api-routes.py` - Verifies required API routes exist before page implementation
  - `enforce-page-components.py` - Checks registry for reusable components
  - `enforce-page-data-schema.py` - Validates API response types defined
  - `enforce-a11y-audit.py` - Triggers WCAG audit after TDD Green phase
- **Combine Workflow Validation**
  - 2+ API selection enforcement
  - Registry verification for source APIs
  - Flow type validation (sequential, parallel, conditional)
  - Orchestration examples in manifest generation
- **Brand Color Validation** in `enforce-brand-guide.py`
  - Extracts allowed colors from BRAND_GUIDE.md
  - Validates hex colors, Tailwind classes, CSS variables
  - Notifies on non-brand color usage
- **UI Showcase Auto-Population** in `update-ui-showcase.py`
  - Generates `data.json` from registry automatically
  - Component and page metadata extraction

### Changed
- **State Template** (`api-dev-state.json`)
  - Added `workflow` field: api-create, combine-api, ui-create-component, ui-create-page
  - Added `combine_config` section for orchestration settings
  - Added `ui_config` section for component/page settings
- **Session Startup** (`session-startup.py`)
  - Workflow-specific context injection
  - Combine: source APIs, flow type, error strategy
  - UI: brand guide status, component/page type, a11y level
- **Manifest Generation** (`generate-manifest-entry.py`)
  - Orchestration examples for combined endpoints
  - Flow diagrams and error handling examples
  - Version updated to 3.10.0

### Fixed
- Phase numbering now correctly uses 1-13 (was 0-12 in some files)
- Workflow type detection in api-workflow-check.py for all workflow types

## [3.9.2] - 2025-12-10

### Added
- Animated Hero Header with 3D perspective grid
- Dev Tools landing page at `/dev-tools`
- Multi-endpoint selector for APIs with sub-endpoints
- Audio playback for TTS/voice API responses
- CLI flags: `--with-sandpack`, `--with-storybook`, `--with-playwright`

### Changed
- Updated BRAND_GUIDE.md with complete Hustle brand
- Enhanced showcase components with dark mode support
- Boxy 90s styling with 2px borders

## [3.9.0] - 2025-12-08

### Added
- `/hustle-ui-create` command for UI components/pages
- Brand guide integration with time to update
- ShadCN component detection in Phase 5
- 4-step verification (desktop/tablet/mobile + brand + tests + memory)
- UI Showcase auto-generation at `/ui-showcase`

## [3.8.0] - 2025-12-05

### Added
- `/hustle-combine` command for API orchestration
- Registry.json central tracking
- Combined entry support in update-registry.py
- Orchestration flow types: sequential, parallel, conditional

## [3.7.0] - 2025-12-01

### Added
- Multi-API state support (endpoints object)
- Research cache freshness tracking (7-day threshold)
- Comprehensive manifest generation with 50+ test cases
- Session logging in api-sessions/

## [3.6.7] - 2025-11-28

### Added
- Phase 13 completion output with curl examples
- Scope coverage report
- Research cache location in output
- Gap fixes for file tracking and verification

---

Note: v3.x is the final major version. All future updates will be v3.x.y releases.
