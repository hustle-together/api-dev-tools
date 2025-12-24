#!/usr/bin/env python3
"""
Convert .claude/commands/*.md files to .skills/*/SKILL.md format
Adds YAML frontmatter while preserving all original content
"""
import os
import re
from pathlib import Path

# Skill metadata templates
SKILL_METADATA = {
    "api-interview": {
        "description": "Structured interview for API requirements gathering. Questions generated FROM research findings, not templates. Use when you need to understand API parameter preferences, error handling, formats, and user decisions. Keywords: interview, requirements, api, questions, research, decisions",
        "category": "development",
        "tags": ["api", "interview", "requirements", "research"],
    },
    "api-research": {
        "description": "Adaptive propose-approve research workflow for API documentation discovery. Use when researching external APIs, SDKs, or libraries. Caches research with 7-day freshness tracking. Keywords: research, documentation, api, discovery, cache, adaptive",
        "category": "research",
        "tags": ["api", "research", "documentation", "discovery", "cache"],
    },
    "api-verify": {
        "description": "Manual Phase 10 verification - re-research documentation after tests pass to catch memory-based implementation errors. Compares implementation to docs, reports gaps. Use after TDD Green phase. Keywords: verification, testing, documentation, gaps, quality",
        "category": "testing",
        "tags": ["verification", "testing", "documentation", "quality"],
    },
    "api-env": {
        "description": "Check required API keys and environment variables. Supports server env vars, NEXT_PUBLIC_ vars, and custom headers. Use before starting implementation. Keywords: environment, api-keys, configuration, setup, validation",
        "category": "development",
        "tags": ["environment", "api-keys", "configuration", "setup"],
    },
    "api-status": {
        "description": "Track implementation progress through 13 phases. Shows completed, in-progress, and pending phases. Displays interview decisions and research cache info. Keywords: status, progress, tracking, phases, workflow",
        "category": "workflow",
        "tags": ["status", "progress", "tracking", "workflow"],
    },
    "red": {
        "description": "TDD Red Phase - write ONE failing test that defines success before writing implementation. Use at the start of feature development to prevent over-engineering. Keywords: tdd, testing, red-phase, test-driven, failure",
        "category": "testing",
        "tags": ["tdd", "testing", "red-phase", "test-driven"],
    },
    "green": {
        "description": "TDD Green Phase - write minimal implementation code to make the failing test pass. No over-engineering, just enough to pass. Use after writing failing tests. Keywords: tdd, testing, green-phase, implementation, minimal",
        "category": "testing",
        "tags": ["tdd", "testing", "green-phase", "implementation"],
    },
    "refactor": {
        "description": "TDD Refactor Phase - improve code structure, readability, and performance while keeping all tests green. Use after tests pass to clean up code. Keywords: tdd, refactoring, cleanup, optimization, quality",
        "category": "testing",
        "tags": ["tdd", "refactoring", "cleanup", "optimization"],
    },
    "cycle": {
        "description": "Execute complete TDD cycle - Red (write failing test) → Green (minimal implementation) → Refactor (cleanup). Use for feature development with single command. Keywords: tdd, cycle, workflow, testing, automation",
        "category": "workflow",
        "tags": ["tdd", "cycle", "workflow", "testing"],
    },
    "plan": {
        "description": "Create implementation plan from feature or requirement with PRD-style discovery and TDD acceptance criteria. Generates step-by-step checklist. Use before starting complex features. Keywords: planning, prd, requirements, checklist, strategy",
        "category": "planning",
        "tags": ["planning", "prd", "requirements", "strategy"],
    },
    "gap": {
        "description": "Analyze conversation context for unaddressed items and gaps. Scans code vs requirements to find missing pieces. Use during code review or planning. Keywords: analysis, gaps, requirements, review, completeness",
        "category": "analysis",
        "tags": ["analysis", "gaps", "requirements", "review"],
    },
    "issue": {
        "description": "Analyze GitHub issue and create TDD implementation plan. Converts issue requirements into executable tasks with acceptance criteria. Use when starting work from issues. Keywords: github, issues, planning, tdd, requirements",
        "category": "workflow",
        "tags": ["github", "issues", "planning", "tdd"],
    },
    "commit": {
        "description": "Create semantic git commit following project standards with co-author attribution. Analyzes staged changes, suggests commit message. Use after completing features. Keywords: git, commit, semantic, versioning, attribution",
        "category": "git",
        "tags": ["git", "commit", "semantic", "versioning"],
    },
    "pr": {
        "description": "Create pull request using GitHub MCP. Generates PR summary from all commits, creates test plan. Use after pushing feature branch. Keywords: github, pull-request, pr, collaboration, review",
        "category": "git",
        "tags": ["github", "pull-request", "pr", "collaboration"],
    },
    "spike": {
        "description": "Execute TDD Spike Phase - exploratory coding to understand problem space before formal TDD. Use when requirements are unclear or architecture needs exploration. Keywords: spike, exploration, prototyping, learning, architecture",
        "category": "workflow",
        "tags": ["spike", "exploration", "prototyping", "learning"],
    },
    "beepboop": {
        "description": "Communicate AI-generated content with transparent attribution. Adds markers indicating AI authorship. Use when sharing AI-generated code or content. Keywords: attribution, transparency, ai-generated, ethics, communication",
        "category": "workflow",
        "tags": ["attribution", "transparency", "ai-generated", "ethics"],
    },
    "worktree-add": {
        "description": "Add new git worktree from branch name or GitHub issue URL. Copies settings, installs deps, opens in IDE. Use for parallel feature development. Keywords: git, worktree, parallel, workflow, branches",
        "category": "git",
        "tags": ["git", "worktree", "parallel", "workflow"],
    },
    "worktree-cleanup": {
        "description": "Clean up merged worktrees by verifying PR/issue status, consolidating settings, removing stale worktrees. Use after merging features. Keywords: git, worktree, cleanup, maintenance, branches",
        "category": "git",
        "tags": ["git", "worktree", "cleanup", "maintenance"],
    },
    "busycommit": {
        "description": "Create multiple atomic git commits, one logical change at a time. Analyzes changes and separates into meaningful commits. Use for complex changesets. Keywords: git, commit, atomic, granular, organization",
        "category": "git",
        "tags": ["git", "commit", "atomic", "granular"],
    },
    "add-command": {
        "description": "Guide for creating new slash commands or agent skills. Provides templates and best practices. Use when extending the toolkit. Keywords: meta, commands, skills, templates, development",
        "category": "meta",
        "tags": ["meta", "commands", "skills", "templates"],
    },
    "tdd": {
        "description": "Remind agent about TDD approach and continue conversation. Reinforces test-first methodology. Use when agent deviates from TDD practices. Keywords: tdd, reminder, methodology, testing, practices",
        "category": "workflow",
        "tags": ["tdd", "reminder", "methodology", "testing"],
    },
    "summarize": {
        "description": "Summarize conversation progress and next steps. Provides overview of completed work and remaining tasks. Use at end of sessions or before breaks. Keywords: summary, progress, overview, tracking, communication",
        "category": "workflow",
        "tags": ["summary", "progress", "overview", "tracking"],
    },
}

def extract_title(content: str) -> str:
    """Extract title from markdown heading"""
    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    return match.group(1) if match else "Untitled"

def convert_command_to_skill(command_file: Path, skills_dir: Path):
    """Convert a command .md file to SKILL.md format"""
    # Read original command
    content = command_file.read_text()

    # Extract skill name from filename
    skill_name = command_file.stem

    # Skip README and already converted
    if skill_name in ["README", "api-create"]:
        print(f"⏭️  Skipping {skill_name}")
        return

    # Get metadata or use defaults
    metadata = SKILL_METADATA.get(skill_name, {
        "description": f"{skill_name} command. Use when working with {skill_name} related tasks.",
        "category": "workflow",
        "tags": [skill_name],
    })

    # Create YAML frontmatter
    frontmatter = f"""---
name: {skill_name}
description: {metadata['description']}
license: MIT
compatibility: Requires Claude Code with MCP servers (Context7, GitHub), Python 3.9+ for hooks, pnpm 10.11.0+
metadata:
  version: "3.0.0"
  category: "{metadata['category']}"
  tags: {metadata['tags']}
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 mcp__github AskUserQuestion Read Write Edit Bash TodoWrite
---

"""

    # Combine frontmatter + original content
    skill_content = frontmatter + content

    # Create skill directory and write SKILL.md
    skill_dir = skills_dir / skill_name
    skill_dir.mkdir(exist_ok=True)
    skill_file = skill_dir / "SKILL.md"
    skill_file.write_text(skill_content)

    print(f"✅ Converted {skill_name}")

def main():
    # Set up paths
    repo_root = Path(__file__).parent.parent.parent
    commands_dir = repo_root / ".claude" / "commands"
    skills_dir = repo_root / ".skills"

    print("🔄 Converting commands to Agent Skills format...\n")

    # Convert all command files
    for command_file in sorted(commands_dir.glob("*.md")):
        convert_command_to_skill(command_file, skills_dir)

    print("\n✨ Conversion complete!")
    print(f"📁 Skills created in: {skills_dir}")

if __name__ == "__main__":
    main()
