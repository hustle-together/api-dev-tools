---
name: docs-update
description: Ensure README, CHANGELOG, and docs stay current with features
tools: Read, Write, Edit, Glob, Grep, Task, TodoWrite
model: sonnet
---

# Documentation Update Skill

Automatically maintains documentation consistency when features are added or changed. This skill is invoked by the `docs-update-check.py` hook after significant changes.

## Philosophy

> **README is the single source of truth** - It should provide a comprehensive overview
> without becoming too long. Detailed docs live in `/docs/*.md`.

### Update Rules

1. **README.md** - Update only when:
   - New major feature added (new skill, new workflow)
   - Links section needs new doc reference
   - Counts change (skills, hooks, agents)
   - Version number changes
   - Never let it exceed ~500 lines

2. **CHANGELOG.md** - Always update when:
   - New features added
   - Breaking changes
   - Bug fixes
   - Version bump

3. **docs/*.md** - Create/update when:
   - New feature needs detailed explanation
   - Existing doc is out of date
   - Command signature changes

## When This Skill Runs

Triggered by `docs-update-check.py` hook when:
- New skill created in `.skills/`
- New hook added to `hooks/`
- New agent defined in `.claude/agents/`
- New doc created in `docs/`
- registry.json sections added/changed

## Execution Flow

### Step 1: Detect What Changed

```bash
# Get recently modified files
git diff --name-only HEAD~1 HEAD

# Or for uncommitted changes
git status --porcelain
```

### Step 2: Categorize Changes

| File Pattern | Category | Action |
|--------------|----------|--------|
| `.skills/*/SKILL.md` | New Skill | Update README skills count, add to docs/SKILLS.md |
| `hooks/*.py` | New Hook | Update README hooks count, add to docs/HOOKS.md |
| `.claude/agents/*.md` | New Agent | Update README agents count, add to docs/AGENTS.md |
| `docs/*.md` | New Doc | Add to README Documentation section |
| `templates/*.tsx` | New Template | Consider dashboard integration |

### Step 3: Update README Links

Check if new docs need to be linked:

```markdown
## Documentation

### Core Reference

| Document | Purpose |
| -------- | ------- |
| **[docs/NEW_DOC.md](./docs/NEW_DOC.md)** | Description here |
```

### Step 4: Update CHANGELOG

Add entry under current version or create new version:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- **`/new-skill`** - Description of what it does
```

### Step 5: Update Feature Doc

If change affects an existing command, update its doc:

```bash
# Map skill to doc
/api-create → docs/API-CREATE.md
/hustle-ui-create → docs/HUSTLE-UI-CREATE.md
/test-review → docs/SKILLS.md (test skills section)
```

## Output Format

```
═══════════════════════════════════════════════════════════════
                    DOCUMENTATION UPDATE
═══════════════════════════════════════════════════════════════

Changes Detected:
  • New skill: /docs-update
  • New doc: docs/PARALLEL_AUTONOMOUS_WORKFLOW.md
  • Modified: .skills/hustle-build/SKILL.md

Updates Made:
  ✅ README.md - Added parallel workflow to docs section
  ✅ CHANGELOG.md - Added v4.3.0 entry
  ✅ docs/SKILLS.md - Added docs-update skill reference
  ⏭️  docs/HOOKS.md - No changes needed

Verification:
  • README length: 516 lines (target: <600)
  • All new docs linked: Yes
  • CHANGELOG has entry: Yes

═══════════════════════════════════════════════════════════════
```

## Decision Tree

```
New Feature Added?
    │
    ├─► Is it a major workflow change?
    │       │
    │       ├─► YES: Create new doc in docs/
    │       │        Update README links
    │       │        Update CHANGELOG
    │       │
    │       └─► NO: Is it an enhancement to existing command?
    │               │
    │               ├─► YES: Update that command's doc
    │               │        Update CHANGELOG
    │               │
    │               └─► NO: Is it a minor fix?
    │                       │
    │                       └─► YES: Update CHANGELOG only
    │
    └─► Removing a feature?
            │
            ├─► WARNING: Removal requires justification
            │   Only remove if:
            │   - Feature never worked
            │   - Replaced by better feature
            │   - Security issue
            │
            └─► Update CHANGELOG with [BREAKING] if public API
```

## README Structure Limits

| Section | Max Lines | Current |
|---------|-----------|---------|
| Header/Banner | 30 | - |
| Quick Start | 20 | - |
| Workflows | 50 | - |
| Phases Diagram | 30 | - |
| What Gets Installed | 20 | - |
| Subagents | 20 | - |
| Commands | 40 | - |
| Documentation Links | 60 | - |
| FAQ | 150 | - |
| **Total** | **~500** | - |

If README exceeds 600 lines, move content to dedicated docs.

## Commands

```bash
# Run documentation update check
/docs-update

# Check what would be updated (dry run)
/docs-update --dry-run

# Force update all docs
/docs-update --force

# Update specific doc only
/docs-update --target README
```

## Integration

This skill integrates with:
- `docs-update-check.py` hook (PostToolUse on Write/Edit)
- Phase 13 (Documentation) of all workflows
- `/commit` skill (suggests doc updates before commit)

## See Also

- [docs/SKILLS.md](../../docs/SKILLS.md) - All skills reference
- [docs/HOOKS.md](../../docs/HOOKS.md) - All hooks reference
- [CHANGELOG.md](../../CHANGELOG.md) - Version history
