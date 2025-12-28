# Changelog

All notable changes to this project will be documented in this file.

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
