# API Development Tools v3.11.0

**Interview-driven, research-first API development with 13-phase TDD workflow**

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Compatible-blue)](https://agentskills.io)
[![Cross-Platform](https://img.shields.io/badge/Cross--Platform-Claude%20%7C%20VS%20Code%20%7C%20Cursor-green)](https://github.com/hustle-together/api-dev-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **33 Agent Skills** for cross-platform compatibility across Claude Code, VS Code, Cursor, ChatGPT, and GitHub Copilot

---

## Quick Start

### Install

```bash
# Via Claude Code Plugin (Recommended)
/plugin install hustle-together/api-dev-tools

# Via NPM
npx @hustle-together/api-dev-tools --scope=project
```

### Your First API

```bash
/api-create stripe-checkout
```

This runs you through 13 enforced phases:
1. **Disambiguation** → Clarify what you're building
2. **Scope** → Confirm understanding
3. **Research** → Live docs via Context7 + WebSearch
4. **Interview** → Questions FROM research findings
5. **Deep Research** → Follow-up based on your answers
6. **Schema** → Zod schema from research
7. **Environment** → Verify API keys
8. **TDD Red** → Write failing tests
9. **TDD Green** → Minimal implementation
10. **Verify** → Re-check against docs
11. **Refactor** → Clean up code
12. **Documentation** → Update manifests
13. **Complete** → Final verification

### Other Workflows

```bash
/hustle-ui-create Button       # Create UI component (Storybook + Vitest)
/hustle-ui-create-page dashboard  # Create page (Playwright E2E)
/hustle-combine                # Orchestrate 2+ existing APIs
```

### TDD Shortcuts

```bash
/red        # Write ONE failing test
/green      # Minimal implementation to pass
/refactor   # Clean up while tests pass
/cycle      # All three in sequence
```

### Git Operations

```bash
/commit     # Semantic commit with co-author
/pr         # Create pull request
/busycommit # Multiple atomic commits
```

---

## What's Included

| Category | Count | Examples |
|----------|-------|----------|
| **Skills** | 33 | api-create, hustle-ui-create, commit, pr |
| **Hooks** | 19 | Enforcement for each phase |
| **Templates** | 9 | Component, Page, API route, Showcases |

### Skills by Category

- **API Development**: api-create, api-research, api-interview, api-verify, api-env, api-status, api-continue, api-sessions
- **UI Development**: hustle-ui-create, hustle-ui-create-page, hustle-combine
- **TDD**: red, green, refactor, cycle, tdd, spike
- **Git**: commit, pr, busycommit, worktree-add, worktree-cleanup
- **Planning**: plan, gap, issue
- **Utilities**: stats, rename, skill-finder, summarize, test-toolkit

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/](./docs/) | All documentation |
| [docs/INSTALLATION_GUIDE.md](./docs/INSTALLATION_GUIDE.md) | Setup instructions |
| [docs/TLDR.md](./docs/TLDR.md) | Quick command reference |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Version history |
| [.skills/README.md](./.skills/README.md) | Skills documentation |

---

## Optional Integrations

Phase 14 (Code Review) supports these tools if configured:

| Tool | Purpose | Setup |
|------|---------|-------|
| **CodeRabbit** | AI PR reviews (free for OSS) | [coderabbit.ai](https://coderabbit.ai) |
| **Graphite** | Stacked PRs workflow | `brew install withgraphite/tap/graphite` |
| **Greptile** | Deep codebase analysis | [greptile.com](https://greptile.com) |

These are optional - workflows complete without them.

---

## Requirements

- **Claude Code** 1.0.0+ (or compatible platform)
- **Python** 3.9+ (for hooks)
- **Node.js** 18+
- **pnpm** 10.11.0+

### Recommended MCP Servers

- **Context7** - Live documentation lookup
- **GitHub** - PR creation and management

---

## License

MIT © [Hustle Together](https://github.com/hustle-together)

---

**Full documentation**: [docs/FULL_DOCUMENTATION.md](./docs/FULL_DOCUMENTATION.md)
