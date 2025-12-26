# API Development Tools - Agent Skills

**Version:** 3.12.0
**Standard:** [Agent Skills Open Format](https://agentskills.io)
**Platform:** Cross-platform (Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot)

## 🚀 Quick Start

### Installation via Claude Code Plugin

```bash
/plugin marketplace add hustle-together/api-dev-tools
/plugin install api-dev-tools
```

### Installation via NPM

```bash
npx @hustle-together/api-dev-tools --scope=project
```

### Manual Installation

1. Clone the repository
2. Copy `.skills/` to `~/.claude/skills/` (personal) or `.claude/skills/` (project)
3. Copy `.skills/_shared/hooks/` to `.claude/hooks/` (for enforcement)
4. Copy `.skills/_shared/settings.json` to `.claude/settings.json`
5. Create `.claude/api-dev-state.json` (see template below)
6. Create `.claude/research/` directory

## 📚 Available Skills (33 Total)

### API Development (8 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **api-create** | `/api-create [endpoint]` | Complete 13-phase API workflow with interview, research, TDD, verification |
| **api-interview** | `/api-interview [endpoint]` | Structured requirements gathering with questions FROM research findings |
| **api-research** | `/api-research [library]` | Adaptive documentation research with 7-day caching |
| **api-verify** | `/api-verify [endpoint]` | Re-research after tests pass to catch implementation gaps |
| **api-env** | `/api-env [endpoint]` | Check API keys and environment variables |
| **api-status** | `/api-status [endpoint]` | Track progress through 13 phases |
| **api-continue** | `/api-continue [endpoint]` | Resume an interrupted workflow from last completed phase |
| **api-sessions** | `/api-sessions [options]` | Browse, search, and export saved session history |

### TDD Workflow (4 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **red** | `/red` | Write ONE failing test (defines success before implementation) |
| **green** | `/green` | Minimal implementation to pass tests (no over-engineering) |
| **refactor** | `/refactor` | Clean up code while keeping tests green |
| **cycle** | `/cycle [description]` | Complete Red → Green → Refactor loop |

### Planning & Analysis (3 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **plan** | `/plan [feature]` | Create implementation plan with PRD-style discovery |
| **gap** | `/gap` | Analyze code vs requirements for missing pieces |
| **issue** | `/issue [url]` | Create TDD plan from GitHub issue |

### Git Operations (5 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **commit** | `/commit` | Semantic commit with co-author attribution |
| **pr** | `/pr` | Create pull request with summary and test plan |
| **busycommit** | `/busycommit` | Multiple atomic commits for complex changesets |
| **worktree-add** | `/worktree-add [branch/issue]` | Add git worktree from branch or issue |
| **worktree-cleanup** | `/worktree-cleanup` | Clean up merged worktrees |

### UI Development (3 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **hustle-ui-create** | `/hustle-ui-create [component]` | 13-phase component workflow with Storybook + Vitest |
| **hustle-ui-create-page** | `/hustle-ui-create-page [page]` | 13-phase page workflow with Playwright E2E |
| **hustle-combine** | `/hustle-combine` | Orchestrate 2+ existing APIs from registry |

### Workflow Utilities (10 skills)

| Skill | Usage | Description |
|-------|-------|-------------|
| **spike** | `/spike` | Exploratory coding before formal TDD |
| **tdd** | `/tdd` | Remind agent about TDD practices |
| **beepboop** | `/beepboop` | Transparent AI attribution markers |
| **summarize** | `/summarize` | Conversation progress summary |
| **add-command** | `/add-command` | Guide for creating new skills |
| **stats** | `/stats` | Track workflow statistics and metrics |
| **rename** | `/rename [old] [new]` | Rename files/variables across codebase |
| **skill-finder** | `/skill-finder [query]` | Find relevant skills for a task |
| **test-toolkit** | `/test-toolkit` | Validate hooks, skills, and templates |
| **update-todos** | `/update-todos` | Update TodoWrite list from context |

## 🏗️ Architecture

### 13-Phase Workflow

```
Phase 1:  DISAMBIGUATION     - Clarify ambiguous terms before research
Phase 2:  SCOPE              - Confirm understanding of endpoint
Phase 3:  INITIAL RESEARCH   - 2-3 targeted searches (Context7, WebSearch)
Phase 4:  INTERVIEW          - Questions FROM discovered params
Phase 5:  DEEP RESEARCH      - Adaptive propose-approve searches
Phase 6:  SCHEMA             - Zod schema from research + interview
Phase 7:  ENVIRONMENT        - Verify API keys exist
Phase 8:  TDD RED            - Write failing tests from schema
Phase 9:  TDD GREEN          - Minimal implementation to pass
Phase 10: VERIFY             - Re-research docs, compare to implementation
Phase 11: TDD REFACTOR       - Clean up code while tests pass
Phase 12: DOCUMENTATION      - Update manifests, cache research
Phase 13: COMPLETION         - Final verification, commit
```

### Loop-Back Architecture

Every verification phase can loop back if not successful:
- Phase 1: Loop if disambiguation unclear
- Phase 3: Loop if more research needed
- Phase 4: Loop if interview incomplete
- Phase 6: Loop if schema incorrect
- Phase 8: Loop if test plan needs changes
- Phase 10: Loop if gaps found in implementation
- Phase 12: Loop if documentation incomplete

### State Tracking

All progress tracked in `.claude/api-dev-state.json`:

```json
{
  "version": "3.0.0",
  "endpoint": null,
  "turn_count": 0,
  "phases": {},
  "research_index": {}
}
```

### Research Cache

Documentation cached in `.claude/research/` with 7-day freshness:

```
.claude/research/
├── brandfetch/
│   ├── 2025-12-08_initial.md
│   ├── 2025-12-08_deep.md
│   └── CURRENT.md
└── index.json  ← Freshness tracking
```

## ⚙️ Requirements

### Required

- **Claude Code**: 1.0.0 or higher (or compatible platform)
- **Python**: 3.9+ (for enforcement hooks)
- **Node.js**: 18+ (for package management)
- **pnpm**: 10.11.0+ (package manager)

### MCP Servers (Recommended)

- **Context7**: Documentation search and discovery
- **GitHub**: PR and issue integration

### Optional but Recommended

- **Enforcement Hooks**: 42 Python scripts that enforce workflow rules
- **Settings.json**: Hook registration for lifecycle events

## 🔒 Enforcement Hooks (Optional)

For full workflow enforcement, install hooks to `.claude/hooks/`:

### Hook Types

| Event | Hooks | Purpose |
|-------|-------|---------|
| **SessionStart** | session-startup.py | Inject state context at session start |
| **UserPromptSubmit** | enforce-external-research.py | Detect API terms, require research |
| **PreToolUse** | enforce-research.py<br>enforce-interview.py<br>verify-implementation.py | Block writes until research/interview done<br>Inject interview decisions<br>Require test file before route |
| **PostToolUse** | track-tool-use.py<br>periodic-reground.py<br>verify-after-green.py | Log research, count turns<br>Re-ground every 7 turns<br>Trigger Phase 10 after test pass |
| **Stop** | api-workflow-check.py | Block if phases incomplete |

### What Hooks Enforce

1. **Research Before Implementation**: Cannot write code without researching documentation
2. **Interview Before Schema**: Cannot create Zod schema without user interview
3. **Tests Before Implementation**: Cannot write route without test file
4. **Verification After Green**: Automatically triggers re-research after tests pass
5. **Documentation Completeness**: Blocks completion if docs not updated
6. **7-Turn Re-grounding**: Prevents context dilution in long sessions

## 🎯 Key Principles

1. **Loop Until Green** - Every verification phase loops back if not successful
2. **Questions FROM Research** - Never use generic template questions
3. **Adaptive Research** - Propose searches based on context, not shotgun
4. **7-Turn Re-grounding** - Context injected every 7 turns to prevent dilution
5. **Verify After Green** - Re-research to catch memory-based implementation errors

## 📖 Usage Examples

### Example 1: Create New API Endpoint

```bash
# Fully automated workflow
/api-create my-endpoint

# Follows all 13 phases automatically
# Asks for user input at each checkpoint
# Loops back if verification fails
# Creates tests, implementation, docs
```

### Example 2: Manual Step-by-Step

```bash
# Research external API
/api-research stripe

# Interview for requirements
/api-interview payment

# Check environment
/api-env payment

# TDD workflow
/red
/green
/refactor

# Verify implementation
/api-verify payment

# Commit
/commit
```

### Example 3: From GitHub Issue

```bash
# Create plan from issue
/issue https://github.com/org/repo/issues/123

# Execute plan
/cycle implement feature from issue

# Create PR
/pr
```

## 🌍 Platform Compatibility

### ✅ Full Support (with hooks)

- **Claude Code**: Complete workflow with all enforcement hooks

### ✅ Partial Support (skills only)

- **VS Code with GitHub Copilot**: Skills work, manual hook setup required
- **Cursor**: Skills work, manual hook setup required
- **ChatGPT**: Skills work, no hook support
- **Any Agent Skills-compatible platform**: Basic skill usage

### Hook Setup for Non-Claude Code Platforms

1. Copy `.skills/_shared/hooks/` to your project
2. Copy `.skills/_shared/settings.json` to your project
3. Configure your IDE/platform to run hooks (varies by platform)
4. Hooks are OPTIONAL for basic usage
5. Hooks are REQUIRED for full workflow enforcement

## 📦 Distribution

- **GitHub**: [hustle-together/api-dev-tools](https://github.com/hustle-together/api-dev-tools)
- **NPM**: [@hustle-together/api-dev-tools](https://npmjs.com/package/@hustle-together/api-dev-tools)
- **SkillsMP**: [skillsmp.com](https://skillsmp.com) (pending submission)

## 📄 License

MIT License - See [LICENSE](../../LICENSE) file

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hustle-together/api-dev-tools/discussions)
- **Email**: contact@hustletogether.dev

## 🔗 Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [Claude Code Documentation](https://code.claude.com/docs)
- [Enhancement Roadmap](../../docs/planning/ENHANCEMENT_ROADMAP_v3.11.0.md)
- [Full Documentation](../../docs/FULL_DOCUMENTATION.md)

---

**Built with ❤️ by Hustle Together**
*Empowering developers with interview-driven, research-first API development*
