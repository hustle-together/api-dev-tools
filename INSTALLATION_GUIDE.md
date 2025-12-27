# API Dev Tools - Installation Guide

Complete setup instructions for @hustle-together/api-dev-tools v3.11.0

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| pnpm | 10.11.0+ | `pnpm --version` |
| Python | 3.9+ | `python3 --version` |
| Claude Code | 1.0.0+ | `claude --version` |

---

## Quick Install (Recommended)

```bash
# One-command install
npx @hustle-together/api-dev-tools --scope=project
```

This installs:
- 23 Agent Skills in `.skills/`
- 18 Enforcement Hooks in `.claude/hooks/`
- 3 Subagents in `.claude/agents/`
- State tracking in `.claude/api-dev-state.json`
- Settings in `.claude/settings.json`

---

## Manual Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/hustle-together/api-dev-tools.git
cd api-dev-tools
```

### Step 2: Copy Files to Your Project

```bash
# Copy skills
cp -r .skills/ /path/to/your/project/.skills/

# Copy hooks
cp -r .claude/hooks/ /path/to/your/project/.claude/hooks/

# Copy agents
cp -r .claude/agents/ /path/to/your/project/.claude/agents/

# Copy settings
cp .claude/settings.json /path/to/your/project/.claude/settings.json

# Initialize state file
echo '{"version": "3.11.0", "phases": {}}' > /path/to/your/project/.claude/api-dev-state.json
```

### Step 3: Verify Installation

```bash
cd /path/to/your/project
ls -la .claude/
ls -la .skills/
```

Expected output:
```
.claude/
├── agents/
│   ├── code-reviewer.md
│   ├── implementation-reviewer.md
│   └── research-validator.md
├── hooks/
│   ├── api-workflow-check.py
│   ├── enforce-research.py
│   └── ... (18 files)
├── api-dev-state.json
└── settings.json

.skills/
├── api-create/
├── api-research/
├── commit/
└── ... (23 folders)
```

---

## MCP Server Configuration

### Required MCP Servers

Add to your Claude Code MCP configuration (`~/.claude.json` or `.mcp.json`):

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
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### Optional MCP Servers

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-playwright"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-sequential-thinking"]
    }
  }
}
```

### Verify MCP Connection

```bash
claude mcp list
# Or in Claude Code:
/mcp
```

---

## Usage Tracking Setup

### Install ccusage (Optional but Recommended)

```bash
npm install -g ccusage
```

### View Token Usage

```bash
ccusage
```

### Add to package.json

```json
{
  "scripts": {
    "usage": "ccusage"
  }
}
```

---

## Optional Tools

### Storybook (UI Component Development)

```bash
npx @hustle-together/api-dev-tools --with-storybook
# Or manually:
npx storybook@latest init
```

### Playwright (E2E Testing)

```bash
npx @hustle-together/api-dev-tools --with-playwright
# Or manually:
pnpm add -D @playwright/test
npx playwright install
```

### Sandpack (Live Code Editing)

```bash
npx @hustle-together/api-dev-tools --with-sandpack
# Or manually:
pnpm add @codesandbox/sandpack-react
```

---

## Hook Permissions

The hooks require execution permission:

```bash
chmod +x .claude/hooks/*.py
```

### Hook Dependencies

Hooks are Python scripts. Ensure Python 3.9+ is available:

```bash
python3 --version
```

---

## Verify Everything Works

### 1. Start a New Session

```bash
claude
```

### 2. Check Hooks Loaded

You should see:
```
SessionStart:resume hook success: Success
```

### 3. Run a Test Command

```bash
/api-create test-endpoint
```

If you see Phase 1 (Disambiguation) with AskUserQuestion UI, installation is complete.

---

## Troubleshooting

### "Hook not found" Error

```bash
# Ensure hooks exist
ls -la .claude/hooks/

# Ensure executable
chmod +x .claude/hooks/*.py
```

### MCP Server Not Connected

```bash
# Check MCP status
claude mcp list

# Restart Claude Code
claude --restart
```

### State File Errors

```bash
# Reset state file
rm .claude/api-dev-state.json
echo '{"version": "3.11.0", "phases": {}}' > .claude/api-dev-state.json
```

### Python Not Found

```bash
# Check Python path
which python3

# If not found, install Python 3.9+
# macOS: brew install python@3.11
# Ubuntu: sudo apt install python3.11
```

---

## Project Structure After Installation

```
your-project/
├── .claude/
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   ├── implementation-reviewer.md
│   │   └── research-validator.md
│   ├── hooks/
│   │   ├── api-workflow-check.py
│   │   ├── enforce-disambiguation.py
│   │   ├── enforce-documentation.py
│   │   ├── enforce-environment.py
│   │   ├── enforce-external-research.py
│   │   ├── enforce-interview.py
│   │   ├── enforce-research.py
│   │   ├── enforce-schema.py
│   │   ├── enforce-scope.py
│   │   ├── enforce-tdd-red.py
│   │   ├── enforce-verify.py
│   │   ├── periodic-reground.py
│   │   ├── session-startup.py
│   │   ├── track-tool-use.py
│   │   ├── verify-after-green.py
│   │   └── verify-implementation.py
│   ├── research/
│   │   └── index.json
│   ├── api-dev-state.json
│   ├── registry.json
│   └── settings.json
├── .skills/
│   ├── api-create/
│   ├── api-env/
│   ├── api-interview/
│   ├── api-research/
│   ├── api-status/
│   ├── api-verify/
│   ├── beepboop/
│   ├── busycommit/
│   ├── commit/
│   ├── cycle/
│   ├── gap/
│   ├── green/
│   ├── issue/
│   ├── plan/
│   ├── pr/
│   ├── red/
│   ├── refactor/
│   ├── spike/
│   ├── summarize/
│   ├── tdd/
│   ├── update-todos/
│   ├── worktree-add/
│   └── worktree-cleanup/
├── .mcp.json (optional, for team MCP config)
└── CLAUDE.md (project instructions)
```

---

## Next Steps

1. **Read the README** - Quick reference for all commands
2. **Try `/api-create test`** - Experience the full 13-phase workflow
3. **Check BEST_PRACTICES_ANALYSIS.md** - Detailed phase documentation
4. **Configure your CLAUDE.md** - Add project-specific instructions

---

**Questions?** Open an issue at https://github.com/hustle-together/api-dev-tools/issues
