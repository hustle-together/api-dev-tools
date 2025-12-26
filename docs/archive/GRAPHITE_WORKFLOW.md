# Graphite Workflow Guide

> **Version:** 3.12.0
> **Last Updated:** December 26, 2025

Stacked pull requests for faster code review and trunk-based development.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Concepts](#core-concepts)
4. [Basic Workflow](#basic-workflow)
5. [Commands Reference](#commands-reference)
6. [Integration with api-dev-tools](#integration-with-api-dev-tools)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

[Graphite](https://graphite.dev) enables **stacked pull requests** - a workflow where you:

1. Build features as a series of small, dependent PRs
2. Review and merge PRs independently
3. Automatically rebase/update dependent PRs when parent merges

### Why Stacked PRs?

| Traditional PRs | Stacked PRs |
|-----------------|-------------|
| Large, monolithic changes | Small, focused changes |
| Long review cycles | Fast reviews (< 100 lines) |
| Blocked waiting for review | Continue building on top |
| Merge conflicts after waiting | Auto-restack handles conflicts |

### Pricing

| Plan | Cost | Features |
|------|------|----------|
| Free | $0 | CLI, basic stacking |
| Pro | $19/dev/month | Dashboard, merge queue, analytics |
| Enterprise | Custom | SSO, advanced controls |

---

## Installation

### 1. Install Graphite CLI

```bash
# npm
npm install -g @withgraphite/graphite-cli

# Homebrew (macOS)
brew install withgraphite/tap/graphite
```

### 2. Authenticate

```bash
gt auth
# Opens browser for GitHub authentication
```

### 3. Initialize Repository

```bash
cd /home/dev/repos/your-project
gt repo init

# Configure trunk branch (usually main or master)
# ? What is the trunk branch? main
```

### 4. Verify Setup

```bash
gt --version
gt log  # Show current stack
```

---

## Core Concepts

### Trunk Branch

Your main integration branch (usually `main` or `master`). All stacks start from here.

### Stack

A series of dependent branches:

```
main
 └── feature/auth-base        (PR #1)
      └── feature/auth-login  (PR #2)
           └── feature/auth-logout (PR #3)
```

When PR #1 merges, PRs #2 and #3 automatically restack onto main.

### Branch Metadata

Graphite stores parent-child relationships in branch metadata:

```bash
gt branch info
# Shows parent branch, children, PR status
```

---

## Basic Workflow

### Starting a New Stack

```bash
# Start from trunk
gt checkout main
gt sync  # Pull latest

# Create first branch in stack
gt create feature/auth-base
# Make changes, commit
gt commit -m "Add auth base"

# Create PR
gt submit
```

### Adding to the Stack

```bash
# While on feature/auth-base
gt create feature/auth-login
# Make changes
gt commit -m "Add login endpoint"
gt submit
```

### Viewing Your Stack

```bash
gt log
# Shows visual stack representation:
#
# ◯ feature/auth-logout (PR #103)
# │
# ◯ feature/auth-login (PR #102)
# │
# ◯ feature/auth-base (PR #101)
# │
# ◯ main
```

### Syncing After Merge

When a PR in your stack merges:

```bash
gt sync
# Automatically restacks all branches onto new trunk
```

### Modifying Earlier in Stack

```bash
# Switch to earlier branch
gt checkout feature/auth-base

# Make changes
gt commit --amend  # or new commit

# Restack dependent branches
gt restack
```

---

## Commands Reference

### Branch Management

| Command | Description |
|---------|-------------|
| `gt create <name>` | Create new branch on top of current |
| `gt checkout <name>` | Switch to branch |
| `gt delete <name>` | Delete branch (after merge) |
| `gt rename <old> <new>` | Rename branch |

### Stack Operations

| Command | Description |
|---------|-------------|
| `gt log` | Show current stack visually |
| `gt log --all` | Show all stacks |
| `gt stack` | Show current stack info |
| `gt restack` | Rebase stack after changes |
| `gt sync` | Sync with remote, restack |

### Commits

| Command | Description |
|---------|-------------|
| `gt commit -m "msg"` | Create commit |
| `gt commit --amend` | Amend last commit |
| `gt absorb` | Auto-absorb changes into correct commits |

### Pull Requests

| Command | Description |
|---------|-------------|
| `gt submit` | Create/update PR for current branch |
| `gt submit --stack` | Submit entire stack as PRs |
| `gt submit --draft` | Create as draft PR |

### Navigation

| Command | Description |
|---------|-------------|
| `gt up` | Move up the stack (to child) |
| `gt down` | Move down the stack (to parent) |
| `gt top` | Go to top of stack |
| `gt bottom` | Go to bottom of stack |

### Utilities

| Command | Description |
|---------|-------------|
| `gt status` | Show current branch status |
| `gt info` | Show branch metadata |
| `gt repo sync` | Sync repo configuration |

---

## Integration with api-dev-tools

### Stacked PRs for API Development

When building a new API endpoint, create a stack:

```bash
# Start the endpoint
gt create feature/stripe-checkout-schema
/api-create stripe-checkout  # Complete through Phase 6 (Schema)
gt commit -m "Add Stripe Checkout schema and types"
gt submit --draft

# Continue with tests
gt create feature/stripe-checkout-tests
# Complete Phase 8 (TDD Red)
gt commit -m "Add Stripe Checkout tests (failing)"
gt submit --draft

# Implementation
gt create feature/stripe-checkout-impl
# Complete Phases 9-11
gt commit -m "Implement Stripe Checkout endpoint"
gt submit

# Documentation
gt create feature/stripe-checkout-docs
# Complete Phases 12-13
gt commit -m "Add Stripe Checkout documentation"
gt submit
```

### Configuration in autonomous-config.json

```json
{
  "integrations": {
    "graphite": {
      "enabled": true,
      "use_stacked_prs": true,
      "auto_restack": true,
      "trunk_branch": "main"
    }
  }
}
```

### /pr Skill Integration

The `/pr` skill can use Graphite:

```bash
# Instead of regular gh pr create
/pr  # Detects Graphite, uses gt submit
```

### /commit Skill Integration

```bash
/commit  # Uses gt commit when in a Graphite stack
```

---

## Best Practices

### 1. Keep PRs Small

- **Target**: < 200 lines changed
- **Ideal**: 50-100 lines
- Each PR should be reviewable in 10-15 minutes

### 2. Logical Commits

Each branch in the stack should be:
- **Complete**: Passes tests independently
- **Focused**: One logical change
- **Documented**: Clear PR description

### 3. Stack Structure

```
Good Stack:
├── Add database schema
├── Add repository layer
├── Add service layer
├── Add API endpoint
└── Add documentation

Bad Stack:
├── WIP part 1
├── More WIP
├── Fix previous
└── Actually fix it
```

### 4. Early Submission

Submit PRs early (as drafts):
- Gets CI running
- Allows early feedback
- Shows work in progress

```bash
gt submit --draft --stack
```

### 5. Respond to Review

When review comments require changes:

```bash
# Make changes on the relevant branch
gt checkout feature/relevant-branch
# Edit files
gt commit --amend  # or new commit
gt restack  # Update dependent branches
gt submit --stack  # Update all PRs
```

### 6. Sync Frequently

```bash
# At start of day
gt sync

# After any merge
gt sync

# Before submitting
gt sync
gt submit --stack
```

---

## Workflow Examples

### Example 1: Feature Development

```bash
# Day 1: Start feature
gt checkout main && gt sync
gt create feature/user-profiles-model
# Add User model, migrations
gt commit -m "Add User profile model and migrations"
gt submit --draft

# Continue with API
gt create feature/user-profiles-api
# Add API endpoints
gt commit -m "Add User profile CRUD endpoints"
gt submit --draft

# Day 2: First PR approved, merged
gt sync  # Auto-restacks user-profiles-api onto main

# Continue building
gt create feature/user-profiles-ui
# Add frontend
gt commit -m "Add User profile page"
gt submit
```

### Example 2: Bug Fix Stack

```bash
# Investigate
gt create fix/checkout-race-condition-analysis
# Add logging, analysis
gt commit -m "Add checkout race condition diagnostics"
gt submit --draft

# Fix
gt create fix/checkout-race-condition-fix
# Implement fix
gt commit -m "Fix checkout race condition with mutex"
gt submit

# Tests
gt create fix/checkout-race-condition-tests
# Add regression tests
gt commit -m "Add regression tests for checkout race condition"
gt submit
```

### Example 3: Refactoring Stack

```bash
# Phase 1: Preparation
gt create refactor/auth-prep
# Add interfaces, don't change behavior
gt commit -m "Add auth provider interfaces"
gt submit

# Phase 2: Implementation
gt create refactor/auth-impl
# Implement new structure
gt commit -m "Refactor auth to use provider pattern"
gt submit

# Phase 3: Cleanup
gt create refactor/auth-cleanup
# Remove old code
gt commit -m "Remove legacy auth implementation"
gt submit
```

---

## Troubleshooting

### Merge Conflicts

```bash
# When gt restack fails with conflicts
gt restack --continue  # After resolving conflicts
# or
gt restack --abort  # Start over
```

### Branch Not Tracked

```bash
# If branch not recognized by Graphite
gt track  # Track current branch
gt track --parent feature/parent-branch  # Set parent
```

### Wrong Parent Branch

```bash
# Change parent of current branch
gt upstack onto feature/correct-parent
```

### Sync Fails

```bash
# Force sync (use carefully)
gt sync --force

# Or reset to remote
git fetch origin
gt checkout main
git reset --hard origin/main
gt sync
```

### Stack Visualization Issues

```bash
# Rebuild stack metadata
gt repo sync --reset
```

### CI Not Running

- Check GitHub Actions workflow exists
- Verify Graphite app has repo access
- Check `.graphite/` config directory

---

## Configuration Files

### .graphite/config

Auto-generated by `gt repo init`:

```json
{
  "trunk": "main",
  "ignore_branches": ["release/*", "hotfix/*"]
}
```

### Repository Settings

Configure in Graphite dashboard:
- Merge method (squash, merge, rebase)
- Required checks
- Auto-merge settings

---

## See Also

- [AUTONOMOUS_MODE.md](./AUTONOMOUS_MODE.md) - Autonomous execution guide
- [GREPTILE_INTEGRATION.md](./GREPTILE_INTEGRATION.md) - AI code review setup
- [CLAUDE_CODE_FEATURES.md](./CLAUDE_CODE_FEATURES.md) - Claude Code features reference
- [Graphite Documentation](https://docs.graphite.dev)

---

**Version:** 3.12.0
**Author:** Hustle Together
