# Claude Code CLI: The Definitive Best Practices Guide

**Version 1.0 — December 2025**

*A living document for Mirror Factory / Layers development*

> **The Problem**
>
> Claude Code is powerful but under-documented. Practitioners spend weeks discovering patterns that could save them months. Without a comprehensive guide, developers miss advanced techniques like hooks, subagents, context engineering, and autonomous loops that 10x productivity.

> **The Solution**
>
> This guide synthesizes knowledge from Claude Code's creator, top practitioners, and community wisdom into one definitive resource. It covers everything from basic context management to advanced patterns like Ralph Wiggum autonomous loops and multi-model workflows.

---

## Acknowledgments & Key Resources

This guide synthesizes knowledge from official documentation, creator insights, and hard-won community wisdom. We are deeply grateful to the following contributors and resources:

### Primary Sources

| Contributor | Resource | Why It Matters |
|-------------|----------|----------------|
| **Boris Cherny** ([@bcherny](https://x.com/bcherny)) | Creator of Claude Code | Shipped 259 PRs with 40,000+ lines in one month using hooks |
| **Sankalp** ([@dejavucoder](https://x.com/dejavucoder)) | [Claude Code 2.0 Deep Dive](https://sankalp.bearblog.dev/my-experience-with-claude-code-20-and-how-to-get-better-at-using-coding-agents/) | Most comprehensive practitioner's guide with context engineering insights |
| **Andrej Karpathy** ([@karpathy](https://x.com/karpathy)) | [2025 LLM Year in Review](https://karpathy.bearblog.dev/year-in-review-2025/) | Philosophy on AI-assisted coding workflows |
| **McKay Wrigley** ([@mckaywrigley](https://x.com/mckaywrigley)) | X/Twitter threads | Speculative branching and Opus 4.5 patterns |
| **Geoffrey Huntley** | [Ralph Wiggum Technique](https://ghuntley.com/ralph/) | Original autonomous loop methodology |
| **Anthropic Engineering** | [Best Practices Guide](https://www.anthropic.com/engineering/claude-code-best-practices) | Official patterns and recommendations |

### Community Resources

- [Awesome Claude Code](https://awesomeclaude.ai) — Curated commands, workflows, Ralph Wiggum plugin
- [awesome-claude-code GitHub](https://github.com/hesreallyhim/awesome-claude-code) — 16.9k+ stars, community contributions
- [r/ClaudeCode](https://reddit.com/r/ClaudeCode) — Dedicated subreddit for practitioners
- [Claude Code System Prompts](https://github.com/Piebald-AI/claude-code-system-prompts) — Reverse-engineered internals

**→ Full resource links available in [Appendix A: Complete Resource Directory](#appendix-a-complete-resource-directory)**

---

## Table of Contents

1. [Philosophy: The Three Pillars of AI Augmentation](#philosophy-the-three-pillars-of-ai-augmentation)
2. [Context Engineering Fundamentals](#context-engineering-fundamentals)
3. [Hooks: Enabling Continuous Autonomous Operation](#hooks-enabling-continuous-autonomous-operation)
4. [The Ralph Wiggum Technique: Autonomous Loop Patterns](#the-ralph-wiggum-technique-autonomous-loop-patterns)
5. [Subagents: Isolated Context and Specialized Expertise](#subagents-isolated-context-and-specialized-expertise)
6. [Skills: On-Demand Specialized Capabilities](#skills-on-demand-specialized-capabilities)
7. [MCPs: Model Context Protocol Integrations](#mcps-model-context-protocol-integrations)
8. [CLAUDE.md: Your Project's Constitution](#claudemd-your-projects-constitution)
9. [Commands and Workflows](#commands-and-workflows)
10. [Configuration and Team Setup](#configuration-and-team-setup)
11. [Agentic Coding Patterns from Power Users](#agentic-coding-patterns-from-power-users)
12. [Prompt Engineering for Claude Code](#prompt-engineering-for-claude-code)
13. [Security Considerations and Sandboxing](#security-considerations-and-sandboxing)
14. [Common Pitfalls and How to Avoid Them](#common-pitfalls-and-how-to-avoid-them)
15. [Performance and Cost Optimization](#performance-and-cost-optimization)
16. [December 2025 Feature Highlights](#december-2025-feature-highlights)
17. [Appendix A: Complete Resource Directory](#appendix-a-complete-resource-directory)

---

## Philosophy: The Three Pillars of AI Augmentation

Before diving into features, understand the meta-framework. Sankalp articulates what Karpathy struggled with in his "keeping up" tweet:

### Pillar 1: Stay Updated with Tooling

Use these tools regularly and keep up with releases. Weekly or monthly reviews of changelogs help, but daily usage builds intuition. Claude Code dominates the CLI coding experience, and **learning how things work here directly transfers to other tools** (Codex, OpenCode, Amp CLI, Cursor).

### Pillar 2: Upskill in Your Domain

Domain knowledge leads to better prompts. Boris Cherny: *"Better judgement helps find shorter paths, acting as a multiplier."*

Since implementation is faster now, spend more time on:
- Taste refinement and design decisions
- System design and planning
- Understanding requirements deeply
- Good software practices that create feedback loops for LLMs (naming, refactoring, docs, tests, typed annotations)

### Pillar 3: Play More with an Open Mind

Try tasks you think won't work. Ask models to do things, even ones you doubt they can handle. You'll be surprised. Once you do this enough, you develop intuition.

> "The map is not the territory." — Sankalp
>
> Don't treat guides as prescriptions. Understand the thought processes, then adapt to your context.

---

## Context Engineering Fundamentals

**This is the most important section for understanding why things work.** Context engineering is the art and science of curating what goes into the limited context window.

### Why Agents Are Token Guzzlers

Both tool calls AND tool results stay in context because **LLMs are stateless**:

```
Context window accumulation:
├─ User: "Make a landing page for my coffee shop"
│
├─ Assistant: [tool_call: web_search("coffee shop design")]
├─ Tool result: [10 results with snippets]           ← ~1.5K tokens
│
├─ Assistant: [tool_call: read_file("brand-guidelines.pdf")]
├─ Tool result: [extracted text, colors, fonts]     ← ~4K tokens
│
├─ Assistant: [tool_call: create_file("landing-page.html")]
├─ Tool result: [success, 140 lines]                ← ~50 tokens
│
├─ Assistant: [tool_call: edit_file("landing-page.html")]
├─ Tool result: [diff: added hero image]            ← ~300 tokens
│
└─ Total: ~6K+ tokens for one task. Everything stays.
```

The tool call results can quickly fill your context—this is why agents get expensive.

### Context Rot / Degradation

> "Think of context as a limited 'attention budget'. Performance degrades as every new token is introduced." — Sankalp

**The Rule of Thumb:** Effective context windows are **50-60% of stated capacity**. Don't start complex tasks when you're halfway through the conversation.

- Opus 4.5: 200K window → effective ~100-120K
- GPT-5.2: 400K window → effective ~200-240K

### Context Management Strategies

| Strategy | When to Use | Command |
|----------|-------------|---------|
| **Clear** | Between unrelated tasks | `/clear` |
| **Compact** | At ~60% capacity for complex work | `/compact` |
| **Handoff** | Session transitions | Custom `/handoff` command |
| **Check Usage** | Periodically during complex tasks | `/context` |

### System Reminders: How Claude Code Manages Attention

Claude Code injects `<system-reminder>` tags into user messages and tool results. This implements what Manus described as "Manipulate Attention Through Recitation":

> "By constantly rewriting the todo list, Manus is reciting its objectives into the end of the context. This pushes the global plan into the model's recent attention span, avoiding 'lost-in-the-middle' issues."

Claude Code does the same with todo files and system reminders—repeatedly injecting objectives to combat context degradation.

### The Attention Insight for Subagents

When the Explore subagent returns summaries, that's **lossy compression**. For complex tasks:

> "It's important that the model goes through each of the relevant files itself so that all that ingested context can attend to each other." — Sankalp

When Opus 4.5 reads files directly, it builds proper attention relationships. Summaries lose pairwise relationships.

---

## Hooks: Enabling Continuous Autonomous Operation

Hooks are callback functions that execute at specific lifecycle events during Claude's agent loop. Unlike tools that Claude invokes, hooks are invoked by the CLI itself—enabling automation, CI/CD integration, and the continuous operation patterns that powered Boris Cherny's month-long production run.

### Hook Events Reference

| Event | When It Fires | Primary Use Cases |
|-------|---------------|-------------------|
| **PreToolUse** | Before processing a tool call | Validation, blocking dangerous operations |
| **PostToolUse** | After tool completes successfully | Auto-formatting, logging, quality checks |
| **Stop** | When main agent finishes responding | Continue workflows, run tests, notifications |
| **SubagentStop** | When subagent finishes | Validate subagent results |
| **PermissionRequest** | When permission dialog shown | Auto-approve/deny permissions |
| **UserPromptSubmit** | Before Claude processes prompt | Context injection, prompt validation |
| **SessionStart/End** | Session lifecycle | Environment setup, cleanup, logging |
| **Notification** | When Claude needs input | Desktop notifications, webhooks |

### Configuration Locations

Hooks are configured in settings files with clear precedence:

```
~/.claude/settings.json          → User settings (all projects)
.claude/settings.json            → Project settings (team shared, version controlled)
.claude/settings.local.json      → Local project settings (gitignored)
```

### The Stop Hook Pattern: Continuous Operation

Boris Cherny's breakthrough came from **test-driven stop hooks** that make Claude keep working until tasks complete:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "npm test || echo 'Tests failed, please fix'"
      }]
    }]
  }
}
```

When tests fail, Claude receives the error output and automatically continues fixing—enabling runs that span "minutes, hours, and days at a time."

**Key insight:** Exit code 2 with stderr feeds errors back to Claude rather than stopping.

### Production Hook Examples

**Auto-format after edits:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "prettier --write \"$CLAUDE_FILE_PATHS\" && eslint --fix \"$CLAUDE_FILE_PATHS\""
      }]
    }]
  }
}
```

**Block dangerous operations:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "if [[ \"$CLAUDE_TOOL_INPUT\" == *\"rm -rf\"* ]]; then echo 'Blocked' && exit 2; fi"
      }]
    }]
  }
}
```

**Desktop notifications when attention needed:**
```json
{
  "hooks": {
    "Notification": [{
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"Claude needs attention\" with title \"Claude Code\"'"
      }]
    }]
  }
}
```

**Play sound when Claude stops (Sankalp's first hook):**
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "afplay /path/to/notification.mp3"
      }]
    }]
  }
}
```

### Hook Environment Variables

Hooks receive context through environment variables:

| Variable | Description |
|----------|-------------|
| `$CLAUDE_TOOL_NAME` | Name of the tool being called |
| `$CLAUDE_TOOL_INPUT` | Input parameters to the tool |
| `$CLAUDE_FILE_PATHS` | Files being operated on |
| `$CLAUDE_TOOL_OUTPUT` | Tool output (PostToolUse only) |
| `$CLAUDE_PROJECT_DIR` | Current project directory |
| `$CLAUDE_NOTIFICATION` | Notification content |

---

## The Ralph Wiggum Technique: Autonomous Loop Patterns

Named after The Simpsons character, Ralph Wiggum embodies the philosophy of **persistent iteration despite setbacks**. It's now an official Anthropic plugin.

### Core Philosophy

```bash
while :; do cat PROMPT.md | claude ; done
```

This deceptively simple loop embodies profound principles:

| Principle | Meaning |
|-----------|---------|
| **Iteration > Perfection** | Don't aim for perfect on first try. Let the loop refine. |
| **Failures Are Data** | Deterministic failures are predictable and informative. |
| **Operator Skill Matters** | Success depends on writing good prompts, not just having a good model. |
| **Persistence Wins** | Keep trying until success. The loop handles retry logic. |

### Real-World Results

- **6 repositories** generated overnight at Y Combinator hackathon
- **$50k contract** delivered for $297 in API costs
- **CURSED programming language** created over 3 months

### Quick Start

```bash
# Install the plugin
/plugin install ralph-wiggum@anthropics

# Start a loop
/ralph-loop "Build a hello world API" --completion-promise "DONE" --max-iterations 10
```

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--max-iterations <n>` | Stop after N iterations (safety net) | unlimited |
| `--completion-promise "<text>"` | Phrase that signals completion | required |

### Prompt Writing Best Practices for Ralph

**Bad prompt:**
```
Build a todo API and make it good.
```

**Good prompt:**
```
Build a REST API for todos.

When complete:
- All CRUD endpoints working
- Input validation in place
- Tests passing (coverage > 80%)
- README with API docs
- Output: <promise>COMPLETE</promise>
```

### Ready-to-Use Templates

**TDD Development Loop:**
```bash
/ralph-loop "Implement [FEATURE] using TDD.

Process:
1. Write failing test for next requirement
2. Implement minimal code to pass
3. Run tests
4. If failing, fix and retry
5. Refactor if needed
6. Repeat for all requirements

Requirements: [LIST]

Output <promise>DONE</promise> when all tests green." --max-iterations 50 --completion-promise "DONE"
```

**Bug Fixing Loop:**
```bash
/ralph-loop "Fix bug: [DESCRIPTION]

Steps:
1. Reproduce the bug
2. Identify root cause
3. Implement fix
4. Write regression test
5. Verify fix works
6. Check no new issues introduced

After 15 iterations if not fixed:
- Document blocking issues
- List attempted approaches
- Suggest alternatives

Output <promise>FIXED</promise> when resolved." --max-iterations 20 --completion-promise "FIXED"
```

**Refactoring Loop:**
```bash
/ralph-loop "Refactor [COMPONENT] for [GOAL].

Constraints:
- All existing tests must pass
- No behavior changes
- Incremental commits

Checklist:
- [ ] Tests passing before start
- [ ] Apply refactoring step
- [ ] Tests still passing
- [ ] Repeat until done

Output <promise>REFACTORED</promise> when complete." --max-iterations 25 --completion-promise "REFACTORED"
```

### The Prompt Tuning Technique

1. **Start with no guardrails** — Let Ralph build the playground first
2. **Add signs when Ralph fails** — When Ralph falls off the slide, add a sign: "SLIDE DOWN, DON'T JUMP"
3. **Iterate on failures** — Each failure teaches you what guardrails to add
4. **Eventually get a new Ralph** — Once prompts are tuned, the defects disappear

### Advanced: Combining with Git Worktrees

Run multiple Ralph loops in parallel on different branches:

```bash
# Create isolated worktrees
git worktree add ../project-feature1 -b feature/auth
git worktree add ../project-feature2 -b feature/api

# Terminal 1
cd ../project-feature1
/ralph-loop "Implement authentication..." --max-iterations 30

# Terminal 2 (simultaneously)
cd ../project-feature2
/ralph-loop "Build REST API..." --max-iterations 30
```

### When to Use Ralph

**Good For:**
- Well-defined tasks with clear success criteria
- Tasks requiring iteration (getting tests to pass)
- Greenfield projects where you can walk away
- Tasks with automatic verification (tests, linters)
- Overnight/weekend automated development

**Not Good For:**
- Tasks requiring human judgment or design decisions
- One-shot operations needing immediate results
- Tasks with unclear or subjective success criteria
- Production debugging (use targeted debugging)
- Tasks requiring external approvals

---

## Subagents: Isolated Context and Specialized Expertise

Subagents are separate Claude instances spawned by the main agent with their own context windows, specialized system prompts, and configurable tool access.

### Why Subagents Matter

They solve **context pollution**—loading too much into one conversation.

Boris Cherny uses a sophisticated **multi-subagent code review pattern**:
1. **First pass (5+ subagents)**: One checks style, another combs history, another flags bugs
2. **Second pass (5 more subagents)**: Specifically poke holes in findings to eliminate false positives

Result: "It finds all the real issues without the false ones."

### How Subagents Spawn: The Task Tool

Subagents are spawned via the Task tool. The schema:

```json
{
  "description": "string",     // 3-5 word task description
  "prompt": "string",          // Task for agent to perform
  "subagent_type": "string",   // Explore, Plan, general-purpose, etc.
  "model": "string",           // sonnet, opus, haiku (optional)
  "run_in_background": "boolean",
  "resume": "string"           // Agent ID for continuation
}
```

When you say "Use Explore with Sonnet", the model makes the tool call with `model: "sonnet"`.

### Built-in Subagent Types

| Type | Tools | Context | Use Case |
|------|-------|---------|----------|
| **Explore** | Read, Grep, Glob, limited Bash | Fresh (no inheritance) | Fast codebase searching |
| **Plan** | All tools | Full inheritance | Implementation planning |
| **general-purpose** | All tools | Full inheritance | Complex multi-step tasks |
| **claude-code-guide** | Glob, Grep, Read, WebFetch, WebSearch | Fresh | Documentation lookup |

### The Explore Agent Deep Dive

Explore is read-only and optimized for speed. Key behaviors:
- Uses Haiku by default for fast responses
- Can spawn multiple parallel tool calls
- Returns summaries (which are lossy—see context engineering section)
- Specify thoroughness: "quick", "medium", "very thorough"

**Tip:** Tell Claude "Launch explore agent with Sonnet 4.5" for more thorough exploration.

### Creating Custom Subagents

Place markdown files in `.claude/agents/` (project) or `~/.claude/agents/` (user):

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use PROACTIVELY after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: default
---

You are a senior code reviewer specializing in security and performance.

When reviewing code:
1. Check for security vulnerabilities (injection, XSS, auth issues)
2. Identify performance bottlenecks and N+1 queries
3. Flag violations of project conventions in CLAUDE.md
4. Suggest specific improvements with code examples
```

Or use `/agents` to manage and create subagents automatically.

### Tool Access Patterns

| Subagent Type | Recommended Tools |
|---------------|-------------------|
| Read-only reviewers | `Read, Grep, Glob` |
| Research agents | `Read, Grep, Glob, WebFetch, WebSearch` |
| Code writers | `Read, Write, Edit, Bash, Glob, Grep` |

### Background Agents for Debugging

The `run_in_background` parameter sends tasks to run asynchronously. Super helpful for:
- Monitoring log outputs
- Long-running scripts
- Debugging processes

Model usually decides automatically, but you can explicitly request: "Run this in background."

---

## Skills: On-Demand Specialized Capabilities

Skills are organized folders of instructions, scripts, and resources that Claude loads **dynamically**. Unlike slash commands (user-invoked), skills are **model-invoked**—Claude autonomously decides when to use them.

### The Matrix Analogy

> Skills load on-demand, just like Neo downloading kung fu in The Matrix (1999). — Sankalp

Normally, teaching domain expertise requires writing everything in the system prompt. With skills, the model loads it on-demand, avoiding context bloat.

### Skill Structure

```
.claude/skills/pdf-processor/
├── SKILL.md          # Required: metadata + instructions
├── reference.md      # Optional: additional documentation
└── scripts/
    └── extract.py    # Optional: executable helpers
```

### SKILL.md Format

```markdown
---
name: pdf-processor
description: Extract text and tables from PDF files. Use when working with PDF documents.
---

## Instructions
1. Use `pdftotext` for text extraction
2. Use `tabula-py` for table extraction
3. Output structured data as JSON

## Example usage
[Include concrete examples Claude can follow]
```

**Anthropic recommends:** Keep skill.md under 500 lines.

### Skill Locations and Precedence

| Location | Scope | Priority |
|----------|-------|----------|
| `.claude/skills/skill-name/SKILL.md` | Project | Highest |
| `~/.claude/skills/skill-name/SKILL.md` | User | Medium |
| Plugin skills | Installed | Lowest |

### Pre-built Skills from Anthropic

Install via plugins:
- **PDF processing**
- **DOCX with tracked changes**
- **PPTX presentations**
- **XLSX with formulas**
- **frontend-design** — Creates distinctive, non-generic UIs

Access at: https://github.com/anthropics/skills

### Plugins: Bundled Distribution

Plugins bundle skills, slash commands, subagents, hooks, and MCP servers into a single distributable unit:

```bash
/plugins                    # Manage plugins
/my-plugin:hello           # Namespaced commands
```

### MCP Code Execution: Skills Philosophy Applied

From Anthropic's engineering blog:

> "As MCP usage scales, tool definitions overload the context window and intermediate tool results consume additional tokens."

The elegant solution: **expose code APIs rather than tool definitions**. Give Claude a sandbox execution environment with a filesystem, then let it write code to make tool calls. This is the skills philosophy taken further.

---

## MCPs: Model Context Protocol Integrations

MCP is an open standard for AI-tool integrations. MCP servers give Claude Code access to external tools, databases, APIs, and services.

### Adding MCP Servers

**HTTP/Remote servers (recommended for cloud services):**
```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

**Local stdio servers:**
```bash
claude mcp add --transport stdio github \
  --env GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx \
  -- npx -y @modelcontextprotocol/server-github
```

### Essential MCP Servers

| Server | Purpose | Why Essential |
|--------|---------|---------------|
| **GitHub** | PR management, issues, CI/CD | "The most essential server" for dev workflows |
| **Puppeteer/Playwright** | Browser automation, screenshots | Visual testing, UI iteration loops |
| **Context7** | Real-time documentation | Up-to-date library info |
| **Sentry** | Error monitoring | Production debugging |
| **Sequential Thinking** | Complex reasoning | Methodical problem breakdown |
| **Perplexity/Brave Search** | Web research | Information gathering |

### MCP Scopes

| Scope | Location | Use Case |
|-------|----------|----------|
| `local` | `~/.claude.json` (project path) | Default, private to you |
| `project` | `.mcp.json` | Shared with team (version controlled) |
| `user` | `~/.claude.json` | Available across all projects |

### Project .mcp.json for Team Sharing

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DB_URL}"]
    }
  }
}
```

### MCP Best Practices

- **Limit to 2-3 targeted MCPs** for optimal startup performance—each server adds to context overhead
- Use `/mcp` to verify connection status
- Only install MCP servers from trusted providers
- Tool definitions are loaded upfront into context, bloating it—be selective

---

## CLAUDE.md: Your Project's Constitution

CLAUDE.md is Claude's primary source of truth for how your repository works. It's automatically loaded into context when starting conversations.

### File Hierarchy and Loading

| Location | Scope | Loading Behavior |
|----------|-------|------------------|
| `~/.claude/CLAUDE.md` | Global | Always loaded |
| `./CLAUDE.md` | Project root | Loaded for project |
| `./src/CLAUDE.md` | Subdirectory | Loaded when working in that directory |
| `.claude/rules/*.md` | Modular rules | All files loaded |

### The Critical Insight: Less Is More

Claude can reliably follow ~150-200 instructions. Community consensus and Anthropic guidance both emphasize: **keep CLAUDE.md concise**. Every token consumes context on every conversation.

### Recommended Template

```markdown
# Project Context

## About
FastAPI REST API for user authentication. SQLAlchemy + PostgreSQL.

## Key Directories
- `app/models/` - Database models
- `app/api/` - Route handlers  
- `app/core/` - Configuration, utilities

## Commands
- `pnpm dev` - Start development
- `pnpm test` - Run tests
- `pnpm lint` - ESLint check

## Code Standards
- Type hints required on all functions
- pytest conventions for testing
- 2-space indentation for TypeScript

## Repository Etiquette
- Branch: `feature/TICKET-123-description`
- Commits: conventional commits format
```

### Advanced: Dividing Instructions into Skill Files

From a Reddit power user with 6 months of Claude Code usage:

> "Anthropic recommends keeping skill.md under 500 lines so we divided it into separate files and combined with hooks."

Pattern:
1. Keep CLAUDE.md minimal (core context only)
2. Move domain expertise to skill files
3. Use hooks to remind the model about skills when relevant
4. Load domain expertise on-demand

### Self-Updating Pattern

When Claude makes mistakes, ask: "How can you modify CLAUDE.md to prevent this issue in future?"

This creates a learning loop that improves project context over time.

### Karpathy's Observation

> "I haven't figured out a good way to keep CLAUDE.md good or up to date."

This remains an open challenge—treat it as living documentation requiring periodic reviews.

---

## Commands and Workflows

### Essential Slash Commands

| Command | Purpose |
|---------|---------|
| `/help` | Show all available commands |
| `/clear` | Clear conversation history (use between unrelated tasks) |
| `/compact` | Compress context when reaching capacity |
| `/init` | Auto-generate initial CLAUDE.md |
| `/model` | Switch models interactively |
| `/mcp` | Check MCP server status |
| `/agents` | Manage subagents |
| `/permissions` | Manage tool permissions |
| `/resume` | Resume previous sessions |
| `/rename` | Name current session for later resumption |
| `/context` | See current context usage |
| `/usage` | See API usage |
| `/stats` | See session statistics |
| `/rewind` | Go back to a checkpoint (also `Esc` + `Esc`) |

### Custom Slash Commands

Create in `.claude/commands/` (project) or `~/.claude/commands/` (personal):

**Fix GitHub issue command:**
```markdown
<!-- .claude/commands/fix-issue.md -->
---
description: Fix a GitHub issue
allowed-tools: Bash(gh *), Read, Write, Edit
---

Fix issue #$ARGUMENTS:
1. Use `gh issue view $ARGUMENTS` to get details
2. Search codebase for relevant files
3. Implement the fix
4. Write and run tests
5. Create commit with conventional message
6. Push and create PR
```

Usage: `/project:fix-issue 1234`

**Handoff command (Sankalp's pattern):**
```markdown
<!-- .claude/commands/handoff.md -->
---
description: Create handoff document for session transition
---

Create a handoff document summarizing:
1. What we accomplished this session
2. Current state of the work
3. Next steps and open questions
4. Any blockers or issues encountered

Save to `HANDOFF.md` in the project root.
```

### Boris Cherny's Favorite Commands

- **/commit** — Automated commit workflow with auto-approval
- **/feature-dev** — "First ask me what exactly I want, build the specification, then build a detailed plan, make a to-do list, walk through step-by-step"
- **/code-review** — Automated first-pass PR reviews

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+R` | Search prompt history (across project conversations) |
| `Ctrl+C` | Cancel current operation |
| `Shift+Tab` | Toggle plan mode |
| `Tab` | Accept prompt suggestions |
| `Esc` | Interrupt and redirect Claude |
| `Esc` + `Esc` | Rewind to checkpoint |
| `Alt/Option+P` | Quick model switch |
| `Shift+?` | Show all shortcuts |

### The Universal Workflow

Anthropic and community consensus converge on this pattern:

1. **Read**: Have Claude read relevant files without writing yet
2. **Investigate**: Use subagents to verify details early
3. **Plan**: Use thinking keywords (`think`, `think hard`, `ultrathink`)
4. **Execute**: Implement with auto-accept mode (Shift+Tab)
5. **Review**: Use Esc to course-correct
6. **Commit**: Ask Claude to commit with proper messages

---

## Configuration and Team Setup

### Settings File Hierarchy

```
~/.claude/settings.json           → User settings (all projects)
.claude/settings.json             → Project settings (team shared)
.claude/settings.local.json       → Local project settings (gitignored)
Enterprise managed settings       → Cannot be overridden
```

### Permission Configuration

```json
{
  "permissions": {
    "allow": ["Bash(npm run:*)", "Bash(git status)"],
    "ask": ["Bash(git push:*)"],
    "deny": ["Read(./.env*)", "Bash(rm -rf:*)"]
  }
}
```

### CLI Flags Reference

```bash
claude                                    # Interactive mode
claude "prompt"                           # Start with prompt
claude -p "prompt"                        # Print mode (one-shot, non-interactive)
claude --continue                         # Continue last session
claude --resume                           # Resume specific session
claude --resume <name>                    # Resume named session
claude --model opus                       # Start with specific model
claude --mcp-debug                        # Debug MCP issues
claude --dangerously-skip-permissions     # Skip prompts (containers only!)
claude --add-dir /path                    # Add directories to context
```

### Model Selection

| Alias | Model | Best For |
|-------|-------|----------|
| `sonnet` | Claude Sonnet 4.5 | Default, balanced |
| `opus` | Claude Opus 4.5 | Complex tasks, best quality |
| `haiku` | Claude Haiku 4.5 | Fast, lightweight |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API authentication |
| `CLAUDE_CODE_SHELL` | Override shell detection |
| `MAX_MCP_OUTPUT_TOKENS` | MCP output limit (default: 25000) |

### Shared Configuration Checklist

**Version control these files:**
- `CLAUDE.md` — Project guidelines
- `.mcp.json` — MCP server configs
- `.claude/commands/` — Custom slash commands
- `.claude/settings.json` — Project permissions
- `.claude/agents/` — Custom subagents
- `.claude/skills/` — Project skills

**Keep local (gitignored):**
- `CLAUDE.local.md`
- `.claude/settings.local.json`

---

## Agentic Coding Patterns from Power Users

### Karpathy's Three-Tier Workflow

**Layer 1: Tab autocomplete (~75% of coding)**

Writing concrete code chunks is a "high bandwidth way of communicating task specification"—faster than natural language.

**Layer 2: Claude Code (for larger functional blocks)**

Excellent in unfamiliar territories. Creates "post-code-scarcity era"—code is no longer precious.

> "CC can hammer out 1,000 lines of one-off visualization code just to identify a specific bug, which gets all deleted right after."

**Layer 3: Emergency escalation**

For bugs Claude Code can't solve after 10 minutes—deep literature reviews, complex abstractions.

### Sankalp's Workflow

**Setup:** Claude Code as main driver, Codex for review and difficult tasks, Cursor for reading code and manual edits.

**The "Throw-away First Draft" Pattern:**
1. Create a new branch and let Claude write the feature end-to-end while observing
2. Compare against mental model—where did it diverge?
3. Learn Claude's biases from context
4. Run second iteration with sharper prompts informed by first pass

> "Kinda like Tenet."

**Two-Model Review Strategy:**
> "For reviewing code and finding bugs, I find GPT-5.2-Codex to be superior. Just use `/review`."

The "Claude for execution, GPT/o-series for review" dynamic has been consistent.

### McKay Wrigley's Speculative Branching

> "In the real-world you'd never ask 5 devs to build the same feature and then pick from the best one. But with AI, it's a no-brainer. Opus 4.5 excels at speculative branching, explaining tradeoffs between approaches, and working with you to pick the best one."

### Multi-Instance Workflow

Run multiple Claude Code instances in different terminal tabs:
- Use "cascade" method: oldest tasks left, newest right, sweep left-to-right
- Focus on **3-4 tasks maximum**
- Use git worktrees for parallel branch work

### Test-Driven Development Pattern

1. Ask Claude to write tests based on expected I/O pairs (be explicit about TDD to avoid mocks)
2. Confirm tests fail before writing implementation
3. Commit tests separately
4. Ask Claude to write code that passes tests
5. Iterate until all tests pass

### Visual Iteration for UI Work

1. Give Claude screenshot capability via Puppeteer MCP
2. Provide visual mocks via paste/drag-drop
3. Claude implements → screenshots result → iterates until matching mock

---

## Prompt Engineering for Claude Code

### Specificity Is Critical

| Poor Prompt | Good Prompt |
|-------------|-------------|
| "add tests for foo.py" | "write test case for foo.py covering edge case where user is logged out, avoid mocks" |
| "add a calendar widget" | "look at HotDogWidget.php pattern, then implement calendar widget with month selection and pagination, no external libraries" |

### Thinking Mode Triggers

These phrases map to increasing thinking budgets:

| Phrase | Token Budget |
|--------|--------------|
| `"think"` | 4,000 tokens |
| `"think hard"` / `"think deeply"` | 10,000 tokens |
| `"think harder"` / `"ultrathink"` | 31,999 tokens |

Don't default to ultrathink—it wastes tokens on simple tasks.

### Plan Mode Philosophy

Boris Cherny:
> "People new to coding with AI agents often start with the assumption that Claude Code can one-shot anything, but that's not realistic. You can **double or triple your chances of success** on complex tasks by switching to plan mode."

Toggle with `Shift+Tab` or use `--permission-mode plan`.

### The Pseudocode Technique

McKay Wrigley:
> "Sometimes writing in pseudocode in the actual codebase can be unbelievably helpful. Opus 4.5 is astonishingly good at inferring what you mean when you write in pseudocode and building it out."

### Opus 4.5 Strengths

- Faster feedback loops (both thinking and throughput)
- Superior communication and pair-programming
- Better intent-detection than competitors
- Excellent at explaining with ASCII diagrams
- Great writer—preferred for customizing prompts

---

## Security Considerations and Sandboxing

### Core Security Model

- **Read-only by default**: Explicit permission required for modifications
- **Write restriction**: Can only write to working directory and subdirectories
- **Sandboxing**: OS-level primitives (Linux bubblewrap, macOS seatbelt)

### Essential Permission Denials

```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",
      "Read(~/.ssh/*)",
      "Read(~/.aws/*)",
      "Bash(rm -rf:*)",
      "Bash(curl:*)",
      "Bash(wget:*)"
    ]
  }
}
```

### The rm -rf Disaster

Horror stories on r/ClaudeAI of Claude deleting entire home directories.

**Prevention:** Always include `"deny": ["Bash(rm -rf:*)"]` in permissions.

### Container Isolation

Use `--dangerously-skip-permissions` **only** in Docker containers without network access.

### Built-in Sandboxing

Use `/sandbox` command for OS-level sandboxing. Reduces permission prompts by **84%** while maintaining security.

### Security Best Practices

1. Never run Claude Code as root
2. Use VMs or containers for untrusted operations
3. Disable all hooks if processing untrusted content
4. Only enable trusted MCP servers explicitly
5. Use GitHub Fine-grained PATs instead of full SSH access
6. Keep Claude Code on latest version
7. Audit permissions monthly

---

## Common Pitfalls and How to Avoid Them

### Context Management Failures

**Problem:** Long conversations lead to degraded performance ("context pollution").

**Solutions:**
- Use `/clear` frequently between tasks
- Create handoff documents for session transitions
- Use subagents for token-heavy operations
- Monitor with `/context`, act at 60% capacity

### Permission Fatigue

**Problem:** Constant interruptions asking "Can I edit this file?"

**Solutions:**
- Configure `allowedTools` in settings
- Use auto-accept mode (Shift+Tab) for trusted operations
- Use sandboxing to reduce prompts by 84%

### One-Shotting Complex Tasks

**Problem:** Assuming Claude can handle complex tasks in a single prompt.

**Solution:** Always use plan mode for complex tasks. Boris Cherny: "You can double or triple your chances of success."

### Letting Claude Go Off-Track

**Problem:** Not interrupting when Claude heads in the wrong direction.

**Solution:** Use Esc liberally to redirect. Karpathy: "I don't run in YOLO mode because they can go off-track and do dumb things."

### Code Taste Issues

**Problem:** AI code often lacks "taste"—too defensive, over-complicated abstractions, bloated.

**Solution:** Review all generated code, do cleanup passes, don't accept blindly. Karpathy: "They basically don't have a sense of taste."

### CLAUDE.md Becoming Stale

**Problem:** Documentation drifts from reality.

**Solution:** Update after major features/refactors, use the self-updating pattern when errors occur.

### Summaries Losing Information

**Problem:** Relying on Explore agent summaries for complex tasks.

**Solution:** Have the main agent read files directly so attention can attend to all context.

---

## Performance and Cost Optimization

### Token Management Strategies

- Keep CLAUDE.md concise (under 300 lines ideal)
- Use explicit file paths instead of reading entire directories
- Disable unused MCP servers (`/mcp` to review)
- Use subagents for exploration (content doesn't bloat main thread)
- Monitor with `/context`
- Remember: effective context is 50-60% of stated capacity

### Workflow Efficiency

- Plan mode for exploration before coding
- Auto-accept mode for trusted operations
- Git worktrees for parallel sessions
- Custom slash commands for repeatable workflows

### Cost Expectations

- Daily costs typically **$5-10 per developer** for active use
- Power users at Anthropic spend **$1,000+/month** for intensive migration work
- Ralph Wiggum can deliver $50k contracts for $297 in API costs

---

## December 2025 Feature Highlights

Recent additions that change workflows:

| Feature | Version | Impact |
|---------|---------|--------|
| **Named sessions** | 2.0.70+ | `/rename` and resume by name for project continuity |
| **Prompt suggestions** | 2.0.73 | Tab to accept context-aware suggestions |
| **Prompt history search** | 2.0.74 | `Ctrl+R` searches across project conversations |
| **Syntax highlighting** | 2.0.71 | Code diffs rendered with syntax colors |
| **Checkpointing** | 2.0.60+ | `/rewind` or `Esc+Esc` to restore previous states |
| **Background agents** | 2.0.60+ | Async operations with wake-up messaging |
| **VS Code Extension** | - | Native IDE integration with inline diffs |
| **Claude in Chrome (Beta)** | - | Browser control via Chrome extension |
| **Modular rules** | - | `.claude/rules/*.md` directory support |
| **Wildcard MCP permissions** | - | `mcp__server__*` syntax for flexible access |
| **LSP support** | - | Access via plugins |
| **Cursor cycling** | 2.0.73 | Navigate at prompt boundaries |

---

## Appendix A: Complete Resource Directory

### Official Documentation

| Resource | URL |
|----------|-----|
| Claude Code Docs | https://code.claude.com/docs/en/ |
| Best Practices Guide | https://www.anthropic.com/engineering/claude-code-best-practices |
| Context Engineering | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| Building Effective Agents | https://www.anthropic.com/engineering/building-effective-agents |
| Code Execution with MCP | https://www.anthropic.com/engineering/code-execution-with-mcp |
| Sandboxing Guide | https://www.anthropic.com/engineering/claude-code-sandboxing |
| GitHub Repository | https://github.com/anthropics/claude-code |
| Changelog | https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md |
| Skills Repository | https://github.com/anthropics/skills |
| GitHub Action | https://github.com/anthropics/claude-code-action |

### Key Blog Posts & Guides

| Author | Resource | URL |
|--------|----------|-----|
| Sankalp | Claude Code 2.0 Guide | https://sankalp.bearblog.dev/my-experience-with-claude-code-20-and-how-to-get-better-at-using-coding-agents/ |
| Sankalp | July 2025 Guide | https://sankalp.bearblog.dev/my-claude-code-experience-after-2-weeks-of-usage/ |
| Sankalp | Prompt Caching Deep Dive | https://sankalp.bearblog.dev/how-prompt-caching-works/ |
| Karpathy | 2025 LLM Year in Review | https://karpathy.bearblog.dev/year-in-review-2025/ |
| Geoffrey Huntley | Ralph Wiggum Original | https://ghuntley.com/ralph/ |
| Armin Ronacher | What is Plan Mode? | https://lucumr.pocoo.org/2025/12/17/what-is-plan-mode/ |
| Manus | Context Engineering Lessons | https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus |
| HumanLayer | Writing a Good CLAUDE.md | https://www.humanlayer.dev/blog/writing-a-good-claude-md |
| Chroma | Context Rot Research | https://research.trychroma.com/context-rot |

### Community Resources

| Resource | URL |
|----------|-----|
| Awesome Claude | https://awesomeclaude.ai |
| Ralph Wiggum Plugin | https://awesomeclaude.ai/ralph-wiggum |
| Awesome Claude Code (GitHub) | https://github.com/hesreallyhim/awesome-claude-code |
| Claude Code Hooks Mastery | https://github.com/disler/claude-code-hooks-mastery |
| Claude Squad (Multi-instance) | https://github.com/smtg-ai/claude-squad |
| Neovim Integration | https://github.com/greggh/claude-code.nvim |
| System Prompts (Reverse Engineered) | https://github.com/Piebald-AI/claude-code-system-prompts |
| Ralph Orchestrator | https://github.com/mikeyobrien/ralph-orchestrator |

### Usage Monitoring Tools

| Tool | URL |
|------|-----|
| ccusage | https://github.com/ryoppippi/ccusage |
| ccflare | https://github.com/snipeship/ccflare |

### X/Twitter Accounts to Follow

| Person | Handle | Known For |
|--------|--------|-----------|
| Boris Cherny | [@bcherny](https://x.com/bcherny) | Claude Code creator |
| Andrej Karpathy | [@karpathy](https://x.com/karpathy) | AI workflow philosophy |
| McKay Wrigley | [@mckaywrigley](https://x.com/mckaywrigley) | Speculative branching, tips |
| Sankalp | [@dejavucoder](https://x.com/dejavucoder) | Practitioner insights |
| Amanda Askell | [@AmandaAskell](https://x.com/AmandaAskell) | Claude personality training |

### Community Hubs

| Platform | URL |
|----------|-----|
| r/ClaudeAI | https://reddit.com/r/ClaudeAI |
| r/ClaudeCode | https://reddit.com/r/ClaudeCode |
| Claude Developers Discord | (Official community) |

### Key X/Twitter Threads

| Topic | URL |
|-------|-----|
| Boris on Domain Knowledge | https://x.com/bcherny/status/2004626064187031831 |
| Karpathy on Keeping Up | https://x.com/karpathy/status/2004607146781278521 |
| Karpathy on Workflows | https://x.com/karpathy/status/1959703967694545296 |
| McKay on Opus 4.5 | https://x.com/mckaywrigley/status/1997403303161024895 |
| Boris on Claude Code Origins | https://x.com/i/status/2004887829252317325 |

### Podcasts & Interviews

| Resource | URL |
|----------|-----|
| How to Use Claude Code Like the Builders | https://every.to/podcast/how-to-use-claude-code-like-the-people-who-built-it |
| Boris Cherny Career Interview | https://www.developing.dev/p/boris-cherny-creator-of-claude-code |

---

*This document will continue evolving as Claude Code receives updates. Last updated: December 2025.*

*Maintained by Mirror Factory / Layers team.*
