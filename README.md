# API Development Tools v3.12.12

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██╗  ██╗██╗   ██╗███████╗████████╗██╗     ███████╗       ║
    ║     ██║  ██║██║   ██║██╔════╝╚══██╔══╝██║     ██╔════╝       ║
    ║     ███████║██║   ██║███████╗   ██║   ██║     █████╗         ║
    ║     ██╔══██║██║   ██║╚════██║   ██║   ██║     ██╔══╝         ║
    ║     ██║  ██║╚██████╔╝███████║   ██║   ███████╗███████╗       ║
    ║     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚══════╝       ║
    ║                                                               ║
    ║              API Development Tools for Claude Code            ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

**Interview-driven, research-first API development with 14-phase TDD workflow**

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Compatible-BA0C2F)](https://agentskills.io)
[![Cross-Platform](https://img.shields.io/badge/Cross--Platform-Claude%20%7C%20VS%20Code%20%7C%20Cursor-000000)](https://github.com/hustle-together/api-dev-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-white)](https://opensource.org/licenses/MIT)

---

## Why API Dev Tools?

| Problem                                 | Solution                                      |
| --------------------------------------- | --------------------------------------------- |
| AI writes code from memory, not docs    | ► Research-first workflow forces doc lookup   |
| Generic questions miss project context  | ► Interview questions generated FROM research |
| No verification after implementation    | ► Phase 10 re-researches and compares to docs |
| Easy to skip TDD steps                  | ► 22 hooks enforce phase completion           |
| Context dilutes over long conversations | ► Re-grounding every 7 turns                  |
| No visibility into AI workflow          | ► State tracking + NTFY push notifications    |

---

## Quick Start

```bash
npx @hustle-together/api-dev-tools --scope=project
```

The installer walks you through:

- ■ MCP server configuration (Context7, GitHub)
- ■ Environment variables (.env setup)
- ■ NTFY push notifications (optional)
- ■ Optional tools (Storybook, Playwright, Sandpack)

---

## Four Main Workflows

All four workflows share the same **14-phase structure** ensuring consistency across API, component, page, and orchestration development.

### 1. `/api-create [endpoint]` — Build API Endpoints

Creates a complete API endpoint with research-backed implementation:

```bash
/api-create stripe-checkout
```

**Flow:** Disambiguate → Research Stripe docs → Interview about error handling, formats → Generate Zod schemas → Write failing tests → Implement → Verify against docs → Refactor → Document

---

### 2. `/hustle-ui-create [name]` — Build Components

Creates UI components with Storybook integration and visual testing:

```bash
/hustle-ui-create ChatWindow
```

**Flow:** AI suggests Basic/Complex type → User confirms → Research component patterns → Interview about variants, states → Generate types → Write Storybook stories → Implement → Visual regression tests → Document

---

### 3. `/hustle-ui-create-page [name]` — Build Pages

Creates Next.js pages with Playwright E2E testing:

```bash
/hustle-ui-create-page Dashboard
```

**Flow:** Same 14 phases but focused on page routing, data fetching, and E2E user flows instead of component isolation.

---

### 4. `/hustle-combine [type]` — Orchestrate Existing APIs

Combines multiple existing APIs into orchestrated endpoints:

```bash
/hustle-combine api
```

**Flow:** Select from registry → Define orchestration pattern → Generate combined schemas → Test integration → Document the combined endpoint

---

## How The Phases Work Together

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1-2: CLARIFY                                                 │
│  ├─ Disambiguation: "Did you mean X or Y?"                          │
│  └─ Scope: "We're building Z with these features"                   │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 3-5: RESEARCH                                                │
│  ├─ Initial: Context7 + WebSearch for official docs                 │
│  ├─ Interview: Questions FROM discovered parameters                 │
│  └─ Deep: Propose additional searches based on answers              │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 6-7: PREPARE                                                 │
│  ├─ Schema: Zod types from research + interview decisions           │
│  └─ Environment: Verify API keys exist before coding                │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 8-9: BUILD (TDD)                                             │
│  ├─ Red: Write failing tests that define expected behavior          │
│  └─ Green: Minimal implementation to pass tests                     │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 10-12: VERIFY & REVIEW                                       │
│  ├─ Verify: Re-research docs, compare to implementation             │
│  ├─ Code Review: Greptile AI review (catches issues early)          │
│  └─ Refactor: Fix issues + clean up while tests stay green          │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 13-14: COMPLETE                                              │
│  ├─ Documentation: Update registry, cache research, TypeDoc         │
│  └─ Completion: Final verification, commit, PR                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Gets Installed

| Component         | Count | Purpose                                 |
| ----------------- | ----- | --------------------------------------- |
| Agent Skills      | 24    | Cross-platform workflow commands        |
| Enforcement Hooks | 22    | Block progress until phases complete    |
| Subagents         | 7     | Parallel research, schemas, tests, docs |
| State Tracking    | 1     | Track progress across sessions          |
| Research Cache    | 1     | 7-day freshness documentation cache     |
| Templates         | 4     | Component, page, env, MCP configs       |

---

## Subagents

Seven specialized agents run in parallel to speed up workflows:

| Agent                   | Model  | When Used                            |
| ----------------------- | ------ | ------------------------------------ |
| parallel-researcher     | Haiku  | Phase 3/5 - Scrape docs in parallel  |
| research-validator      | Haiku  | Phase 3/5 - Find endpoints, webhooks |
| schema-generator        | Sonnet | Phase 6 - Generate Zod schemas       |
| test-writer             | Sonnet | Phase 8 - Write comprehensive tests  |
| implementation-reviewer | Sonnet | Phase 10 - Compare code to docs      |
| code-reviewer           | Sonnet | Phase 11 - Greptile AI code review   |
| docs-generator          | Haiku  | Phase 13 - TypeDoc generation        |

---

## Push Notifications

Get notified on your phone when input is needed:

```bash
/ntfy-setup    # Configure NTFY
/ntfy-test     # Send test notification
```

Notifications include:

- ○ Input needed (interview questions)
- ● Phase completions with token usage
- ◆ Workflow blocked (missing requirements)

---

## API Showcase

Interactive documentation and testing UI for all your APIs:

```bash
# Access at: http://localhost:3000/api-showcase
```

**Features:**

- Grid view of all registered APIs with search and filtering
- Click any API to open interactive testing modal
- **Example Requests** - Pre-built, runnable examples that auto-fill query params
- **Try It** - Live API testing with real responses
- **Curl Examples** - Copy working curl commands
- **Documentation** - File locations, schemas, parameters

### How Examples Work

Examples are generated from your Zod schema parameters during Phase 13 (Documentation):

```json
// In registry.json - auto-generated from schema
"endpoints": {
  "search": {
    "params": [...],
    "examples": {
      "basic": {
        "description": "Basic search request",
        "query": "action=search&query=nature",
        "curl": "curl -X GET 'http://localhost:3000/api/v2/unsplash?action=search&query=nature'"
      }
    }
  }
}
```

The showcase reads examples from `registry.json` and displays clickable buttons that auto-fill the request.

---

## TypeDoc Integration

Generate API documentation from TSDoc comments:

```bash
pnpm typedoc           # Generate docs to docs/api/
pnpm typedoc:watch     # Watch mode for development
```

TypeDoc runs during **Phase 13 (Documentation)** and generates Markdown documentation from:

- `src/lib/schemas/*.ts` - Zod schemas with TSDoc comments
- `src/app/api/**/*.ts` - API route handlers

Configuration: `typedoc.json` (installed by the CLI)

---

## Additional Commands

### TDD Workflow

```bash
/red              # Write ONE failing test
/green            # Minimal implementation to pass
/refactor         # Clean up while tests pass
/cycle [desc]     # Complete Red → Green → Refactor
```

### Git Operations

```bash
/commit           # Semantic commit with attribution
/pr               # Create pull request
/busycommit       # Multiple atomic commits
```

### Planning

```bash
/plan [feature]   # Create implementation plan
/gap              # Find unaddressed items
/issue [url]      # Plan from GitHub issue
```

---

## Documentation

### Core Reference

| Document                                                                       | Purpose                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **[docs/SKILLS.md](./docs/SKILLS.md)**                                         | Complete slash command reference - all 24+ skills with usage and examples       |
| **[docs/HOOKS.md](./docs/HOOKS.md)**                                           | All 45+ enforcement hooks - what they do and when they run                      |
| **[docs/AGENTS.md](./docs/AGENTS.md)**                                         | Specialized subagents - parallel-researcher, schema-generator, etc.             |
| **[docs/ORCHESTRATOR.md](./docs/ORCHESTRATOR.md)**                             | Master workflow controller - /hustle-build, decomposition, shared decisions     |
| **[docs/REGROUNDING.md](./docs/REGROUNDING.md)**                               | 7-turn context refresh system - prevents "lost in the middle" problem           |
| **[docs/PLUGIN_ARCHITECTURE.md](./docs/PLUGIN_ARCHITECTURE.md)**               | How the plugin system works - installation, state, lifecycle                    |
| **[docs/CLAUDE_CODE_BEST_PRACTICES.md](./docs/CLAUDE_CODE_BEST_PRACTICES.md)** | Industry best practices for Claude Code - hooks, subagents, context engineering |
| **[docs/GAP_ANALYSIS.md](./docs/GAP_ANALYSIS.md)**                             | How api-dev-tools implements best practices and what gaps remain                |

### Guides

| Document                                                       | Purpose                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)**           | Step-by-step setup including MCP config, environment variables, troubleshooting |
| **[BEST_PRACTICES_ANALYSIS.md](./BEST_PRACTICES_ANALYSIS.md)** | Phase documentation with workflow diagrams and enforcement logic                |
| **[.skills/README.md](./.skills/README.md)**                   | Agent Skills format compatibility and cross-platform notes                      |

### Project Info

| Document                           | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history with features and release notes |
| **[ROADMAP.md](./ROADMAP.md)**     | Future features and enhancement plans           |

---

## Configuration

| File                         | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `.claude/settings.json`      | Hook registration, tool permissions          |
| `.devkit/state.json`         | Current workflow state, phase progress       |
| `.devkit/registry.json`      | All created APIs, components, pages          |
| `.claude/research/`          | Cached documentation with freshness tracking |
| `templates/.env.example`     | Environment variable template                |

---

## Testing Hooks

All hooks include a comprehensive pytest test suite (52 tests):

```bash
# Install test dependencies
pip install -r .claude/hooks/tests/requirements.txt

# Run all tests
python -m pytest .claude/hooks/tests/ -v

# Run specific categories
python -m pytest .claude/hooks/tests/ -k gate      # Gate hooks
python -m pytest .claude/hooks/tests/ -k state     # State management
python -m pytest .claude/hooks/tests/ -k autonomous # Ralph loop, auto-answer
```

See [docs/HOOKS.md#testing-hooks](./docs/HOOKS.md#testing-hooks) for test framework details.

---

## Requirements

- **Claude Code** 1.0.0+ (or compatible platform)
- **Node.js** 18+
- **Python** 3.9+ (for hooks)
- **pnpm** 10.11.0+

---

## Optional Tools

```bash
npx @hustle-together/api-dev-tools --with-storybook   # Component development
npx @hustle-together/api-dev-tools --with-playwright  # E2E testing
npx @hustle-together/api-dev-tools --with-sandpack    # Live code editing
```

---

## Support

- **Issues**: [GitHub Issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hustle-together/api-dev-tools/discussions)

---

**License:** MIT | **Author:** [Hustle Together](https://github.com/hustle-together)
