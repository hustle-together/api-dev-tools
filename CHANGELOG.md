# Changelog

All notable changes to `@hustle-together/api-dev-tools` will be documented in this file.

## [3.12.0] - 2025-12-28

### Added

- **Enhanced CLI Installer** with ASCII art banner and progress indicators
  - Hustle ASCII art logo on startup
  - 8-step progress with `[1/8]` indicators
  - Animated spinners for long operations
  - Red/black/white branding throughout
- **NTFY Push Notifications**
  - `hooks/lib/ntfy.py` - Shared notification library
  - `hooks/notify-input-needed.py` - Alert when user input needed
  - `hooks/notify-phase-complete.py` - Phase completion updates
  - `/ntfy-setup` and `/ntfy-test` commands
- **4 New Subagents** (7 total now)
  - `parallel-researcher` (Haiku) - Parallel doc scraping
  - `schema-generator` (Sonnet) - Zod schema generation
  - `test-writer` (Sonnet) - TDD test writing
  - `docs-generator` (Haiku) - TypeDoc generation
- **Token Usage Tracking**
  - `hooks/track-token-usage.py` - Per-phase token tracking
  - Token info included in NTFY notifications
- **Component Type Confirmation**
  - Changed from Atom/Molecule/Organism to Basic/Complex naming
  - `hooks/enforce-component-type-confirm.py` - Blocks until user confirms
- **Environment Template**
  - `templates/.env.example` with all configuration variables

### Changed

- README.md completely rewritten with problem/solution table
- Hook count increased from 18 to 22
- Subagent count increased from 3 to 7
- CLI installer now zero-dependency for faster npx

## [3.11.0] - 2025-12-27

### Added

- **Best Practices Analysis Document** - Comprehensive comparison against Claude Code best practices
- **PostToolUse Auto-Formatting** - prettier/eslint after edits
- **3 Subagents**
  - `research-validator` - Deep dive documentation validator
  - `implementation-reviewer` - Compare code to docs
  - `code-reviewer` - Security and performance review

### Changed

- Updated settings.json with auto-format hooks
- Enhanced session-startup.py with workflow-specific context

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
