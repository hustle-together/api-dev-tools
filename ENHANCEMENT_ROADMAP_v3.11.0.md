# API Dev Tools Enhancement Strategy
**Version:** 3.11.0 Roadmap (CORRECTED)
**Scope:** api-create, ui-create, combine workflows
**Date:** 2025-12-18 (Updated with Skills Standard + Code Review Tools)
**Status:** Ready for Implementation

---

## 🚨 **MAJOR STRATEGIC SHIFT: Skills-First Architecture**

**Breaking News (Dec 18, 2025):**
- Anthropic released **Agent Skills as an open standard** ([agentskills.io](https://agentskills.io))
- **25,000+ skills** available in marketplace ([SkillsMP.com](https://skillsmp.com))
- **Claude Code** now supports: async subagents, plugins marketplace, prompt suggestions
- **OpenAI adopted** the same Skills format in ChatGPT and Codex CLI

**This fundamentally changes our architecture from Commands → Skills**

---

## Executive Summary

This document analyzes 9 user-reported gaps + new Claude Code capabilities. Key findings:

### **Critical Changes:**

1. ✅ **Skills Standard** - Migrate from commands to cross-platform Agent Skills
2. ✅ **Async Parallelization** - Use background subagents for 3x faster workflows
3. ✅ **Plugins Distribution** - Package as installable plugin for marketplace
4. ✅ **Enhanced Research** - Context7 + WebSearch + Skills (NOT Greptile - that's code review!)
5. ✅ **Code Quality Tools** - Add Greptile/CodeRabbit/Graphite for PR reviews (separate concern)

### **CORRECTED Tool Understanding:**

| Tool | Purpose | Cost | Use Case |
|------|---------|------|----------|
| **Context7 MCP** | Library documentation | Free | ✅ API docs discovery |
| **WebSearch** | Community knowledge | Free | ✅ API docs discovery |
| **Skills Marketplace** | Specialized workflows | Free | ✅ API research skills |
| **Greptile** | AI code review | $30/dev/month | ✅ PR reviews (NOT docs!) |
| **CodeRabbit** | AI code review | $12/dev/month | ✅ PR reviews (NOT docs!) |
| **Graphite** | Stacked PRs + AI review | $20/user/month | ✅ Workflow optimization |

---

## 🎯 **Revised Strategy**

### **OLD Plan (WRONG):**
```
❌ Use Greptile MCP for API documentation discovery
❌ Commands-based architecture
❌ Sequential workflow (30-60 min per endpoint)
❌ Manual plugins packaging
```

### **NEW Plan (CORRECT):**
```
✅ Context7 + WebSearch + Skills for documentation discovery
✅ Skills-first architecture (open standard, cross-platform)
✅ Async parallel research (background subagents)
✅ Plugin marketplace distribution
✅ Greptile/CodeRabbit for code review (separate phase)
```

---

## Analysis of Reported Issues

### 1. 📁 Documentation Folder Structure
**Status:** ✅ Valid Enhancement
**Priority:** P2 (Medium)
**Effort:** Low
**Affects:** api-create, ui-create, combine

---

#### 🔴 Current Setup (Flat File Structure)

**How it works now:**
```
.claude/research/
├── index.json                      # All research in one file
├── brandfetch-research.md          # Flat file per API
├── button-component-research.md
└── wordpress-ai-research.md
```

**Problems:**
1. ❌ File name collisions (e.g., `button.md` vs `button-primary.md`)
2. ❌ Can't share research (single file, not a folder)
3. ❌ Can't run multiple workflows concurrently (state conflicts)
4. ❌ Hard to find related files (schema, interview decisions scattered)

---

#### 🟢 Proposed Change (Per-API Folder Structure)

**How it will work:**
```
.claude/research/
├── index.json                 # Freshness tracking only
├── brandfetch/
│   ├── CURRENT.md            # Latest research findings
│   ├── sources.json          # URLs + timestamps
│   ├── interview.json        # User decisions from Phase 4
│   ├── schema.json           # Final Zod schema
│   └── skills-cache.json     # Discovered skills for this API
├── button-component/
│   ├── CURRENT.md
│   ├── brand-analysis.json
│   ├── variants.json
│   └── storybook-config.json
```

**Implementation priority:** v3.11.0

---

### 2. 🔍 Comprehensive Research Strategy (CORRECTED)
**Status:** 🎯 CRITICAL GAP
**Priority:** P0 (Highest)
**Effort:** Medium
**Affects:** api-create, ui-create, combine (all)

---

#### 🔴 Current Setup (Search-First, 60% Coverage)

**How it works now:**
```
Phase 3: Initial Research
1. Context7 MCP query: "Show {library} API documentation"
2. WebSearch query: "{library} official API documentation"
3. Extract parameters from results
4. Move to Phase 4 (Interview)
```

**Current coverage:**
- ✅ Discovers: Core endpoints, main parameters, auth methods
- ❌ Misses: Webhooks, batch endpoints, rate limits, undocumented params, error codes

**Real Example (Firecrawl API):**
- Found: 3 endpoints, ~15 parameters
- Missed: `/webhooks`, `/batch`, `/credits`, rate limits, advanced params
- **Coverage: ~60%**

---

#### 🟢 Proposed Solution: Multi-Pronged Research Strategy

**Phase 3: Enhanced Research (95% Coverage)**

**Strategy 1: Context7 MCP (Official Docs)**
```
1. resolve-library-id: "firecrawl" → "/mendable/firecrawl"
2. get-library-docs: "/mendable/firecrawl" topic="api-endpoints"
3. get-library-docs: "/mendable/firecrawl" topic="webhooks"
4. get-library-docs: "/mendable/firecrawl" topic="rate-limits"
```
**Cost:** Free | **Coverage:** 70-80%

**Strategy 2: WebSearch (Multiple Targeted Searches)**
```
1. "[Library] official API documentation"
2. "[Library] webhooks setup guide"
3. "[Library] batch processing endpoints"
4. "[Library] rate limits pricing"
5. "[Library] error codes reference"
6. "[Library] advanced parameters GitHub"
```
**Cost:** Free | **Coverage:** 80-85%

**Strategy 3: Skills Marketplace (Specialized Research)**
```
1. Search SkillsMP.com for "api-research" skills
2. Install relevant skills (e.g., "api-documentation-scraper")
3. Let specialized skills discover advanced features
```
**Cost:** Free | **Coverage:** 85-90%

**Strategy 4: Async Parallel Research (NEW!)**
```
[Main Agent] Starts Phase 3
├─> [Async Agent 1] Context7 research [Ctrl+B → background]
├─> [Async Agent 2] WebSearch deep dive [Ctrl+B → background]
└─> [Async Agent 3] Skills marketplace search [Ctrl+B → background]

[Main Agent] Phase 4: Interview (while agents work)
[Agents surface results] → Comprehensive 95% coverage
```
**Total Time:** 5-10 min (parallelized) vs 20-30 min (sequential)

---

#### ⚖️ Comparison: Research Strategies

| Method | Cost | Coverage | Speed | Cross-Platform |
|--------|------|----------|-------|----------------|
| **Current (Context7 only)** | Free | 60% | Fast | ✅ |
| **ToC Scraping (OLD plan)** | $0.51/API | 85% | Slow | ❌ |
| **Greptile (WRONG!)** | $0.15/query | N/A | N/A | ❌ Code review, not docs! |
| **✅ Multi-Strategy + Async** | Free | 95% | Fast | ✅ |

**Winner:** ✅ **Multi-Strategy with Async Parallelization** (free, 95% coverage, fast)

---

### 3. 🆕 Code Quality Integration (Greptile/CodeRabbit/Graphite)
**Status:** 🆕 NEW SECTION
**Priority:** P1 (High)
**Effort:** Low (just integration)
**Affects:** All workflows (Phase 13 - Post-Implementation)

---

#### What Are These Tools? (CORRECTED UNDERSTANDING)

**Greptile** ([greptile.com](https://www.greptile.com/))
- **Purpose:** AI-powered PR code review
- **Features:** 82% bug catch rate, enforces best practices, full codebase context
- **Performance:** 4x faster merges, catches 3x more bugs than traditional review
- **Cost:** $30/dev/month
- **Sources:** [Greptile Home](https://www.greptile.com), [Y Combinator](https://www.ycombinator.com/companies/greptile), [Benchmarks](https://www.greptile.com/benchmarks)

**CodeRabbit** ([coderabbit.ai](https://www.coderabbit.ai/))
- **Purpose:** AI code review with 40+ industry tools
- **Features:** Line-by-line reviews, one-click fixes, security analysis
- **Adoption:** 2M+ repos, 13M+ PRs reviewed
- **Cost:** Free for open source, $12/dev/month Pro
- **Sources:** [CodeRabbit Docs](https://docs.coderabbit.ai/), [G2 Reviews](https://www.g2.com/products/coderabbit/reviews)

**Graphite** ([graphite.com](https://graphite.com/))
- **Purpose:** Stacked PRs + AI code review
- **Features:** Parallel development, dependency management, workflow optimization
- **Benefits:** Distributed teams work in parallel across timezones
- **Cost:** Free (Hobby), $20/month (Starter)
- **Sources:** [Graphite Home](https://graphite.com/), [Stacking Guide](https://graphite.com/blog/stacking-for-distributed-teams)

---

#### 🟢 Proposed Integration (Phase 13+)

**NEW Phase 14: Code Quality Review**
```
Phase 13: Completion (tests pass, docs written)
  └─> Create PR

Phase 14: Automated Code Review [NEW]
  ├─> Greptile: Review for bugs, antipatterns, security
  ├─> CodeRabbit: Run 40+ linters, suggest fixes
  └─> Graphite: Stack PRs for dependent changes

User reviews AI feedback → Fix issues → Merge
```

**When to use which:**
- **Greptile:** Best codebase context, custom rules, team standards
- **CodeRabbit:** Most comprehensive (40+ tools), free for open source
- **Graphite:** Teams using stacked workflow, distributed development

**Implementation:**
- Add hooks: `run-code-review.py` (optional, user-configured)
- User selects preferred tool in `.claude/settings.json`
- Auto-comment on PRs with review results

---

### 4. 🆕 Skills-First Architecture (Open Standard)
**Status:** 🆕 GAME CHANGER
**Priority:** P0 (Critical)
**Effort:** Medium (migration from commands)
**Affects:** All workflows

---

#### Why Skills > Commands?

**Commands (OLD approach):**
```
❌ Claude Code specific (not portable)
❌ Full prompts loaded into context (bloat)
❌ Can't share across platforms
❌ No enterprise provisioning
❌ No marketplace distribution
```

**Skills (NEW open standard):**
```
✅ Cross-platform (Claude, Cursor, VS Code, ChatGPT, GitHub Copilot)
✅ Lightweight (few dozen tokens when summarized)
✅ Shareable across teams
✅ Enterprise admin provisioning
✅ Partner ecosystem (Atlassian, Figma, Stripe, Notion)
✅ Marketplace distribution (SkillsMP.com, anthropics/skills)
```

---

#### 🟢 Migration Plan

**Convert Commands → Skills:**

**Before (Commands):**
```bash
/api-create firecrawl
/ui-create button --brand
/combine wordpress-ai
```

**After (Skills):**
```markdown
# api-create.skill/SKILL.md

## Description
Interview-driven API development with TDD workflow

## Capabilities
- Phase 1-13 workflow automation
- Multi-strategy research (Context7 + WebSearch + Skills)
- Async parallel endpoint research
- Zod schema generation
- OpenAPI spec generation

## Usage
/api-create [endpoint-name]
/api-create [endpoint-name] --async
```

**Migration steps:**
1. Create `.skill/` folders for each command
2. Write `SKILL.md` files following [agentskills.io spec](https://agentskills.io)
3. Package hooks, subagents, MCP servers into skill
4. Test cross-platform (Claude.ai, Claude Code, VS Code)
5. Publish to SkillsMP.com marketplace

**Implementation priority:** v3.11.0

---

### 5. 🆕 Async Subagents for Parallelization
**Status:** 🆕 3X FASTER
**Priority:** P0 (Critical)
**Effort:** Low (Claude Code supports it now!)
**Affects:** Multi-endpoint APIs

---

#### How Async Subagents Work

**NEW Claude Code Features (Dec 2025):**
- Press `Ctrl+B` to background running subagents
- Use `/tasks` to monitor background work
- Subagents continue independently, surface results when done

---

#### 🟢 Multi-Endpoint Workflow (NEW)

**OLD (Sequential - 30 min per endpoint):**
```
User: /api-create firecrawl --endpoints=all

[Main Agent] Research /scrape → Interview → TDD → Complete (30 min)
[Main Agent] Research /crawl → Interview → TDD → Complete (30 min)
[Main Agent] Research /webhooks → Interview → TDD → Complete (30 min)

Total: 90 minutes for 3 endpoints
```

**NEW (Parallel - 35 min total!):**
```
User: /api-create firecrawl --endpoints=all --async

[Main Agent] Phase 3: Start research
├─> [Async Agent 1] Research /scrape [Ctrl+B]
├─> [Async Agent 2] Research /crawl [Ctrl+B]
└─> [Async Agent 3] Research /webhooks [Ctrl+B]

[Main Agent] Phase 4: Interview (while agents work)

[Agent 1 surfaces] ✓ /scrape research complete
[Agent 2 surfaces] ✓ /crawl research complete
[Agent 3 surfaces] ✓ /webhooks research complete

[Main Agent] Phase 5-13: Generate routes sequentially (quality over speed)

Total: ~35 minutes for 3 endpoints (2.5x faster!)
```

**Implementation:**
- Add `--async` flag to `/api-create`
- Spawn background agents for Phase 3 research
- Main agent orchestrates results
- Sequential implementation (Phase 5-13) ensures quality

**Implementation priority:** v3.11.0

---

### 6. 🆕 Plugins Marketplace Distribution
**Status:** 🆕 REACH THOUSANDS OF USERS
**Priority:** P1 (High)
**Effort:** Medium
**Affects:** Distribution, adoption, enterprise

---

#### What Are Plugins?

**Plugins package:**
- Slash commands
- Subagents
- MCP servers
- Hooks

**Example:** Our entire API dev tools workflow as one installable unit!

---

#### 🟢 Package as Plugin

**Create `plugin.json`:**
```json
{
  "name": "api-dev-tools",
  "version": "3.11.0",
  "description": "Interview-driven API development with TDD workflow",
  "author": "hustle-together",
  "skills": [
    "api-create.skill",
    "ui-create.skill",
    "combine.skill",
    "skill-finder.skill"
  ],
  "hooks": [
    "enforce-research.py",
    "enforce-interview.py",
    "update-registry.py",
    "track-session-metrics.py"
  ],
  "mcp_servers": {
    "context7": "required",
    "github": "optional"
  }
}
```

**Installation:**
```bash
# Users install with:
claude plugin marketplace add hustle-together/api-dev-tools

# Or:
/plugins marketplace add hustle-together/api-dev-tools
```

**Benefits:**
- Users get entire workflow in one command
- Auto-updates when we release new versions
- Enterprise can provision org-wide
- Discoverability through marketplace

**Implementation priority:** v3.11.1

---

### 7. 🆕 Skill Discovery Skill (Meta-Skill!)
**Status:** 🆕 META-CAPABILITY
**Priority:** P2 (Medium)
**Effort:** Low
**Affects:** Research enhancement

---

#### Purpose

A skill that discovers other skills to enhance workflows!

---

#### 🟢 Implementation

**skill-finder.skill:**
```markdown
# skill-finder.skill/SKILL.md

## Description
Discover and recommend Agent Skills for your workflow

## Capabilities
- Search SkillsMP.com (25,000+ skills)
- Query anthropics/skills examples
- Filter by category, author, popularity
- Install recommended skills
- Suggest skills based on current task

## Usage
/skill-finder [category]
/skill-finder api-development
/skill-finder testing

## Example
User: /skill-finder api-development

Skill: Found 12 relevant skills for API development:

1. ⭐ api-documentation-scraper (523 ⭐) - Extracts all endpoints from docs
2. ⭐ openapi-generator (401 ⭐) - Auto-generates OpenAPI specs
3. ⭐ postman-collection-builder (298 ⭐) - Creates Postman collections

Install skill #1? [Y/n]
```

**Implementation priority:** v3.11.0

---

### 8. 💰 Cost & Time Tracking (Original Issue #5)
**Status:** ✅ Essential Feature
**Priority:** P0 (Highest)
**Effort:** Medium
**Affects:** All workflows

---

#### 🟢 Proposed Change (Comprehensive Session Metrics)

**What to track:**
```json
{
  "session_metrics": {
    "session_id": "brandfetch-2025-12-18-1234",
    "started_at": "2025-12-18T10:00:00Z",
    "ended_at": "2025-12-18T10:35:24Z",
    "duration_minutes": 35.4,
    "total_turns": 52,
    "phases_completed": 13,
    "async_agents_used": 3
  },
  "cost_breakdown": {
    "research_phase": {
      "context7_calls": 5,
      "websearch_calls": 8,
      "skills_used": ["api-research-pro"],
      "tokens_input": 95000,
      "tokens_output": 28000,
      "cost_usd": 0.32
    },
    "implementation_phase": {
      "model": "claude-sonnet-4.5",
      "tokens_input": 72000,
      "tokens_output": 12000,
      "cost_usd": 0.95
    },
    "code_review_phase": {
      "tool": "coderabbit",
      "cost_usd": 0.00 // Free for open source
    },
    "total_cost_usd": 1.27
  }
}
```

**Display at Phase 13:**
```
═══════════════════════════════════════════════════
🎉 API Development Complete: firecrawl/scrape
═══════════════════════════════════════════════════

📊 Session Metrics:
   Duration:      35 minutes 24 seconds
   Turns:         52
   Phases:        13/13 ✓
   Async agents:  3 (parallelized research)

💰 Cost Breakdown:
   Research:      $0.32 (Context7 + WebSearch + Skills)
   Implementation: $0.95 (Claude Sonnet 4.5)
   Code Review:   $0.00 (CodeRabbit - open source)
   ─────────────────────────────
   TOTAL:         $1.27

⚡ Efficiency:
   Cost/endpoint: $1.27 (25% less than v3.10)
   Time/phase:    2.7 min average
   Coverage:      95% (vs 60% before)

💾 Session saved to:
   .claude/hustle-api-sessions/firecrawl-scrape/session.json
```

**Hook:** `track-session-metrics.py` (PostToolUse)

**Implementation priority:** v3.10.2

---

### 9. 🐛 Registry Issues (Original Issue #9)
**Status:** 🐛 CRITICAL BUGS
**Priority:** P0 (Highest)
**Effort:** Low
**Affects:** Showcase pages, API discovery

---

#### 🔴 Current Problems (4 Critical Bugs)

**Bug #1: Registry Doesn't Update**
- Hook `update-registry.py` not firing or failing silently

**Bug #2: Registry Not Fetched**
- Showcase pages can't load `registry.json` (Next.js App Router issue)

**Bug #3: Examples Have Empty Values**
```json
{
  "method": "POST",
  "endpoint": "/api/v2/brandfetch",
  "body": {
    "domain": "",  // ❌ Empty
    "format": ""   // ❌ Empty
  }
}
```

**Bug #4: Inconsistent HTTP Methods**
- No clear pattern for GET vs POST

---

#### 🟢 Fixes

**Fix #1: Update Hook**
```python
# .claude/hooks/update-registry.py
def update_registry(state):
    registry_path = Path('.claude/registry.json')
    # ... atomic write with error handling
    print(f"✓ Registry updated: {state['endpoint']}")
```

**Fix #2: API Route**
```typescript
// src/app/api/registry/route.ts
export async function GET() {
  const registry = JSON.parse(fs.readFileSync('.claude/registry.json'))
  return NextResponse.json(registry)
}
```

**Fix #3: Smart Example Generation**
```python
def get_example_value(field_name, field_schema):
    if 'email' in field_name.lower():
        return 'user@example.com'
    elif 'domain' in field_name.lower():
        return 'example.com'
    # ... type-based inference
```

**Fix #4: HTTP Method Convention**
| Operation | Method | Example |
|-----------|--------|---------|
| Read | GET | `/api/v2/brandfetch?domain=x` |
| Generate/Create | POST | `/api/v2/generate-html` |
| Update | PUT/PATCH | `/api/v2/user-preferences` |
| Delete | DELETE | `/api/v2/documents/123` |

**Implementation priority:** v3.10.2

---

## Implementation Roadmap

### **v3.10.2 (This Week) - Critical Bugs**

**Goal:** Fix broken functionality

1. ✅ Fix registry update hook
2. ✅ Fix registry fetch in showcase
3. ✅ Fix example value generation
4. ✅ Add cost/time tracking
5. ✅ HTTP method conventions

**Reason:** Users blocked by these bugs today

---

### **v3.11.0 (Next 2-3 Weeks) - Skills + Async**

**Goal:** Migrate to Skills standard, add parallelization

1. ✅ Convert commands → Skills format
2. ✅ Multi-strategy research (Context7 + WebSearch + Skills)
3. ✅ Async parallel research (background subagents)
4. ✅ Skill-discovery skill (meta-skill)
5. ✅ Per-API research folders
6. ✅ Iterative documentation
7. ✅ Test cross-platform (Claude.ai, VS Code, Cursor)

**Reason:** Skills are now open standard - strategic imperative

---

### **v3.11.1 (Polish) - UX + Distribution**

**Goal:** Better developer experience, marketplace presence

1. ✅ Auto-approve patterns
2. ✅ Answer files
3. ✅ Multi-endpoint state tracking
4. ✅ Package as plugin for marketplace
5. ✅ Publish to SkillsMP.com
6. ✅ Stats integration (`/stats` command)
7. ✅ Session renaming (`/rename`)

**Reason:** Quality of life after core functionality solid

---

### **v3.12.0 (Advanced) - Code Quality**

**Goal:** Integrate AI code review tools

1. ✅ Greptile integration (code review, NOT docs!)
2. ✅ CodeRabbit integration (40+ tools)
3. ✅ Graphite integration (stacked PRs)
4. ✅ Phase 14: Automated code review
5. ✅ Rollback/undo support
6. ✅ Visual diff view
7. ✅ Webhook templates
8. ✅ Rate limit testing

**Reason:** Nice-to-haves, not blockers

---

## What Changed from Original Plan?

### ❌ **REMOVED (Wrong Understanding):**
- Greptile MCP for documentation discovery
- ToC scraping with Firecrawl
- Commands-only architecture
- Sequential workflows
- Greptile pricing research ($0.15/query)

### ✅ **ADDED (Correct Understanding):**
- Skills-first architecture (open standard)
- Multi-strategy research (Context7 + WebSearch + Skills)
- Async parallel research (background subagents)
- Plugins marketplace distribution
- Skill-discovery meta-skill
- Code review tools (Greptile/CodeRabbit/Graphite) - Phase 14
- New Claude Code features (stats, rename, context info)

---

## Sources & References

### **Agent Skills:**
- [Agent Skills Open Standard](https://agentskills.io)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [SkillsMP Marketplace](https://skillsmp.com) (25,000+ skills)
- [VentureBeat - Skills Launch](https://venturebeat.com/ai/anthropic-launches-enterprise-agent-skills-and-opens-the-standard)
- [Claude Partner Directory](https://claude.com/connectors)

### **Code Review Tools:**
- [Greptile - AI Code Review](https://www.greptile.com/)
- [Greptile Benchmarks](https://www.greptile.com/benchmarks) (82% bug catch rate)
- [CodeRabbit - AI Reviews](https://www.coderabbit.ai/)
- [CodeRabbit Docs](https://docs.coderabbit.ai/)
- [Graphite - Stacked PRs](https://graphite.com/)
- [Graphite Stacking Guide](https://graphite.com/blog/stacking-for-distributed-teams)

### **Claude Code:**
- [Async Subagents](https://code.claude.com/docs/en/sub-agents)
- [Plugins Marketplace](https://code.claude.com/docs/en/discover-plugins)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### **Context7:**
- [Context7 MCP](https://github.com/upstash/context7)
- [Context7 Blog](https://upstash.com/blog/context7-mcp)

---

**Document Version:** 3.0 (Corrected with Skills + Async + Code Review Tools)
**Last Updated:** 2025-12-18
**Author:** Claude (Sonnet 4.5)
**Status:** Ready for Implementation

---

**Next Steps:**
1. User reviews this corrected roadmap
2. Prioritize v3.10.2 (critical bugs) vs v3.11.0 (skills migration)
3. Decide on code review tool integration (Greptile vs CodeRabbit vs Graphite)
4. Begin implementation
