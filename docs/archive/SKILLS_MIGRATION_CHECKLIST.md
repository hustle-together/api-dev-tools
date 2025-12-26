# Skills Migration Implementation Checklist

**Version:** 1.0.0
**Created:** 2025-12-24
**Status:** Ready for Implementation

This document provides a comprehensive, step-by-step checklist for migrating `@hustle-together/api-dev-tools` from Claude Code commands to the Agent Skills open standard while maintaining backward compatibility.

---

## 📋 Executive Summary

### What We're Building

1. **Dual Distribution Strategy**:
   - KEEP current `.claude/commands/` and `.claude/hooks/` for Claude Code users
   - ADD parallel `.skills/` structure for cross-platform compatibility
   - CREATE `.claude-plugin/marketplace.json` for one-command installation

2. **Cross-Platform Compatibility**:
   - Works in Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot
   - Distributable via SkillsMP.com and anthropics/skills
   - Installable via `/plugin install @hustle-together/api-dev-tools`

3. **Architecture Remains Unchanged**:
   - 13-phase TDD workflow stays the same
   - 18 enforcement hooks stay the same
   - Interview-driven research stays the same
   - Skills are just a NEW PACKAGING FORMAT

---

## 🎯 Phase 1: Directory Structure Setup

### 1.1 Create Skills Directory Structure

```bash
api-dev-tools/
├── .claude/                          # EXISTING - Keep for Claude Code
│   ├── commands/                     # EXISTING - Keep as-is
│   ├── hooks/                        # EXISTING - Keep as-is
│   └── settings.json                 # EXISTING - Keep as-is
├── .claude-plugin/                   # NEW - Plugin metadata
│   └── marketplace.json              # NEW - Plugin distribution config
├── .skills/                          # NEW - Agent Skills format
│   ├── api-create/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── api-interview/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── api-research/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── api-verify/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── api-env/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── api-status/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── red/
│   │   └── SKILL.md
│   ├── green/
│   │   └── SKILL.md
│   ├── refactor/
│   │   └── SKILL.md
│   ├── cycle/
│   │   └── SKILL.md
│   ├── plan/
│   │   └── SKILL.md
│   ├── gap/
│   │   └── SKILL.md
│   ├── issue/
│   │   └── SKILL.md
│   ├── commit/
│   │   └── SKILL.md
│   ├── pr/
│   │   └── SKILL.md
│   ├── spike/
│   │   └── SKILL.md
│   ├── beepboop/
│   │   └── SKILL.md
│   ├── worktree-add/
│   │   └── SKILL.md
│   ├── worktree-cleanup/
│   │   └── SKILL.md
│   ├── busycommit/
│   │   └── SKILL.md
│   └── add-command/
│       └── SKILL.md
└── package.json                      # EXISTING - Update with plugin metadata
```

**Tasks:**
- [ ] Create `.claude-plugin/` directory
- [ ] Create `.skills/` directory
- [ ] Create subdirectories for each of the 20 commands
- [ ] Verify directory structure matches Agent Skills spec

---

## 🎯 Phase 2: Convert Commands to SKILL.md Format

### 2.1 SKILL.md Template

Each command needs conversion from `.md` to `SKILL.md` with YAML frontmatter:

```markdown
---
name: api-create
description: Complete API development workflow using interview-driven, research-first, test-first methodology with continuous verification loops. Use when creating new V2 API endpoints. Keywords: api, endpoint, tdd, research, interview, verification
license: MIT
compatibility: Requires Claude Code with MCP servers (Context7, GitHub), Python 3.9+ for hooks, pnpm for package management
metadata:
  version: "3.0.0"
  category: "development"
  tags: ["api", "tdd", "workflow", "research", "interview"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 mcp__github AskUserQuestion Read Write Edit Bash
---

# API Create - Comprehensive API Development Workflow v3.0

**Usage:** `/api-create [endpoint-name]`

[Rest of existing command content...]
```

### 2.2 Required Fields for Each Skill

- **name**: Must match directory name, lowercase-with-hyphens
- **description**: 1-1024 chars, include what it does AND when to use it, with keywords
- **license**: "MIT"
- **compatibility**: Environment requirements (Python, Node, MCP servers)
- **metadata.version**: Match package.json version
- **metadata.category**: "development", "testing", "documentation", "workflow"
- **metadata.tags**: Relevant keywords for discovery
- **allowed-tools**: Space-delimited list of pre-approved tools

### 2.3 Command Conversion Checklist

Convert each of these 20 commands:

#### API Development Commands
- [ ] `api-create.md` → `.skills/api-create/SKILL.md`
- [ ] `api-interview.md` → `.skills/api-interview/SKILL.md`
- [ ] `api-research.md` → `.skills/api-research/SKILL.md`
- [ ] `api-verify.md` → `.skills/api-verify/SKILL.md`
- [ ] `api-env.md` → `.skills/api-env/SKILL.md`
- [ ] `api-status.md` → `.skills/api-status/SKILL.md`

#### TDD Commands (from @wbern/claude-instructions)
- [ ] `red.md` → `.skills/red/SKILL.md`
- [ ] `green.md` → `.skills/green/SKILL.md`
- [ ] `refactor.md` → `.skills/refactor/SKILL.md`
- [ ] `cycle.md` → `.skills/cycle/SKILL.md`

#### Planning & Analysis Commands
- [ ] `plan.md` → `.skills/plan/SKILL.md`
- [ ] `gap.md` → `.skills/gap/SKILL.md`
- [ ] `issue.md` → `.skills/issue/SKILL.md`

#### Git Commands
- [ ] `commit.md` → `.skills/commit/SKILL.md`
- [ ] `pr.md` → `.skills/pr/SKILL.md`
- [ ] `busycommit.md` → `.skills/busycommit/SKILL.md`

#### Workflow Commands
- [ ] `spike.md` → `.skills/spike/SKILL.md`
- [ ] `worktree-add.md` → `.skills/worktree-add/SKILL.md`
- [ ] `worktree-cleanup.md` → `.skills/worktree-cleanup/SKILL.md`

#### Meta Commands
- [ ] `beepboop.md` → `.skills/beepboop/SKILL.md`
- [ ] `add-command.md` → `.skills/add-command/SKILL.md`

### 2.4 Validation

After conversion:
- [ ] Install `skills-ref` CLI: `npm install -g @agentskills/skills-ref`
- [ ] Validate each skill: `skills-ref validate .skills/api-create`
- [ ] Validate all skills: `skills-ref validate .skills/`
- [ ] Fix any validation errors (name mismatches, frontmatter issues)

---

## 🎯 Phase 3: Hook Integration Strategy

### 3.1 Hook Architecture Decision

**Decision:** Keep hooks EXTERNAL to skills, referenced via settings.json

**Rationale:**
- Hooks enforce rules across ALL skills (not just one)
- Hooks need PreToolUse/PostToolUse/SessionStart/Stop lifecycle events
- Agent Skills spec doesn't define hook integration yet
- Settings.json is Claude Code-specific and works perfectly

**Implementation:**
- [ ] Keep `.claude/hooks/` directory as-is (18 Python scripts)
- [ ] Keep `.claude/settings.json` as-is (hook registrations)
- [ ] Document hook requirements in `.skills/README.md`
- [ ] Add hook installation instructions to marketplace.json description

### 3.2 Cross-Platform Hook Strategy

For non-Claude Code platforms (VS Code, Cursor, ChatGPT):
- [ ] Create `.skills/_shared/hooks/` directory with hook Python scripts
- [ ] Add README in `.skills/_shared/hooks/README.md` explaining manual setup
- [ ] Document that hooks are OPTIONAL for basic skill usage
- [ ] Document that hooks are REQUIRED for full workflow enforcement

---

## 🎯 Phase 4: Create Marketplace.json

### 4.1 Plugin Metadata

Create `.claude-plugin/marketplace.json`:

```json
{
  "name": "api-dev-tools",
  "owner": {
    "name": "Hustle Together",
    "email": "contact@hustletogether.dev"
  },
  "description": "Interview-driven, research-first API development toolkit with 13-phase TDD workflow, enforcement hooks, and continuous verification loops. Includes 20+ agent skills for API creation, testing, documentation, and deployment.",
  "version": "3.11.0",
  "repository": "https://github.com/hustle-together/api-dev-tools",
  "license": "MIT",
  "keywords": ["api", "tdd", "workflow", "research", "interview", "verification", "hooks", "mcp"],
  "plugins": [
    {
      "name": "api-dev-tools",
      "source": ".",
      "description": "Complete API development workflow with 13 phases",
      "version": "3.11.0",
      "author": {
        "name": "Hustle Together",
        "email": "contact@hustletogether.dev"
      },
      "category": "development",
      "tags": ["api", "tdd", "workflow"]
    }
  ],
  "installation": {
    "requirements": {
      "claude_code": ">=1.0.0",
      "python": ">=3.9",
      "node": ">=18.0.0",
      "pnpm": ">=10.11.0"
    },
    "mcp_servers": [
      {
        "name": "context7",
        "description": "Documentation search",
        "required": true
      },
      {
        "name": "github",
        "description": "GitHub integration",
        "required": true
      }
    ],
    "post_install": [
      "Copy .claude/hooks/ to project",
      "Copy .claude/settings.json to project",
      "Create .claude/api-dev-state.json",
      "Create .claude/research/ directory"
    ]
  },
  "documentation": {
    "readme": "https://github.com/hustle-together/api-dev-tools/blob/main/README.md",
    "changelog": "https://github.com/hustle-together/api-dev-tools/blob/main/CHANGELOG.md",
    "guides": {
      "quickstart": "https://github.com/hustle-together/api-dev-tools/blob/main/.claude/commands/README.md",
      "workflow": "https://github.com/hustle-together/api-dev-tools/blob/main/ENHANCEMENT_ROADMAP_v3.11.0.md"
    }
  }
}
```

**Tasks:**
- [ ] Create `.claude-plugin/marketplace.json`
- [ ] Update version to match package.json
- [ ] Add repository URL (update when GitHub repo created)
- [ ] Add owner email
- [ ] Validate JSON syntax
- [ ] Test with `/plugin marketplace add` command

---

## 🎯 Phase 5: Create Skills README

### 5.1 Master README for Skills

Create `.skills/README.md`:

```markdown
# API Development Tools - Agent Skills

**Version:** 3.11.0
**Standard:** Agent Skills Open Format (agentskills.io)
**Platform:** Cross-platform (Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot)

## Installation

### Via Claude Code Plugin
\`\`\`bash
/plugin marketplace add hustle-together/api-dev-tools
/plugin install api-dev-tools@hustle-together
\`\`\`

### Via SkillsMP Marketplace
\`\`\`bash
# Install from SkillsMP.com
npm install -g @hustle-together/api-dev-tools
\`\`\`

### Manual Installation
1. Clone repository
2. Copy `.skills/` to `~/.claude/skills/` (personal) or `.claude/skills/` (project)
3. Copy `.claude/hooks/` to project (for enforcement)
4. Copy `.claude/settings.json` to project (for hook registration)

## Available Skills

### API Development (6 skills)
- **api-create** - Complete 13-phase API workflow
- **api-interview** - Interview-driven requirements gathering
- **api-research** - Adaptive documentation research
- **api-verify** - Re-research and verify implementation
- **api-env** - Check API keys and environment
- **api-status** - Track implementation progress

### TDD Workflow (4 skills)
- **red** - Write ONE failing test
- **green** - Minimal implementation to pass tests
- **refactor** - Clean up code while tests pass
- **cycle** - Complete Red → Green → Refactor loop

### Planning & Analysis (3 skills)
- **plan** - Create implementation checklist
- **gap** - Scan code vs requirements for gaps
- **issue** - Start work from GitHub issue

### Git Operations (3 skills)
- **commit** - Semantic commit with co-author
- **pr** - Create pull request with summary
- **busycommit** - Multiple atomic commits

### Workflow Utilities (4 skills)
- **spike** - Exploratory coding phase
- **worktree-add** - Add git worktree from issue
- **worktree-cleanup** - Clean up merged worktrees
- **beepboop** - Transparent AI attribution

## Requirements

- **MCP Servers**: Context7 (docs), GitHub (PRs)
- **Python**: 3.9+ (for enforcement hooks)
- **Node**: 18+ (for package management)
- **Package Manager**: pnpm 10.11.0+

## Enforcement Hooks (Optional but Recommended)

For full workflow enforcement, install hooks:
1. Copy `.claude/hooks/` to your project
2. Copy `.claude/settings.json` to your project
3. Hooks enforce:
   - Research before implementation
   - Interview decisions injection
   - Test-first development
   - Verification after green phase
   - Documentation completeness

## Architecture

- **13-Phase Workflow**: Disambiguation → Scope → Research → Interview → Deep Research → Schema → Environment → TDD Red → TDD Green → Verify → Refactor → Documentation → Completion
- **Loop-Back Architecture**: Every verification phase loops back if not successful
- **State Tracking**: All progress in `.claude/api-dev-state.json`
- **Research Cache**: Documentation cached in `.claude/research/` (7-day freshness)

## License

MIT License - See LICENSE file
\`\`\`

**Tasks:**
- [ ] Create `.skills/README.md`
- [ ] Update version numbers
- [ ] Add installation instructions for all platforms
- [ ] Document requirements and dependencies

---

## 🎯 Phase 6: Update Package.json

### 6.1 Add Plugin Metadata

Update `/Users/alfonso/Documents/GitHub/api-dev-tools/package.json`:

```json
{
  "name": "@hustle-together/api-dev-tools",
  "version": "3.11.0",
  "description": "Interview-driven, research-first API development toolkit with 13-phase TDD workflow",
  "keywords": [
    "api",
    "tdd",
    "workflow",
    "agent-skills",
    "claude-code",
    "research",
    "interview",
    "verification"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/hustle-together/api-dev-tools.git"
  },
  "author": "Hustle Together <contact@hustletogether.dev>",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=10.11.0"
  },
  "claudeCode": {
    "marketplace": ".claude-plugin/marketplace.json",
    "skills": ".skills",
    "hooks": ".claude/hooks",
    "settings": ".claude/settings.json"
  },
  "files": [
    ".claude/",
    ".claude-plugin/",
    ".skills/",
    "dist/",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

**Tasks:**
- [ ] Add `claudeCode` field with plugin paths
- [ ] Add `agent-skills` to keywords
- [ ] Update `files` array to include `.skills/` and `.claude-plugin/`
- [ ] Verify repository URL
- [ ] Update description

---

## 🎯 Phase 7: Create Installation Script

### 7.1 Post-Install Automation

Create `.skills/_shared/install.sh`:

```bash
#!/bin/bash
# API Dev Tools - Post-Install Setup
# Installs hooks, settings, and initializes state files

set -e

echo "🚀 Installing API Dev Tools..."

# Determine installation directory
if [ -d ".claude" ]; then
  INSTALL_DIR=".claude"
  echo "📁 Installing to project: .claude/"
else
  INSTALL_DIR="$HOME/.claude"
  echo "📁 Installing to user directory: ~/.claude/"
fi

# Create directories
mkdir -p "$INSTALL_DIR/hooks"
mkdir -p "$INSTALL_DIR/research"
mkdir -p "$INSTALL_DIR/commands"

# Copy hooks
if [ -d ".skills/_shared/hooks" ]; then
  echo "🔗 Installing enforcement hooks..."
  cp -r .skills/_shared/hooks/* "$INSTALL_DIR/hooks/"
  chmod +x "$INSTALL_DIR/hooks/"*.py
fi

# Copy settings
if [ -f ".skills/_shared/settings.json" ]; then
  echo "⚙️  Installing settings..."
  cp .skills/_shared/settings.json "$INSTALL_DIR/settings.json"
fi

# Initialize state file
if [ ! -f "$INSTALL_DIR/api-dev-state.json" ]; then
  echo "📊 Initializing state file..."
  cat > "$INSTALL_DIR/api-dev-state.json" << EOF
{
  "version": "3.0.0",
  "endpoint": null,
  "turn_count": 0,
  "phases": {},
  "research_index": {}
}
EOF
fi

# Initialize research index
if [ ! -f "$INSTALL_DIR/research/index.json" ]; then
  echo "🔍 Initializing research cache..."
  cat > "$INSTALL_DIR/research/index.json" << EOF
{
  "version": "1.0.0",
  "cache": {}
}
EOF
fi

echo "✅ Installation complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Install MCP servers: Context7, GitHub"
echo "  2. Run '/api-create my-endpoint' to start"
echo "  3. Read documentation: .claude/commands/README.md"
```

**Tasks:**
- [ ] Create `.skills/_shared/install.sh`
- [ ] Make executable: `chmod +x .skills/_shared/install.sh`
- [ ] Test installation script
- [ ] Add to marketplace.json post_install instructions

---

## 🎯 Phase 8: Documentation Updates

### 8.1 Update Main README

Update `/Users/alfonso/Documents/GitHub/api-dev-tools/README.md`:

**Add Installation Section:**
```markdown
## Installation

### Quick Install (Recommended)

#### Via Claude Code Plugin
\`\`\`bash
/plugin marketplace add hustle-together/api-dev-tools
/plugin install api-dev-tools
\`\`\`

#### Via SkillsMP Marketplace
\`\`\`bash
npm install -g @hustle-together/api-dev-tools
\`\`\`

### Manual Install

#### NPM Package
\`\`\`bash
npx @hustle-together/api-dev-tools --scope=project
\`\`\`

#### From Source
\`\`\`bash
git clone https://github.com/hustle-together/api-dev-tools.git
cd api-dev-tools
./skills/_shared/install.sh
\`\`\`

## Platform Compatibility

This toolkit uses the **Agent Skills open standard** and works across:
- ✅ Claude Code
- ✅ VS Code with GitHub Copilot
- ✅ Cursor
- ✅ ChatGPT
- ✅ Any platform supporting Agent Skills

## Distribution

- **GitHub**: [hustle-together/api-dev-tools](https://github.com/hustle-together/api-dev-tools)
- **SkillsMP**: [skillsmp.com/@hustle-together/api-dev-tools](https://skillsmp.com)
- **NPM**: [@hustle-together/api-dev-tools](https://npmjs.com/package/@hustle-together/api-dev-tools)
\`\`\`

**Tasks:**
- [ ] Add installation instructions for all platforms
- [ ] Add platform compatibility badges
- [ ] Add links to marketplaces
- [ ] Update screenshots/demos

### 8.2 Create CHANGELOG

Create `/Users/alfonso/Documents/GitHub/api-dev-tools/CHANGELOG.md`:

```markdown
# Changelog

## [3.11.0] - 2025-12-24

### Added - Skills Migration
- ✨ **Agent Skills Support**: Migrated all commands to Agent Skills open standard
- 📦 **Cross-Platform**: Now works in Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot
- 🏪 **Marketplace Distribution**: Added `.claude-plugin/marketplace.json` for one-command install
- 🔧 **Installation Script**: Automated setup via `.skills/_shared/install.sh`
- 📚 **Skills README**: Complete documentation in `.skills/README.md`

### Changed
- 📁 **Dual Distribution**: Kept `.claude/commands/` for backward compatibility
- 🎯 **Enhanced Discovery**: Added keywords and descriptions for better skill selection
- 🔗 **Hook Integration**: Documented hook setup for non-Claude Code platforms

### Maintained
- ✅ **13-Phase Workflow**: All phases unchanged
- ✅ **18 Enforcement Hooks**: All hooks unchanged
- ✅ **Interview-Driven**: Research-first methodology unchanged
- ✅ **State Tracking**: `.claude/api-dev-state.json` unchanged

## [3.0.0] - 2025-12-08

### Added - Major Workflow Overhaul
- 🔴 **Phase 1: Disambiguation** - Clarify terms before research
- ✅ **Phase 10: Verify** - Re-research after tests pass
- 🔄 **Loop-Back Architecture** - Every phase can loop back
- 📊 **State Tracking** - Complete workflow state in JSON
- 🔍 **Research Cache** - 7-day freshness tracking

[Full changelog...]
```

**Tasks:**
- [ ] Create CHANGELOG.md
- [ ] Document Skills migration
- [ ] Add version 3.11.0 entry
- [ ] Link to previous versions

### 8.3 Update Enhancement Roadmap

Update `/Users/alfonso/Documents/GitHub/api-dev-tools/ENHANCEMENT_ROADMAP_v3.11.0.md`:

**Add "Skills Migration Complete" section:**
```markdown
## ✅ Phase 1: Skills Migration (COMPLETE)

### Objectives
- [x] Convert all 20 commands to Agent Skills format
- [x] Create `.claude-plugin/marketplace.json`
- [x] Package hooks for cross-platform use
- [x] Test installation across platforms
- [x] Publish to SkillsMP marketplace

### Results
- **20 Skills Created**: All commands converted to SKILL.md format
- **Cross-Platform**: Works in Claude Code, VS Code, Cursor, ChatGPT
- **One-Command Install**: `/plugin install api-dev-tools`
- **Backward Compatible**: Original `.claude/commands/` still works

### Architecture
- Dual distribution (commands + skills)
- External hooks (referenced in settings.json)
- State tracking unchanged
- Research cache unchanged
```

**Tasks:**
- [ ] Add Skills Migration section
- [ ] Mark Phase 1 as complete
- [ ] Document architecture decisions
- [ ] Update timeline

---

## 🎯 Phase 9: Testing & Validation

### 9.1 Skills Validation

- [ ] Install skills-ref CLI: `npm install -g @agentskills/skills-ref`
- [ ] Validate all skills: `skills-ref validate .skills/`
- [ ] Fix validation errors
- [ ] Verify YAML frontmatter syntax
- [ ] Verify name matches directory

### 9.2 Cross-Platform Testing

#### Claude Code
- [ ] Test `/plugin marketplace add [local-path]`
- [ ] Test `/plugin install api-dev-tools`
- [ ] Test each skill invocation
- [ ] Verify hooks work
- [ ] Verify state tracking

#### VS Code
- [ ] Install skills manually to `~/.claude/skills/`
- [ ] Test skill discovery
- [ ] Test skill invocation
- [ ] Document limitations (no hooks)

#### Cursor
- [ ] Install skills manually
- [ ] Test skill discovery
- [ ] Test skill invocation
- [ ] Document limitations

### 9.3 Installation Testing

- [ ] Test NPM package install
- [ ] Test marketplace install
- [ ] Test manual install
- [ ] Test post-install script
- [ ] Verify all files copied
- [ ] Verify hooks executable

### 9.4 Workflow Testing

- [ ] Run `/api-create test-endpoint` end-to-end
- [ ] Verify all 13 phases execute
- [ ] Verify hooks enforce rules
- [ ] Verify state tracking
- [ ] Verify research cache
- [ ] Verify loop-back behavior

---

## 🎯 Phase 10: Publishing & Distribution

### 10.1 GitHub Repository

- [ ] Create GitHub repository: `hustle-together/api-dev-tools`
- [ ] Push all code to main branch
- [ ] Create GitHub release v3.11.0
- [ ] Add release notes from CHANGELOG
- [ ] Tag release: `git tag v3.11.0 && git push --tags`

### 10.2 NPM Package

- [ ] Update package.json version to 3.11.0
- [ ] Build distribution: `pnpm build`
- [ ] Test package locally: `npm pack`
- [ ] Publish to NPM: `npm publish --access public`
- [ ] Verify package page on npmjs.com
- [ ] Test installation: `npx @hustle-together/api-dev-tools`

### 10.3 SkillsMP Marketplace

- [ ] Create account on skillsmp.com
- [ ] Submit plugin for review
- [ ] Provide marketplace.json URL
- [ ] Provide repository URL
- [ ] Wait for approval
- [ ] Verify listing on skillsmp.com

### 10.4 Anthropic Skills Repository

- [ ] Fork anthropics/skills repository
- [ ] Add api-dev-tools to skills/ directory
- [ ] Create pull request
- [ ] Respond to review feedback
- [ ] Wait for merge
- [ ] Verify listing in official repository

### 10.5 Documentation Sites

- [ ] Create documentation site (optional - GitHub Pages)
- [ ] Add interactive demos
- [ ] Add video tutorials
- [ ] Link from README

---

## 🎯 Phase 11: Marketing & Community

### 11.1 Announcements

- [ ] Post on Twitter/X
- [ ] Post on LinkedIn
- [ ] Post on Reddit (r/ClaudeAI, r/ArtificialIntelligence)
- [ ] Post on Hacker News
- [ ] Post on Product Hunt
- [ ] Email Anthropic community team

### 11.2 Content Creation

- [ ] Write blog post: "Building Agent Skills for API Development"
- [ ] Create demo video
- [ ] Create tutorial series
- [ ] Create comparison guide (before/after Skills)

### 11.3 Community Building

- [ ] Create Discord/Slack channel
- [ ] Create GitHub Discussions
- [ ] Respond to issues
- [ ] Accept pull requests
- [ ] Build contributor guide

---

## 📊 Success Metrics

### Phase 1-2: Structure & Conversion (Week 1)
- [ ] 20 skills converted to SKILL.md format
- [ ] All skills validate with skills-ref
- [ ] Directory structure complete

### Phase 3-5: Packaging (Week 1)
- [ ] marketplace.json created
- [ ] Installation script working
- [ ] README.md updated

### Phase 6-8: Documentation (Week 2)
- [ ] CHANGELOG.md created
- [ ] All docs updated
- [ ] Installation instructions tested

### Phase 9: Testing (Week 2)
- [ ] Skills work in Claude Code
- [ ] Skills work in VS Code
- [ ] Skills work in Cursor
- [ ] Installation script works

### Phase 10: Publishing (Week 3)
- [ ] Published to GitHub
- [ ] Published to NPM
- [ ] Submitted to SkillsMP
- [ ] Submitted to anthropics/skills

### Phase 11: Adoption (Ongoing)
- [ ] 100+ GitHub stars
- [ ] 50+ NPM downloads/week
- [ ] 10+ community contributions
- [ ] Listed on SkillsMP homepage

---

## 🚨 Critical Success Factors

1. **Backward Compatibility**: Original `.claude/commands/` MUST still work
2. **Hook Preservation**: All 18 enforcement hooks MUST work unchanged
3. **State Tracking**: `.claude/api-dev-state.json` MUST work unchanged
4. **13-Phase Workflow**: All phases MUST execute in correct order
5. **Cross-Platform**: Skills MUST work in at least 3 platforms

---

## 🔄 Rollback Plan

If Skills migration fails:
1. Keep `.claude/commands/` as primary distribution
2. Mark `.skills/` as experimental
3. Revert package.json changes
4. Remove marketplace.json
5. Continue with v3.0.0 architecture

---

## 📚 References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [anthropics/skills Repository](https://github.com/anthropics/skills)
- [SkillsMP Marketplace](https://skillsmp.com)
- [skills-ref CLI](https://www.npmjs.com/package/@agentskills/skills-ref)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hustle-together/api-dev-tools/discussions)
- **Email**: contact@hustletogether.dev

---

**Status:** Ready for Implementation
**Next Step:** Begin Phase 1 - Directory Structure Setup
