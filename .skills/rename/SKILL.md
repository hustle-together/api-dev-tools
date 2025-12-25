---
name: rename
description: Rename an API development session. Updates state file, research folder, session folder, and registry entry. Use when endpoint name needs to change after work has started. Keywords: rename, refactor, change, name, session, endpoint
license: MIT
compatibility: Requires Claude Code with API development workflow active
metadata:
  version: "3.11.0"
  category: "utility"
  tags: ["rename", "refactor", "session", "endpoint", "utility"]
  author: "Hustle Together"
allowed-tools: Read Write Edit Bash
---

# Rename - Session Renaming Utility

**Usage:** `/rename [old-name] [new-name]`

**Purpose:** Rename an API development session, updating all related files and references.

## When to Use

- Endpoint name needs to change after work has started
- Discovered better naming convention mid-project
- Consolidating similar endpoints
- Fixing typos in endpoint names

## What Gets Renamed

1. **State File Entry** (`.claude/api-dev-state.json`)
   - Updates `endpoint` field
   - Updates `active_element` if matching
   - Updates keys in `endpoints` object

2. **Research Folder** (`.claude/research/[old-name]/`)
   - Renames folder to `.claude/research/[new-name]/`
   - Updates `index.json` entry

3. **Session Folder** (`.claude/api-sessions/[old-name]/`)
   - Renames folder to `.claude/api-sessions/[new-name]/`
   - Updates `endpoint` field in `session.json`

4. **Registry Entry** (`.claude/registry.json`)
   - Updates API name in registry
   - Updates any references from other combined endpoints

5. **Source Files** (if they exist)
   - Route file: `src/app/api/v2/[old-name]/` → `src/app/api/v2/[new-name]/`
   - Test file: Updates test descriptions
   - Schema file: Updates type names

## Implementation

When invoked with `/rename [old-name] [new-name]`:

### Step 1: Validate Names

```
Verify:
- old-name exists in state/research/sessions
- new-name doesn't already exist
- new-name follows naming conventions (lowercase, hyphens)
```

If validation fails:
```
❌ Cannot rename: [reason]

- Old name not found: Check /stats for available sessions
- New name exists: Choose a different name
- Invalid format: Use lowercase with hyphens (e.g., stripe-payment)
```

### Step 2: Confirm with User

Use AskUserQuestion:
```json
{
  "questions": [{
    "question": "Rename '[old-name]' to '[new-name]'? This will update all files.",
    "header": "Confirm",
    "multiSelect": false,
    "options": [
      {"label": "Yes, rename", "description": "Update all references"},
      {"label": "No, cancel", "description": "Keep current name"}
    ]
  }]
}
```

### Step 3: Perform Rename

Execute in order (with error handling):

```bash
# 1. Rename research folder
mv .claude/research/[old-name] .claude/research/[new-name]

# 2. Rename sessions folder
mv .claude/api-sessions/[old-name] .claude/api-sessions/[new-name]

# 3. Rename source files (if exist)
mv src/app/api/v2/[old-name] src/app/api/v2/[new-name]
```

Then update JSON files using Edit tool:
- `.claude/api-dev-state.json`
- `.claude/research/index.json`
- `.claude/api-sessions/[new-name]/session.json`
- `.claude/registry.json`

### Step 4: Report Results

```
✅ Renamed '[old-name]' → '[new-name]'

Updated files:
  ✓ .claude/api-dev-state.json
  ✓ .claude/research/[new-name]/
  ✓ .claude/api-sessions/[new-name]/session.json
  ✓ .claude/registry.json
  ✓ src/app/api/v2/[new-name]/route.ts
  ✓ src/app/api/v2/[new-name]/__tests__/

Next steps:
  - Run tests to verify: pnpm test src/app/api/v2/[new-name]
  - Update any imports in other files
```

## Error Handling

If any step fails:
1. Report which step failed
2. Provide manual fix instructions
3. Do NOT leave partial renames

```
❌ Rename failed at step 3 (source files)

Reason: Permission denied

Manual fix:
  1. mv src/app/api/v2/[old-name] src/app/api/v2/[new-name]
  2. Update imports in dependent files
  3. Run /rename [old-name] [new-name] again to complete
```

## Safety Checks

Before renaming, verify:
- No active workflow in progress for this endpoint
- No uncommitted changes in source files
- No open PRs referencing old name

If any checks fail, warn but allow user to proceed.

---

**Version:** 3.11.0
**Last Updated:** 2025-12-25
