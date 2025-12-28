# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-28

### Initial Release

Interview-driven, research-first API development toolkit with 13-phase TDD workflow.

### Core Features

**Four Main Workflows:**

- `/api-create [endpoint]` - Complete 13-phase API endpoint development
- `/hustle-ui-create [name]` - Component development with Storybook
- `/hustle-ui-create-page [name]` - Page development with Playwright E2E
- `/hustle-combine [type]` - Orchestrate multiple existing APIs

**13-Phase Workflow:**

1. Disambiguation - Clarify ambiguous terms
2. Scope - Confirm understanding
3. Initial Research - Context7 + WebSearch
4. Interview - Questions FROM research findings
5. Deep Research - Adaptive searches based on answers
6. Schema - Zod schema from research + interview
7. Environment - Verify API keys exist
8. TDD Red - Write failing tests
9. TDD Green - Minimal implementation to pass
10. Verify - Re-research and compare to implementation
11. TDD Refactor - Clean up while tests pass
12. Documentation - Update manifests, cache research
13. Completion - Final verification

**22 Enforcement Hooks:**

- SessionStart: State context injection
- UserPromptSubmit: Research requirement detection
- PreToolUse: Block writes until phases complete
- PostToolUse: Auto-format, token tracking, notifications
- Stop: Block if workflow incomplete

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
