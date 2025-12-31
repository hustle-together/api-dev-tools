---
name: parallel-spawn
description: Spawn multiple Task agents in parallel for concurrent workflow execution across git worktrees
license: MIT
compatibility: Requires Claude Code with Task tool, git worktrees support
metadata:
  version: "4.5.0"
  category: "workflow"
  tags: ['parallel', 'concurrent', 'worktree', 'agents', 'orchestration']
  author: "Hustle Together"
allowed-tools: Task Read Write Bash TodoWrite
model: sonnet
---

# Parallel Spawn

Coordinate parallel agent execution across git worktrees for concurrent workflow processing.

## Usage

```
/parallel-spawn api:users api:products api:analytics
/parallel-spawn component:chart component:table page:dashboard
```

Format: `type:name` where type is `api`, `component`, or `page`

## How It Works

1. **Interview Once** - Shared decisions are collected upfront
2. **Create Worktrees** - Each workflow gets its own git worktree
3. **Spawn Agents** - Background Task agents run in parallel
4. **Monitor Progress** - Track completion with /parallel-status
5. **Merge Results** - Combine all changes back to main branch

## Example Session

```
User: /parallel-spawn api:users api:products api:orders

AI: Setting up 3 parallel workflows...

┌─────────────────────────────────────────────────────────────────┐
│               PARALLEL EXECUTION SETUP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Workflows to spawn:                                            │
│  └─ api:users                                                   │
│  └─ api:products                                                │
│  └─ api:orders                                                  │
│                                                                 │
│  Shared interview required first!                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Before spawning, I need to collect shared decisions that will apply
to ALL workflows:

1. Authentication method?
   [1] API Key
   [2] Bearer Token
   [3] OAuth 2.0

2. Error handling strategy?
   [1] Fail-fast
   [2] Partial success
   [3] Retry with backoff

... (shared interview)

AI: Creating worktrees and spawning agents...

[Spawns 3 Task agents in parallel with run_in_background: true]

Parallel execution started! Monitor with /parallel-status
```

## Implementation

<claude-commands-template>
When /parallel-spawn is invoked:

### 1. Parse Workflows

Extract workflow definitions from the command:
```python
workflows = []
for match in re.findall(r'(api|component|page):(\w+)', args):
    workflows.append({"type": match[0], "name": match[1]})
```

### 2. Collect Shared Decisions

Before spawning, conduct ONE shared interview:

```
┌─────────────────────────────────────────────────────────────────┐
│                  SHARED INTERVIEW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  These decisions apply to ALL {len(workflows)} workflows:       │
│                                                                 │
│  [Questions based on workflow types]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Use AskUserQuestion with options based on hustle-build-defaults.json.

### 3. Create Worktrees

For each workflow, create an isolated git worktree:

```bash
# Create worktree with new branch
git worktree add ../parallel-users-0 -b parallel-users-0

# Copy shared decisions
cp .claude/shared-decisions.json ../parallel-users-0/.claude/
```

### 4. Update State

Save parallel execution state:
```json
{
  "parallel_execution": {
    "enabled": true,
    "worktrees": [
      {"name": "parallel-users-0", "path": "../parallel-users-0", "status": "pending"},
      {"name": "parallel-products-1", "path": "../parallel-products-1", "status": "pending"},
      {"name": "parallel-orders-2", "path": "../parallel-orders-2", "status": "pending"}
    ],
    "shared_decisions": {
      "auth_required": true,
      "error_handling": "partial-success"
    }
  }
}
```

### 5. Spawn Task Agents

**CRITICAL: Spawn all agents in a SINGLE message with multiple Task tool calls!**

```
Call Task tool 3 times in ONE message:

Task 1:
  subagent_type: "general-purpose"
  prompt: "Execute api-create users in worktree parallel-users-0..."
  run_in_background: true

Task 2:
  subagent_type: "general-purpose"
  prompt: "Execute api-create products in worktree parallel-products-1..."
  run_in_background: true

Task 3:
  subagent_type: "general-purpose"
  prompt: "Execute api-create orders in worktree parallel-orders-2..."
  run_in_background: true
```

### 6. Monitor Completion

Use TaskOutput with block=false to check status:

```
For each background agent ID:
  TaskOutput(task_id=agent_id, block=false)

Update worktree status based on results.
```

### 7. Merge When Complete

When all agents complete:

```bash
# Merge each worktree branch
git merge parallel-users-0 --no-ff -m "Merge parallel: users API"
git merge parallel-products-1 --no-ff -m "Merge parallel: products API"
git merge parallel-orders-2 --no-ff -m "Merge parallel: orders API"

# Clean up worktrees
git worktree remove ../parallel-users-0
git worktree remove ../parallel-products-1
git worktree remove ../parallel-orders-2
```
</claude-commands-template>

## Related Commands

- `/parallel-status` - Check parallel execution progress
- `/parallel-merge` - Merge all completed worktrees
- `/parallel-abort` - Cancel parallel execution and clean up
- `/ralph-status` - Check individual agent loop status

## Configuration

In `hustle-build-defaults.json`:

```json
{
  "parallel": {
    "max_worktrees": 5,
    "auto_merge": false,
    "cleanup_on_error": true
  }
}
```
