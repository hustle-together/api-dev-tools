# API Development Tools v3.11.0

**Interview-driven, research-first API development with 13-phase TDD workflow**

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Compatible-blue)](https://agentskills.io)
[![Cross-Platform](https://img.shields.io/badge/Cross--Platform-Claude%20%7C%20VS%20Code%20%7C%20Cursor-green)](https://github.com/hustle-together/api-dev-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Quick Start (2 Minutes)

### 1. Install

```bash
# Via NPM (recommended)
npx @hustle-together/api-dev-tools --scope=project

# Or via Claude Code Plugin
/plugin marketplace add hustle-together/api-dev-tools
/plugin install api-dev-tools
```

### 2. Configure MCP Servers

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token" }
    }
  }
}
```

### 3. Start Your First Workflow

```bash
/api-create my-endpoint      # Complete 13-phase API workflow
```

---

## What Gets Installed

| Component                | Location                     | Purpose                              |
| ------------------------ | ---------------------------- | ------------------------------------ |
| **23 Agent Skills**      | `.skills/`                   | Cross-platform workflow commands     |
| **18 Enforcement Hooks** | `.claude/hooks/`             | Block progress until phases complete |
| **3 Subagents**          | `.claude/agents/`            | Parallel research & code review      |
| **State Tracking**       | `.claude/api-dev-state.json` | Track progress across sessions       |
| **Research Cache**       | `.claude/research/`          | 7-day freshness documentation cache  |
| **MCP Templates**        | `templates/mcp-servers.json` | Pre-configured MCP servers           |

---

## Four Main Workflows

| Command                         | Phases | Purpose                                  |
| ------------------------------- | ------ | ---------------------------------------- |
| `/api-create [endpoint]`        | 13     | Create API endpoint with full TDD        |
| `/hustle-ui-create [name]`      | 13     | Create UI component with Storybook       |
| `/hustle-ui-create-page [name]` | 13     | Create Next.js page with Playwright E2E  |
| `/hustle-combine api`           | 13     | Combine existing APIs into orchestration |

### 13-Phase Flow (All Workflows)

```
1. Disambiguation  →  Clarify what we're building
2. Scope           →  Confirm understanding
3. Initial Research →  Context7 + WebSearch
4. Interview       →  Questions FROM research
5. Deep Research   →  Adaptive propose-approve
6. Schema          →  Zod types from interview
7. Environment     →  Verify API keys
8. TDD Red         →  Write failing tests
9. TDD Green       →  Minimal implementation
10. Verify         →  Re-research, compare to docs
11. Refactor       →  Clean up, tests stay green
12. Documentation  →  Update manifests
13. Completion     →  Final check, commit
```

---

## Essential Commands

### TDD Workflow

```bash
/red              # Write ONE failing test
/green            # Minimal implementation to pass
/refactor         # Clean up while tests pass
/cycle [desc]     # Complete Red→Green→Refactor
```

### Git Operations

```bash
/commit           # Semantic commit with attribution
/pr               # Create pull request
/busycommit       # Multiple atomic commits
```

### Planning & Analysis

```bash
/plan [feature]   # Create implementation plan
/gap              # Find unaddressed items
/issue [url]      # Plan from GitHub issue
```

---

## Subagents (Parallel Processing)

Three specialized agents run in parallel for faster research:

| Agent                     | Model  | Purpose                        |
| ------------------------- | ------ | ------------------------------ |
| `research-validator`      | Haiku  | Scrape ToC, find all endpoints |
| `implementation-reviewer` | Sonnet | Compare code to docs           |
| `code-reviewer`           | Sonnet | Security & performance review  |

---

## Hooks (Automatic Enforcement)

| Event            | Hooks                                           | What They Do                                  |
| ---------------- | ----------------------------------------------- | --------------------------------------------- |
| **SessionStart** | `session-startup.py`                            | Inject state context                          |
| **PreToolUse**   | 12 enforcement hooks                            | Block writes until phases complete            |
| **PostToolUse**  | `verify-after-green.py`, `periodic-reground.py` | Trigger verification, re-ground every 7 turns |
| **Stop**         | `api-workflow-check.py`                         | Block if phases incomplete                    |

---

## Usage Tracking

Monitor token usage and costs:

```bash
# Install ccusage
npm install -g ccusage

# View usage
ccusage
```

---

## Configuration Files

| File                         | Purpose                         |
| ---------------------------- | ------------------------------- |
| `.claude/settings.json`      | Hook registration, permissions  |
| `.claude/api-dev-state.json` | Workflow state tracking         |
| `.claude/research/`          | Cached documentation            |
| `.claude/registry.json`      | Created APIs, components, pages |
| `.mcp.json`                  | MCP server configuration        |

---

## Optional Tools

```bash
# Install with optional features
npx @hustle-together/api-dev-tools --with-storybook   # Component dev
npx @hustle-together/api-dev-tools --with-playwright  # E2E testing
npx @hustle-together/api-dev-tools --with-sandpack    # Live editing
```

---

## Documentation

| Document                                                   | Description                            |
| ---------------------------------------------------------- | -------------------------------------- |
| [BEST_PRACTICES_ANALYSIS.md](./BEST_PRACTICES_ANALYSIS.md) | Full phase documentation, hook details |
| [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)           | Detailed setup instructions            |
| [.skills/README.md](./.skills/README.md)                   | All 23 skills with usage               |
| [VERSION_3.2_OVERVIEW.md](./VERSION_3.2_OVERVIEW.md)       | Roadmap and planning                   |
| [CHANGELOG.md](./CHANGELOG.md)                             | Version history                        |

---

## Requirements

- **Claude Code** 1.0.0+ (or compatible platform)
- **Node.js** 18+
- **Python** 3.9+ (for hooks)
- **pnpm** 10.11.0+

---

## Support

- **Issues**: [GitHub Issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hustle-together/api-dev-tools/discussions)

---

**License:** MIT | **Author:** Hustle Together
