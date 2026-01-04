---
name: docs-sync
description: Synchronize documentation after code changes. Updates existing docs, creates new ones for features, and ensures README links.
license: MIT
compatibility: Requires Claude Code with hooks
metadata:
  version: "1.0.0"
  category: "documentation"
  tags: ["docs", "readme", "sync", "maintenance"]
  author: "Hustle Together"
allowed-tools: Read Write Edit Glob Grep
---

# Docs Sync - Documentation Synchronization Skill

Ensures documentation stays in sync with code changes. Run after implementing features, fixing gaps, or adding new capabilities.

## Usage

```bash
/docs-sync                    # Analyze and sync all docs
/docs-sync [feature-name]     # Sync docs for specific feature
/docs-sync --check            # Check what needs updating (no writes)
```

## What This Skill Does

### 1. Analyze Recent Changes

First, examine what changed:

- Read git diff or recent file modifications
- Identify new hooks, skills, agents, or features
- Detect removed or deprecated functionality

### 2. Update Existing Documentation

For each affected area, update the relevant doc:

| Change Type         | Doc to Update                        |
| ------------------- | ------------------------------------ |
| New hook            | `docs/HOOKS.md`                      |
| New skill           | `docs/SKILLS.md`                     |
| New agent           | `docs/AGENTS.md`                     |
| Orchestrator change | `docs/ORCHESTRATOR.md`               |
| Re-grounding change | `docs/REGROUNDING.md`                |
| Gap fixed           | `docs/GAP_ANALYSIS.md`               |
| Best practice added | `docs/CLAUDE_CODE_BEST_PRACTICES.md` |

### 3. Create New Documentation

If a feature warrants its own doc:

1. Create `docs/[FEATURE_NAME].md`
2. Use the standard header template (see below)
3. Add link to README.md Core Reference table

### 4. Ensure Problem/Solution Headers

Every doc MUST have this header format:

```markdown
# [Document Title]

**Version:** X.X.X
**Last Updated:** YYYY-MM-DD

> **The Problem**
>
> [Clear description of the pain point this addresses]

> **The Solution**
>
> [How this document/feature solves the problem]

---
```

### 5. Update README Links

Add any new docs to the appropriate section in README.md:

```markdown
### Core Reference

| Document                                 | Purpose           |
| ---------------------------------------- | ----------------- |
| **[docs/NEW_DOC.md](./docs/NEW_DOC.md)** | Brief description |
```

---

## Document Header Template

Use this exact format for all documentation:

```markdown
# [Title]

**Version:** [version]
**Last Updated:** [date]

> **The Problem**
>
> [Describe the specific pain point, frustration, or gap this addresses.
>
> > Be concrete - what goes wrong without this? What do users struggle with?]

> **The Solution**
>
> [Explain how this document/feature solves the problem.
>
> > What improvements does it provide? What's the benefit?]

---

## Table of Contents

...
```

---

## Execution Steps

### Step 1: Identify Changes

```bash
# Check what files changed recently
git diff --name-only HEAD~5
# Or check specific areas
ls -la hooks/
ls -la .skills/
ls -la docs/
```

Look for:

- New `.py` files in `hooks/`
- New folders in `.skills/`
- New `.md` files in `.claude/agents/`
- Modified core files

### Step 2: Categorize Updates Needed

Create a checklist:

```markdown
## Documentation Updates Needed

### Existing Docs to Update

- [ ] docs/HOOKS.md - Add [hook name]
- [ ] docs/SKILLS.md - Add [skill name]
- [ ] docs/GAP_ANALYSIS.md - Mark [gap] as fixed

### New Docs to Create

- [ ] docs/[FEATURE].md - New feature documentation

### README Updates

- [ ] Add link to [new doc]
```

### Step 3: Update Each Document

For each doc that needs updating:

1. **Read current content**
2. **Add/update the Problem/Solution header if missing**
3. **Add new sections for new features**
4. **Update version and date**
5. **Ensure See Also section includes related docs**

### Step 4: Create New Documents

For genuinely new features that need their own doc:

1. Create file with header template
2. Write comprehensive content
3. Add to README Core Reference table
4. Cross-link from related docs

### Step 5: Verify Links

Check all links work:

- Internal doc links (`[text](./OTHER_DOC.md)`)
- README links to docs
- See Also sections

---

## Problem/Solution Examples

### Good Example (REGROUNDING.md)

```markdown
> **The Problem**
>
> LLMs suffer from "context dilution" - as conversations grow longer,
> the original instructions (CLAUDE.md, system prompts) get pushed to
> the "middle" of the context where attention is weakest. Claude starts
> forgetting the endpoint name, re-asking answered questions, and
> recreating existing components.

> **The Solution**
>
> The Re-Grounding System injects a comprehensive state reminder every
> 7 turns, pushing critical context to the END where attention is
> strongest. This includes current phase, key decisions, existing
> registry elements, and deferred features - preventing the "lost in
> the middle" problem.
```

### Good Example (ORCHESTRATOR.md)

```markdown
> **The Problem**
>
> Building complex features requires multiple workflows (APIs, components,
> pages) that depend on each other. Running them manually means answering
> the same questions repeatedly, managing dependency order yourself, and
> manually wiring completed elements together.

> **The Solution**
>
> The Orchestrator decomposes natural language requests into workflows,
> orders them by dependency, shares decisions across all sub-workflows
> (ask once, apply everywhere), and automatically wires completed
> elements with proper imports and types.
```

---

## Checklist Before Completing

- [ ] All affected docs have Problem/Solution headers
- [ ] New features are documented
- [ ] README links are updated
- [ ] Version numbers are bumped
- [ ] Dates are updated
- [ ] See Also sections cross-reference related docs
- [ ] GAP_ANALYSIS.md reflects current state

---

## Output

After running this skill, report:

```markdown
## Documentation Sync Complete

### Updated

- docs/HOOKS.md - Added auto-format hook
- docs/GAP_ANALYSIS.md - Marked 3 gaps as fixed

### Created

- docs/NEW_FEATURE.md - New feature documentation

### README

- Added link to NEW_FEATURE.md

### Headers Added

- docs/SKILLS.md - Added Problem/Solution header
- docs/AGENTS.md - Added Problem/Solution header
```
