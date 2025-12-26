# API Dev Tools v3.11 - Claude Code Native Enhancements

**Date:** 2025-12-22
**Focus:** Claude Code ecosystem only (Skills, Subagents, Hooks, MCP servers)
**Goal:** High-quality API/UI development with native Claude Code capabilities

---

## 🎯 Executive Summary

This plan enhances your interview-driven workflow using **ONLY Claude Code's native capabilities** - no competitor analysis, pure ecosystem integration.

###What We're Adding

1. **Skills Hybrid Architecture** - Natural language + slash commands
2. **Subagent Parallel Execution** - 10 parallel tasks (up to 10 concurrent)
3. **Notification MCP Servers** - Discord, Slack, NTFY integrations
4. **Enhanced Hook System** - Better workflow automation
5. **Streamlined Setup** - One-command config with MCP credentials

**Plus:** All 9 original roadmap issues (registry bugs, cost tracking, iterative docs, etc.)

---

## 📚 Research Findings: Claude Code Native Capabilities

### 1. Skills System (Released Oct 2025)

**What Skills Are:**
- **Model-invoked** capabilities (Claude decides when to use them)
- Packaged in folders with `SKILL.md` frontmatter
- Progressive disclosure (name/description pre-loaded, full content on-demand)
- Open standard (adopted by OpenAI for Codex/ChatGPT)

**SKILL.md Format:**

```yaml
---
name: api-development
description: Interview-driven API integration with 13-phase TDD workflow. Triggers on "integrate [API]", "build endpoint", "add API support".
---

# API Development Skill

When user mentions API integration, automatically invoke /hustle-api-create.

## Auto-detection triggers
- "integrate the [X] API"
- "build an endpoint for [X]"
- "add [X] API support"
```

**Directory Structure:**
```
.claude/skills/api-development/
├── SKILL.md              # Core prompt (< 5,000 words)
├── scripts/              # Executable Python/Bash
├── references/           # Documentation loaded into context
└── assets/               # Templates and binary files
```

**Sources:**
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Inside Claude Code Skills Structure](https://mikhail.io/2025/10/claude-code-skills/)
- [Official Skills Repository](https://github.com/anthropics/skills)
- [Claude Agent Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

---

### 2. Subagents & Task Tool

**What Subagents Are:**
- Lightweight Claude Code instances running via the Task tool
- Each has **own context window** (great for large codebases)
- **Parallel execution up to 10** concurrent subagents
- **Context isolation** prevents pollution

**Key Limitation:**
- **No nested spawning** - subagents cannot spawn other subagents (prevents infinite recursion)
- Workaround: Use `claude -p` via Bash (but loses context sharing)

**Recommended Patterns:**

```python
# Good: Parallel research tasks
Task(description="Research Context7",subagent_type="general-purpose")  # Agent 1
Task(description="Research WebSearch", subagent_type="general-purpose")  # Agent 2
# Both run in parallel (up to 10 concurrent)

# Bad: Nested spawning (not supported)
# Subagent tries to spawn another subagent → FAILS
```

**Use Cases for Your Workflow:**
- Phase 3: Spawn 3 subagents for parallel research (Context7 + WebSearch + Greptile)
- Phase 8-9: One subagent writes tests, another reviews schema
- Documentation: One subagent writes docs while another validates examples

**Sources:**
- [Subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Subagent Deep Dive](https://cuong.io/blog/2025/06/24-claude-code-subagent-deep-dive)
- [Task Tool vs Subagents Guide](https://www.icodewith.ai/blog/task-tool-vs-subagents-how-agents-work-in-claude-code/)
- [Practical Guide to Sub-agents](https://jewelhuq.medium.com/practical-guide-to-mastering-claude-codes-main-agent-and-sub-agents-fd52952dcf00)

---

### 3. Hooks System

**What Hooks Are:**
- Python functions invoked at specific Claude agent loop points
- **Deterministic processing** and automated feedback
- Configured in `.claude/settings.json`

**Hook Types Available:**

| Hook | When | Use Case |
|------|------|----------|
| **PreToolUse** | Before any tool runs | Block dangerous ops, validate inputs |
| **PostToolUse** | After tool completes | Auto-format files, log actions |
| **SessionStart** | Session begins | Inject context, load state |
| **SessionEnd** | Session ends | Save state, cleanup |
| **Stop** | Claude finishes responding | Notifications, metrics |
| **UserPromptSubmit** | Before processing prompt | Detect research needs, inject reminders |

**Configuration Example:**

```json
{
  "hooks": {
    "sessionStart": [
      {
        "command": "python",
        "args": [".claude/hooks/session-startup.py"]
      }
    ],
    "postToolUse": [
      {
        "command": "python",
        "args": [".claude/hooks/track-tool-use.py"],
        "matchers": {
          "tools": ["Write", "Edit"]
        }
      }
    ]
  }
}
```

**Your Current Hooks (38 total):**
- Already using hooks extensively
- Can enhance with notification hooks (see Section 4)

**Sources:**
- [Claude Code Hooks Automation](https://www.gend.co/blog/configure-claude-code-hooks-automation)
- [Agent SDK Hooks Documentation](https://docs.claude.com/en/api/agent-sdk/overview)
- [Hook Development Guide](https://claude-plugins.dev/skills/@anthropics/claude-code/hook-development)

---

### 4. Notification MCP Servers

#### Discord MCP Server

**Multiple Options Available:**

**Option 1: Claude Code Discord Notifier (davidlikescat-016)**
- Automatic task completion notifications
- Build completion alerts
- Error notifications
- Rich Discord embeds

**Setup:**
```json
{
  "mcpServers": {
    "discord-notifier": {
      "command": "npx",
      "args": ["-y", "@davidlikescat/discord-mcp"],
      "env": {
        "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/..."
      }
    }
  }
}
```

**Option 2: Discord Notification MCP (kstonekuan)**
- TypeScript-based
- Cloudflare Workers deployment
- `send_discord_message` tool
- Rich formatting + TTS

**CLI Setup:**
```bash
claude mcp add discord-notifier --scope project \\
  --transport stdio \\
  -- npx -y @kstonekuan/discord-notification-mcp
```

**Sources:**
- [Discord Notifier MCP](https://lobehub.com/mcp/davidlikescat-016_discord_mcp)
- [Discord Notification MCP](https://glama.ai/mcp/servers/@kstonekuan/discord-notification-mcp)
- [Discord MCP Server GitHub](https://github.com/v-3/discordmcp)

---

#### Slack MCP Server

**Official Slack MCP:**
- Post messages to channels
- List channels and threads
- Add reactions
- Read messages in real-time

**Setup Process:**

1. **Create Slack App:** https://api.slack.com/apps
2. **Get Bot Token:** OAuth & Permissions → Bot User OAuth Token
3. **Configure Claude Code:**

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "T01234567",
        "SLACK_CHANNEL_IDS": "C01234567,C89012345"
      }
    }
  }
}
```

**CLI Setup:**
```bash
claude mcp add slack --scope user \\
  -- npx -y @modelcontextprotocol/server-slack
```

**Features:**
- Real-time channel summaries
- Post threaded follow-ups
- React to messages
- Access private channels (if authorized)

**Sources:**
- [Slack MCP Server Official](https://playbooks.com/mcp/slack)
- [Claude Desktop with Slack MCP 101](https://medium.com/@cookiewanwan/claude-desktop-with-slack-mcp-server-101-df5a7f6e13c6)
- [Use Slack MCP with Claude](https://composio.dev/blog/how-to-use-slack-mcp-server-with-claude-flawlessly)
- [Slack MCP on Glama](https://glama.ai/mcp/servers/@modelcontextprotocol/slack)

---

#### NTFY MCP Server

**Multiple Implementations:**

**Option 1: ntfy-mcp-server (cyanheads)**
- Comprehensive notification options
- Supports self-hosted + ntfy.sh
- `send_ntfy` tool
- Priority levels, tags, actions

**Setup:**
```json
{
  "mcpServers": {
    "ntfy": {
      "command": "npx",
      "args": ["-y", "ntfy-mcp-server"],
      "env": {
        "NTFY_URL": "https://ntfy.sh",
        "NTFY_TOKEN": "tk_your_token"
      }
    }
  }
}
```

**Option 2: ntfy-mcp (teddyzxcv)**
- Lightweight "notification butler"
- Task completion alerts
- Mobile push notifications

**Use Cases for Your Workflow:**
- Long-running API builds (notify when Phase 13 completes)
- Test failures (immediate mobile alert)
- Verification loops (notify when human review needed)
- Multi-endpoint progress (1/12 complete, 6/12 complete, etc.)

**Sources:**
- [NTFY MCP Server GitHub](https://github.com/cyanheads/ntfy-mcp-server)
- [NTFY MCP by teddyzxcv](https://github.com/teddyzxcv/ntfy-mcp)
- [AI Agent Autonomy with NTFY](https://skywork.ai/skypage/en/ai-agent-autonomy-ntfy-push/1978676578578190336)
- [NTFY MCP on LobeHub](https://lobehub.com/mcp/cyanheads-ntfy-mcp-server)

---

### 5. Settings & Configuration

**Hierarchy:**
1. **User settings:** `~/.claude/settings.json` (all projects)
2. **Project settings:** `.claude/settings.json` (checked into git)
3. **Local settings:** `.claude/settings.local.json` (personal, gitignored)

**Complete Template:**

```json
{
  "version": "1.0",
  "hooks": {
    "sessionStart": [
      {
        "command": "python",
        "args": [".claude/hooks/session-startup.py"]
      }
    ],
    "postToolUse": [
      {
        "command": "python",
        "args": [".claude/hooks/update-registry.py"],
        "matchers": {
          "tools": ["Write"],
          "patterns": ["registry.json"]
        }
      }
    ],
    "stop": [
      {
        "command": "python",
        "args": [".claude/hooks/send-notification.py"]
      }
    ]
  },
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      }
    },
    "discord": {
      "command": "npx",
      "args": ["-y", "@davidlikescat/discord-mcp"],
      "env": {
        "DISCORD_WEBHOOK_URL": "${DISCORD_WEBHOOK_URL}"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}",
        "SLACK_CHANNEL_IDS": "${SLACK_CHANNEL_IDS}"
      }
    },
    "ntfy": {
      "command": "npx",
      "args": ["-y", "ntfy-mcp-server"],
      "env": {
        "NTFY_URL": "https://ntfy.sh",
        "NTFY_TOKEN": "${NTFY_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}"
      }
    }
  },
  "plugins": []
}
```

**Sources:**
- [Claude Code Settings Docs](https://code.claude.com/docs/en/settings)
- [Settings.json Developer Guide](https://www.eesel.ai/blog/settings-json-claude-code)
- [Battle-tested Settings Example](https://github.com/fcakyon/claude-codex-settings)
- [Starter Template](https://github.com/centminmod/my-claude-code-setup)

---

## 🗺️ Enhanced Roadmap with Claude Code Ecosystem

### Your 9 Original Issues → Solutions

| # | Issue | Claude Code Solution | Implementation |
|---|-------|---------------------|----------------|
| 1 | Documentation folder structure | Per-API folders in `.claude/research/` | ✅ Phase 1 |
| 2 | Comprehensive research | Parallel subagents (Context7 + WebSearch + Greptile) | ✅ Phase 1 |
| 3 | Cost & time tracking | PostToolUse hook + state tracking | ✅ Phase 0 |
| 4 | Autonomous mode | Answer files + Skills auto-detection | ✅ Phase 2 |
| 5 | Iterative documentation | Write hook fires during research phases | ✅ Phase 1 |
| 6 | Auto-approve edits | Pattern-based PreToolUse hook | ✅ Phase 2 |
| 7 | Template output | *Need clarification - route templates?* | ❓ TBD |
| 8 | Registry bugs | PostToolUse hook + fetch API route | ✅ Phase 0 |
| 9 | Multi-endpoint tracking | State schema + Skills for selection UI | ✅ Phase 2 |

### New Claude Code Native Additions

| # | Feature | Implementation | Priority |
|---|---------|----------------|----------|
| 10 | Skills hybrid architecture | SKILL.md for api/ui/combine workflows | P0 (Critical) |
| 11 | Parallel subagent execution | Phase 3 research with 3 concurrent agents | P1 (High) |
| 12 | Discord notifications | MCP server + Stop hook | P2 (Medium) |
| 13 | Slack notifications | MCP server + PostToolUse hook | P2 (Medium) |
| 14 | NTFY mobile alerts | MCP server + critical event hooks | P2 (Medium) |
| 15 | Streamlined setup script | One command installs all MCP servers | P1 (High) |

---

## 📋 6-Week Implementation Plan

### Phase 0: Bug Fixes + Foundation (Week 1)

**Goal:** Fix critical bugs, add essential tracking

**Tasks:**
1. ✅ Fix registry update hook (Issue #8)
2. ✅ Fix example value generation
3. ✅ Add cost/time tracking PostToolUse hook
4. ✅ Create hook unit tests
5. ✅ Add demo mode flag

**Files to create/modify:**
- `.claude/hooks/update-registry.py` (fix)
- `.claude/hooks/track-session-metrics.py` (new)
- `src/app/api/registry/route.ts` (new - fetch endpoint)
- `scripts/validate-hooks.py` (new - unit tests)

**Timeline:** 5-7 days
**Cost:** $0

---

### Phase 1: Skills + Research Overhaul (Weeks 2-3)

**Goal:** Natural language UX + 95% research coverage

**1. Skills Implementation:**

Create 3 core skills:

**`.claude/skills/api-development/SKILL.md`:**
```yaml
---
name: api-development
description: Interview-driven API integration with 13-phase TDD workflow. Automatically detects "integrate [API]" and runs workflow. Uses Context7, WebSearch, Greptile for research. Triggers on "integrate API", "build endpoint", "add API support".
---

When user mentions API integration, invoke /hustle-api-create [detected-api-name].

Trigger phrases:
- "integrate the [X] API"
- "build endpoint for [X]"
- "add [X] API support"
- "create API route for [X]"

Auto-detect API name from user request and pass to command.
```

**`.claude/skills/ui-development/SKILL.md`:**
```yaml
---
name: ui-development
description: Brand-guided UI component/page creation with 13-phase workflow. Automatically detects "create [component]" or "build [page]". Uses brand guide, ShadCN detection, 4-step verification. Triggers on "create component", "build page", "add UI for".
---

When user mentions UI creation, invoke /hustle-ui-create or /hustle-ui-create-page.

Trigger phrases:
- "create a [X] component"
- "build a [X] page"
- "add UI for [X]"
- "design [X] interface"
```

**`.claude/skills/combine-development/SKILL.md`:**
```yaml
---
name: combine-development
description: API orchestration combining 2+ existing APIs from registry. Automatically detects "combine [API1] and [API2]". Reads registry, validates APIs exist, creates orchestration layer. Triggers on "combine APIs", "orchestrate", "merge endpoints".
---

When user mentions combining APIs, invoke /hustle-combine api.

Trigger phrases:
- "combine [X] and [Y] APIs"
- "orchestrate [X] with [Y]"
- "merge [X] and [Y] into one endpoint"
```

**2. Parallel Subagent Research:**

Update Phase 3 to spawn 3 concurrent subagents:

```python
# .claude/hooks/trigger-parallel-research.py
import subprocess
import json

def trigger_research(endpoint, library):
    # Spawn 3 subagents in parallel
    agents = [
        {
            "name": "context7-research",
            "prompt": f"Use Context7 to research {library} API documentation",
            "type": "general-purpose"
        },
        {
            "name": "websearch-research",
            "prompt": f"Use WebSearch to find {library} API official docs and recent updates",
            "type": "general-purpose"
        },
        {
            "name": "greptile-research",
            "prompt": f"If GitHub repo detected, propose Greptile query for {library} undocumented features",
            "type": "general-purpose"
        }
    ]

    # Claude Code spawns these in parallel (up to 10 concurrent)
    # Results aggregated when all complete
```

**3. Research Folder Structure:**

```
.claude/research/
├── index.json                 # Freshness tracking
├── brandfetch/
│   ├── CURRENT.md            # Latest research (written iteratively)
│   ├── sources.json          # URLs + timestamps
│   ├── interview.json        # User decisions
│   ├── schema.json           # Final Zod schema
│   └── greptile-cache.json   # 7-day cached queries
└── firecrawl/
    ├── CURRENT.md
    ├── sources.json
    └── ...
```

**4. Iterative Documentation Hook:**

```python
# .claude/hooks/write-research-incrementally.py
import json
from pathlib import Path

def append_to_research(phase, content, endpoint):
    research_dir = Path(f".claude/research/{endpoint}")
    research_dir.mkdir(exist_ok=True)

    current_md = research_dir / "CURRENT.md"

    # Append section based on phase
    sections = {
        "research_initial": "## Initial Research\n\n",
        "interview": "## Interview Decisions\n\n",
        "research_deep": "## Deep Research - Advanced Features\n\n",
        "schema_creation": "## Schema Summary\n\n",
        "verify": "## Verification Results\n\n"
    }

    with open(current_md, "a") as f:
        f.write(sections.get(phase, "## Unknown Phase\n\n"))
        f.write(content + "\n\n")
```

**Timeline:** 10-14 days
**Deliverables:**
- 3 Skills (api, ui, combine)
- Parallel subagent research
- Per-API folder structure
- Iterative documentation hook

---

### Phase 2: Notifications + UX (Week 4)

**Goal:** Real-time notifications + better developer experience

**1. MCP Server Setup Script:**

Create one-command setup that installs all MCP servers:

```bash
#!/bin/bash
# scripts/setup-mcp-servers.sh

echo "🚀 Setting up MCP servers for API Dev Tools..."

# Prompt for credentials
read -p "Discord Webhook URL (optional): " DISCORD_WEBHOOK
read -p "Slack Bot Token (optional): " SLACK_TOKEN
read -p "Slack Team ID (optional): " SLACK_TEAM
read -p "Slack Channel IDs (comma-separated, optional): " SLACK_CHANNELS
read -p "NTFY Token (optional, press enter for ntfy.sh): " NTFY_TOKEN

# Create .env file
cat > .claude/.env.mcp << EOF
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK}
SLACK_BOT_TOKEN=${SLACK_TOKEN}
SLACK_TEAM_ID=${SLACK_TEAM}
SLACK_CHANNEL_IDS=${SLACK_CHANNELS}
NTFY_TOKEN=${NTFY_TOKEN}
NTFY_URL=https://ntfy.sh
EOF

# Add MCP servers via CLI
echo "📦 Installing Context7..."
claude mcp add context7 --scope project -- npx -y @context7/mcp

if [ -n "$DISCORD_WEBHOOK" ]; then
  echo "📦 Installing Discord notifier..."
  claude mcp add discord --scope project -- npx -y @davidlikescat/discord-mcp
fi

if [ -n "$SLACK_TOKEN" ]; then
  echo "📦 Installing Slack MCP..."
  claude mcp add slack --scope project -- npx -y @modelcontextprotocol/server-slack
fi

if [ -n "$NTFY_TOKEN" ] || [ "$NTFY_TOKEN" == "" ]; then
  echo "📦 Installing NTFY..."
  claude mcp add ntfy --scope project -- npx -y ntfy-mcp-server
fi

echo "📦 Installing GitHub MCP..."
claude mcp add github --scope project -- npx -y @modelcontextprotocol/server-github

echo "✅ MCP servers installed! Restart Claude Code to activate."
```

**2. Notification Hooks:**

```python
# .claude/hooks/send-notification.py (Stop hook)
import os
import json
from pathlib import Path

def send_notification():
    state = json.load(open(".claude/api-dev-state.json"))
    endpoint = state.get("endpoint", "unknown")
    phase = state.get("current_phase", 0)

    # Check which notification channels are configured
    env = load_env(".claude/.env.mcp")

    message = f"✅ API Dev Tools: {endpoint} completed Phase {phase}"

    # Send to configured channels
    if env.get("DISCORD_WEBHOOK_URL"):
        send_discord(message, env["DISCORD_WEBHOOK_URL"])

    if env.get("SLACK_BOT_TOKEN"):
        send_slack(message, env)

    if env.get("NTFY_TOKEN") or env.get("NTFY_URL"):
        send_ntfy(message, env)

def send_discord(message, webhook):
    # Use MCP server tool
    # Claude Code automatically has send_discord_message tool available
    pass

def send_slack(message, env):
    # Use MCP server tool
    # Claude Code automatically has slack_post_message tool available
    pass

def send_ntfy(message, env):
    # Use MCP server tool
    # Claude Code automatically has send_ntfy tool available
    pass
```

**3. Multi-Endpoint Tracking:**

Update state schema to support multi-endpoint:

```json
{
  "version": "3.11.0",
  "workflow_type": "multi_endpoint",
  "api_name": "firecrawl",
  "endpoints": {
    "firecrawl/scrape": {
      "phase": 13,
      "status": "complete",
      "completed_at": "2025-12-22T10:45:00Z"
    },
    "firecrawl/crawl": {
      "phase": 8,
      "status": "in_progress",
      "started_at": "2025-12-22T11:00:00Z"
    }
  },
  "active_endpoint": "firecrawl/crawl",
  "progress": {
    "completed": 1,
    "in_progress": 1,
    "pending": 10,
    "total": 12
  }
}
```

**4. Auto-Approve Pattern Hook:**

```python
# .claude/hooks/auto-approve-patterns.py (PreToolUse)
import json
from pathlib import Path

def should_auto_approve(tool_name, tool_args):
    settings = json.load(open(".claude/settings.json"))
    auto_approve_config = settings.get("auto_approve", {})

    if not auto_approve_config.get("enabled", False):
        return False  # Default: require approval

    file_path = tool_args.get("file_path", "")

    # Check allowed patterns
    allowed = auto_approve_config.get("allowed_patterns", [])
    for pattern in allowed:
        if Path(file_path).match(pattern):
            # Check blocked patterns
            blocked = auto_approve_config.get("blocked_patterns", [])
            for block_pattern in blocked:
                if Path(file_path).match(block_pattern):
                    return False
            return True

    return False
```

**Timeline:** 7-10 days
**Deliverables:**
- One-command MCP setup script
- Notification hooks (Discord, Slack, NTFY)
- Multi-endpoint state tracking
- Auto-approve pattern hook

---

### Phase 3: Testing Infrastructure (Week 5)

**Goal:** Comprehensive testing without high costs

**1. Hook Unit Tests:**

```python
# tests/test_hooks/test_enforce_research.py
import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent / ".claude" / "hooks"))
from enforce_research import should_block, get_block_message

def test_blocks_write_without_research():
    state = {
        "phases": {
            "research_initial": {"status": "pending", "sources": []}
        }
    }
    assert should_block(state, "Write") is True

def test_allows_write_after_research():
    state = {
        "phases": {
            "research_initial": {
                "status": "complete",
                "sources": ["context7", "websearch"]
            }
        }
    }
    assert should_block(state, "Write") is False
```

**2. Demo Mode:**

Add `--demo-mode` flag to commands:

```bash
/hustle-api-create test-api --demo-mode
# Runs workflow with default answers, no user prompts
# Saves full transcript to .claude/demo-sessions/test-api.json
```

**3. Snapshot Validation:**

```bash
# Generate baseline (one-time)
/hustle-api-create brandfetch --demo-mode --output=tests/snapshots/brandfetch.json

# Future tests compare against baseline
diff tests/snapshots/brandfetch.json .claude/demo-sessions/brandfetch-latest.json
```

**Timeline:** 7-10 days
**Deliverables:**
- Hook unit test suite
- Demo mode implementation
- Snapshot validation scripts

---

### Phase 4: Documentation + Polish (Week 6)

**Goal:** Complete documentation, final refinements

**1. Update All Documentation:**
- README.md with Skills section
- CLAUDE.md injection in user projects
- Command docs (api-create, ui-create, combine)
- MCP server setup guide

**2. Create Example Skills:**
- Document how users can create custom skills
- Provide templates for common patterns

**3. Final Testing:**
- End-to-end workflow tests
- All 9 original issues validated as fixed
- Notification testing (Discord, Slack, NTFY)

**Timeline:** 5-7 days

---

## 🎨 Architectural Diagrams

### Skills + Subagents Flow

```mermaid
graph TB
    subgraph "User Interaction"
        A[Natural Language: "Integrate Stripe API"]
        B[Explicit Command: /hustle-api-create stripe]
    end

    subgraph "Skills Layer"
        C{Skill Detection}
        D[api-development SKILL.md]
        E[Command Invocation]
    end

    subgraph "13-Phase Workflow"
        F[Phase 1: Disambiguation]
        G[Phase 2: Scope]
        H[Phase 3: Parallel Research]
    end

    subgraph "Parallel Subagents up to 10"
        I[Subagent 1: Context7]
        J[Subagent 2: WebSearch]
        K[Subagent 3: Greptile]
    end

    subgraph "Aggregation"
        L[Combine Results]
        M[Phase 4: Interview]
    end

    A --> C
    B --> E
    C -->|Matches| D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    I --> L
    J --> L
    K --> L
    L --> M

    style C fill:#BA0C2F,color:#fff
    style D fill:#BA0C2F,color:#fff
    style H fill:#BA0C2F,color:#fff
    style I fill:#4A90E2,color:#fff
    style J fill:#4A90E2,color:#fff
    style K fill:#4A90E2,color:#fff
```

### Notification Flow

```mermaid
graph TD
    A[Phase Completion] --> B{Stop Hook Fires}
    B --> C[Read State File]
    C --> D{Check MCP Servers}

    D -->|Discord Configured| E[send_discord_message]
    D -->|Slack Configured| F[slack_post_message]
    D -->|NTFY Configured| G[send_ntfy]

    E --> H[Discord Channel]
    F --> I[Slack Channel]
    G --> J[Mobile Push]

    H --> K[User Notified]
    I --> K
    J --> K

    style B fill:#BA0C2F,color:#fff
    style D fill:#BA0C2F,color:#fff
    style K fill:#00AA00,color:#fff
```

### MCP Setup Flow

```mermaid
graph LR
    A[Run setup-mcp-servers.sh] --> B{Prompt for Credentials}
    B --> C[Discord Webhook?]
    B --> D[Slack Token?]
    B --> E[NTFY Token?]

    C -->|Yes| F[Install Discord MCP]
    D -->|Yes| G[Install Slack MCP]
    E -->|Yes/No| H[Install NTFY MCP]

    F --> I[Write .claude/.env.mcp]
    G --> I
    H --> I

    I --> J[Update settings.json]
    J --> K[Restart Claude Code]
    K --> L[MCP Servers Active]

    style A fill:#BA0C2F,color:#fff
    style I fill:#BA0C2F,color:#fff
    style L fill:#00AA00,color:#fff
```

---

## 💰 Cost Analysis

### Current State (v3.10.x)

| Metric | Value |
|--------|-------|
| Research coverage | ~60% |
| Cost per API | $1.70 |
| Notification method | Manual (none) |
| Parallel execution | No (sequential only) |
| Time per API | 45-60 minutes |

---

### Future State (v3.11+ with Claude Code enhancements)

| Metric | Value | Change |
|--------|-------|--------|
| Research coverage | ~95% | +35% ✅ |
| Cost per API | $1.85 | +$0.15 (Greptile) |
| Notification method | Discord/Slack/NTFY | Automated ✅ |
| Parallel execution | Yes (3 subagents in Phase 3) | -20% time ✅ |
| Time per API | 35-45 minutes | -10-15 min ✅ |

**Additional benefits:**
- **Real-time notifications** - Know when workflow completes (no manual checking)
- **Natural language UX** - Skills make commands optional
- **Better parallelization** - 3 concurrent research subagents vs sequential

**MCP Server Costs:**
- Discord: **FREE** (webhook-based)
- Slack: **FREE** (bot token)
- NTFY: **FREE** (ntfy.sh) or self-hosted
- Context7: Existing (already using)
- GitHub: **FREE** (PAT-based)

**Total new costs:** $0/month (all free services)

---

## ✅ Decision Points for User Approval

### 1. Skills Hybrid Architecture - YES or NO?

**Recommendation:** ✅ YES

**Why:**
- Natural language UX ("integrate Stripe" → auto-runs workflow)
- Commands still available for explicit control
- Skills are official Claude Code feature (not competitor)
- Open standard (adopted by OpenAI)

**Cost:** $0
**Time to implement:** 3-4 days
**ROI:** High (better UX)

**User decision:** [ ] Approve [ ] Commands only

---

### 2. Parallel Subagent Research - YES or NO?

**Recommendation:** ✅ YES

**Why:**
- **3 concurrent subagents** vs sequential = 20-30% time savings
- Each subagent has own context window (no pollution)
- Native Claude Code feature (Task tool)
- Proven pattern (up to 10 concurrent supported)

**Cost:** $0 (same research, just parallel)
**Time to implement:** 2-3 days
**ROI:** High (faster workflows)

**User decision:** [ ] Approve [ ] Keep sequential

---

### 3. Notification MCP Servers - Which Ones?

**Options:**
- [ ] Discord (webhook-based, free)
- [ ] Slack (bot token, free)
- [ ] NTFY (mobile push, free)
- [ ] All three
- [ ] None (skip notifications)

**Recommendation:** ✅ All three (let users choose)

**Why:**
- FREE (no ongoing costs)
- Users can pick which channel(s) they want
- Setup script handles credential collection
- Optional (can skip during setup)

**Cost:** $0/month
**Time to implement:** 3-4 days
**ROI:** High (better async workflows)

**User decision:** [ ] All three [ ] Pick specific [ ] None

---

### 4. One-Command MCP Setup - YES or NO?

**Recommendation:** ✅ YES

**Why:**
- Simplifies onboarding (run one script, answer prompts)
- Handles credential collection automatically
- Creates `.claude/.env.mcp` with all secrets
- Installs all MCP servers via CLI
- **Critical for adoption** (complex setup = users won't use it)

**Cost:** $0
**Time to implement:** 1-2 days
**ROI:** Extremely high (UX improvement)

**User decision:** [ ] Approve [ ] Manual setup only

---

### 5. Template Output Clarification

**You mentioned:** "The template is an output at the end with the API"

**What does this mean?**
- [ ] Route.ts template should be output at completion?
- [ ] Documentation template should be generated?
- [ ] Test template should be output?
- [ ] Something else (please explain)?

**I need clarification before I can implement this.**

---

## 📝 TLDR for Quick Approval

### What You're Approving

**4 Core Enhancements (Claude Code Native):**
1. ✅ Skills hybrid (natural language + commands)
2. ✅ Parallel subagents (3 concurrent in Phase 3)
3. ✅ Notification MCP servers (Discord, Slack, NTFY)
4. ✅ One-command setup script

**All 9 Original Issues:**
5. ✅ Fix registry bugs (P0)
6. ✅ Cost tracking (P0)
7. ✅ Iterative docs (P1)
8. ✅ Multi-endpoint tracking (P1)
9. ✅ Research folder structure (P2)
10. ✅ Auto-approve patterns (P2)
11. ✅ Answer files (P3)
12. ❓ Template output (need clarification)

**Timeline:** 6 weeks
**Total cost:** $0/month (all free/native features)
**Time savings:** 10-15 min per API + async notifications

### If You Approve Everything

**You get:**
- 95% API feature discovery (vs 60%)
- 20-30% faster workflows (parallel subagents)
- Real-time notifications (Discord/Slack/NTFY)
- Natural language UX (Skills)
- One-command setup (better adoption)
- Working registry
- Cost visibility dashboard

**Bottom line:** World-class workflow using **only Claude Code's native capabilities** - no dependency on competitor tools.

---

## 🚀 Next Steps

1. **User reviews this document** (~15-20 min)
2. **User approves/rejects each decision point** (checkboxes above)
3. **User clarifies "Template output" issue**
4. **Create new branch:** `git checkout -b feature/v3.11-claude-code-enhancements`
5. **Begin Phase 0 (bug fixes)** - Target: End of this week

---

## ❓ Outstanding Questions

1. **Template output:** What did you mean by "the template is an output at the end with the API"?

2. **Notification preferences:** Which channels do you want? (Discord, Slack, NTFY, or all?)

3. **Auto-approve:** Default OFF (opt-in) or default ON (opt-out)? (Recommend OFF for security)

4. **Parallel subagents:** Should we limit to 3 (research only) or explore other phases too?

---

## 📚 All Sources & References

### Claude Code Skills
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Inside Claude Code Skills Structure](https://mikhail.io/2025/10/claude-code-skills/)
- [Official Skills Repository](https://github.com/anthropics/skills)
- [Claude Agent Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Introducing Agent Skills](https://claude.com/blog/skills)
- [Equipping Agents with Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

### Subagents & Task Tool
- [Subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Subagent Deep Dive](https://cuong.io/blog/2025/06/24-claude-code-subagent-deep-dive)
- [Task Tool vs Subagents Guide](https://www.icodewith.ai/blog/task-tool-vs-subagents-how-agents-work-in-claude-code/)
- [Practical Guide to Sub-agents](https://jewelhuq.medium.com/practical-guide-to-mastering-claude-codes-main-agent-and-sub-agents-fd52952dcf00)

### Hooks
- [Claude Code Hooks Automation](https://www.gend.co/blog/configure-claude-code-hooks-automation)
- [Agent SDK Hooks Documentation](https://docs.claude.com/en/api/agent-sdk/overview)
- [Hook Development Guide](https://claude-plugins.dev/skills/@anthropics/claude-code/hook-development)
- [Building Agents with SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

### MCP Servers - Discord
- [Discord Notifier MCP](https://lobehub.com/mcp/davidlikescat-016_discord_mcp)
- [Discord Notification MCP](https://glama.ai/mcp/servers/@kstonekuan/discord-notification-mcp)
- [Discord MCP Server GitHub](https://github.com/v-3/discordmcp)

### MCP Servers - Slack
- [Slack MCP Server Official](https://playbooks.com/mcp/slack)
- [Claude Desktop with Slack MCP 101](https://medium.com/@cookiewanwan/claude-desktop-with-slack-mcp-server-101-df5a7f6e13c6)
- [Use Slack MCP with Claude](https://composio.dev/blog/how-to-use-slack-mcp-server-with-claude-flawlessly)
- [Slack MCP on Glama](https://glama.ai/mcp/servers/@modelcontextprotocol/slack)

### MCP Servers - NTFY
- [NTFY MCP Server GitHub](https://github.com/cyanheads/ntfy-mcp-server)
- [NTFY MCP by teddyzxcv](https://github.com/teddyzxcv/ntfy-mcp)
- [AI Agent Autonomy with NTFY](https://skywork.ai/skypage/en/ai-agent-autonomy-ntfy-push/1978676578578190336)
- [NTFY MCP on LobeHub](https://lobehub.com/mcp/cyanheads-ntfy-mcp-server)

### Configuration & Setup
- [Claude Code Settings Docs](https://code.claude.com/docs/en/settings)
- [Settings.json Developer Guide](https://www.eesel.ai/blog/settings-json-claude-code)
- [Battle-tested Settings Example](https://github.com/fcakyon/claude-codex-settings)
- [Add MCP Servers Guide](https://mcpcat.io/guides/adding-an-mcp-server-to-claude-code/)
- [MCP Setup with Claude Code](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code)

---

**Document Status:** ✅ Ready for approval
**Last Updated:** 2025-12-22
**Focus:** Claude Code native ecosystem only
**No competitor dependencies:** Pure Claude Code implementation

