---
name: stats
description: Display session statistics for API development workflows. Shows duration, turn count, cost breakdown, tool usage, and phase timing. Use after completing a workflow or to check progress mid-session. Keywords: stats, metrics, cost, time, usage, session, tracking
license: MIT
compatibility: Requires Claude Code with session tracking enabled
metadata:
  version: "3.11.0"
  category: "utility"
  tags: ["stats", "metrics", "cost", "time", "tracking", "session"]
  author: "Hustle Together"
allowed-tools: Read Glob
---

# Stats - Session Statistics Display

**Usage:** `/stats` or `/stats [endpoint-name]`

**Purpose:** Display comprehensive statistics for API development sessions including duration, cost breakdown, tool usage, and phase timing.

## When to Use

- After completing an API development workflow
- To check progress mid-session
- To compare efficiency across different endpoints
- To understand cost breakdown for budgeting

## Output Format

```
╔═══════════════════════════════════════════════════
║ 📊 SESSION STATISTICS
╠═══════════════════════════════════════════════════
║ Endpoint:   [endpoint-name]
║ Duration:   42 minutes 18 seconds
║ Turns:      52
║ Status:     Complete (14/14 phases)
╠═══════════════════════════════════════════════════
║ 💰 COST BREAKDOWN
╠═══════════════════════════════════════════════════
║ Research:       $0.32
║   - Context7:   5 calls
║   - WebSearch:  8 queries
║   - WebFetch:   3 pages
║
║ Implementation: $0.95
║   - Writes:     12 files
║   - Edits:      23 changes
║   - Tests:      8 runs
║
║ Code Review:    $0.00 (CodeRabbit OSS)
║   - Issues:     2 found
║   - Fixed:      2
║ ─────────────────────────────────────
║ TOTAL:          $1.27
╠═══════════════════════════════════════════════════
║ 🛠️ TOOL USAGE
╠═══════════════════════════════════════════════════
║ Context7 MCP:       5 calls
║ WebSearch:          8 queries
║ Read:               24 files
║ Write:              12 files
║ Edit:               23 changes
║ Bash:               15 commands
║ AskUserQuestion:    14 prompts
║ TodoWrite:          14 updates
║ Task (async):       3 agents
╠═══════════════════════════════════════════════════
║ ⚡ EFFICIENCY METRICS
╠═══════════════════════════════════════════════════
║ Cost per endpoint:  $1.27
║ Time per phase:     3.0 min average
║ Research coverage:  95%
║ Async time saved:   ~12 min
╚═══════════════════════════════════════════════════
```

## Implementation

When invoked, do the following:

### Step 1: Determine Endpoint

If no argument provided:
- Check `.claude/api-dev-state.json` for active endpoint
- If no active endpoint, list available sessions

If argument provided:
- Use that as the endpoint name

### Step 2: Read Session Data

```bash
# Session file location
cat .claude/api-sessions/[endpoint]/session.json
```

Expected structure:
```json
{
  "version": "3.11.0",
  "endpoint": "[name]",
  "started_at": "2025-12-25T10:00:00Z",
  "ended_at": "2025-12-25T10:42:18Z",
  "duration_seconds": 2538,
  "turn_count": 52,
  "async_agents_used": 3,
  "phases": {},
  "tool_usage": {
    "WebSearch": 8,
    "mcp__context7__get-library-docs": 5,
    "Read": 24,
    "Write": 12,
    "Edit": 23,
    "Bash": 15,
    "AskUserQuestion": 14,
    "TodoWrite": 14,
    "Task": 3
  },
  "cost_breakdown": {
    "research": 0.32,
    "implementation": 0.95,
    "code_review": 0.00,
    "total": 1.27
  },
  "tokens": {
    "input": 85000,
    "output": 25000
  }
}
```

### Step 3: Format Duration

Convert seconds to human-readable:
- < 60s: "X seconds"
- < 3600s: "X minutes Y seconds"
- >= 3600s: "X hours Y minutes"

### Step 4: Calculate Efficiency Metrics

```
cost_per_endpoint = total_cost
time_per_phase = duration_seconds / phases_completed / 60
research_coverage = 95% (if multi-strategy used, else 60%)
async_time_saved = async_agents_used * 4 minutes (estimated)
```

### Step 5: Display Statistics

Use the format shown above. Render in a visually clear box format.

## Listing All Sessions

If no active endpoint and no argument:

```
╔═══════════════════════════════════════════════════
║ 📊 AVAILABLE SESSIONS
╠═══════════════════════════════════════════════════
║ brandfetch      | 35 min  | $1.27  | Complete
║ stripe-payment  | 42 min  | $1.89  | Complete
║ sendgrid-email  | 28 min  | $0.95  | In Progress
╚═══════════════════════════════════════════════════

Use: /stats [endpoint] to see details
```

## Session File Locations

```
.claude/api-sessions/
├── brandfetch/
│   └── session.json
├── stripe-payment/
│   └── session.json
└── sendgrid-email/
    └── session.json
```

---

**Version:** 3.11.0
**Last Updated:** 2025-12-25
