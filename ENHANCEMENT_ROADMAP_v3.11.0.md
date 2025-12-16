# API Dev Tools Enhancement Strategy
**Version:** 3.11.0 Roadmap
**Scope:** api-create, ui-create, combine workflows
**Date:** 2025-12-13

---

## Executive Summary

This document analyzes 9 user-reported gaps + Greptile integration opportunity. Key findings:

- **Critical Gap:** Research phase lacks comprehensive documentation discovery (60% → 100%)
- **Game Changer:** Greptile ($0.15/query) is 3.4x cheaper and more accurate than planned ToC scraping ($0.51)
- **Missing Feature:** Cost/time tracking across all workflows
- **UX Issue:** Documentation happens too late in the process
- **Bug:** Registry updates are incomplete

**Major Update:** Replace map-reduce ToC scraping with Greptile MCP integration in v3.11.0

**Estimated Scope:** v3.11.0 (major with Greptile), v3.11.1 (polish)

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

**Current behavior:**
- All research goes into flat `.md` files at root level
- File names: `{api-name}-research.md`
- No nested structure
- Metadata stored in single `index.json` file
- Research is written once at Phase 12 (Documentation)

**Problems:**
1. ❌ File name collisions (e.g., `button.md` vs `button-primary.md`)
2. ❌ Can't share research (single file, not a folder)
3. ❌ Can't run multiple workflows concurrently (state conflicts)
4. ❌ Hard to find related files (schema, interview decisions scattered)
5. ❌ No support for multiple research sessions per API

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
│   └── greptile-cache.json   # 7-day cached queries
├── button-component/
│   ├── CURRENT.md
│   ├── brand-analysis.json
│   ├── variants.json
│   └── storybook-config.json
└── wordpress-ai-orchestration/
    ├── CURRENT.md
    ├── flow-diagram.json
    ├── error-handling.json
    └── api-dependencies.json
```

**New behavior:**
- Each API gets its own folder: `.claude/research/{api-name}/`
- `CURRENT.md` is the single source of truth (written incrementally)
- Supporting files (schema, interview, cache) in same folder
- Multiple sessions supported via timestamp subfolders (optional)
- Research is portable (zip folder, share with team)

**Migration:**
- Automatic migration on first run after upgrade
- Old flat files moved to `{api-name}/CURRENT.md`
- Graceful fallback if old structure detected

---

#### ⚖️ Pros and Cons Comparison

**Current Approach (Flat Structure):**

✅ **Pros:**
- Simple to implement
- Easy to find files (all at root level)
- Minimal disk space
- Fast file access (no nesting)

❌ **Cons:**
- **Naming conflicts** - Can't have `button.md` and `button-icon.md` without confusion
- **Not shareable** - Can't package research for a single API
- **Concurrent workflows blocked** - Two `/api-create` commands overwrite each other
- **Hard to debug** - Related files scattered across root folder
- **No versioning** - Can't keep multiple research sessions
- **Manual cleanup** - Stale files accumulate over time

---

**Proposed Approach (Per-API Folders):**

✅ **Pros:**
- **No naming conflicts** - Each API isolated in its own folder
- **Portable research** - Zip `.claude/research/brandfetch/` and share
- **Concurrent workflows** - Multiple APIs can run simultaneously
- **Easier debugging** - All related files in one place
- **Version support** - Can keep multiple sessions per API
- **Automatic cleanup** - Delete folder = clean slate
- **Mirrors existing patterns** - Same structure as session logger
- **Better organization** - Sources, schema, cache all grouped

❌ **Cons:**
- **More complex structure** - Requires folder creation logic
- **Migration needed** - Existing users need file moves
- **Slightly slower access** - One extra directory level
- **More disk space** - Metadata per-folder instead of shared

---

#### 🔵 Implementation Details

**Files to modify:**
1. `.claude/hooks/cache-research.py` - Update to write to `{api}/CURRENT.md`
2. `.claude/hooks/enforce-freshness.py` - Check `{api}/sources.json` timestamps
3. `.claude/hooks/session-startup.py` - Read from folder structure
4. `.claude/commands/api-research.md` - Document new folder structure

**New files to create:**
1. `scripts/api-dev-tools/migrate-research-cache.js` - One-time migration utility
2. `templates/research/CURRENT.md.template` - Template for new research files
3. `.claude/research/.gitkeep` - Ensure folder exists in fresh installs

**Breaking changes:**
- None (graceful migration with fallback detection)

**Migration strategy:**
```javascript
// Pseudocode
if (existsFlatFile(`${api}-research.md`)) {
  createFolder(`.claude/research/${api}/`);
  moveFile(`${api}-research.md`, `.claude/research/${api}/CURRENT.md`);
  extractMetadata(indexJson, api) → save to `sources.json`;
}
```

---

#### 🟡 Migration Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Lost research data | 🟡 Medium | Backup before migration, rollback on failure |
| Broken hooks | 🟡 Medium | Graceful fallback to flat structure if folder missing |
| User confusion | 🟢 Low | Clear migration message, automatic |
| Concurrent access | 🟢 Low | Lock file during migration |

**Recommendation:** ✅ **Proceed with migration in v3.11.0**

---

### 2. 🔍 Comprehensive Research Hook (Documentation Discovery)
**Status:** 🎯 CRITICAL GAP
**Priority:** P0 (Highest)
**Effort:** High
**Affects:** api-create, ui-create, combine (all)

---

#### 🔴 Current Setup (Search-First Approach)

**How it works now:**

**Phase 3: Initial Research**
1. Context7 MCP query: "Show {library} API documentation"
2. WebSearch query: "{library} official API documentation"
3. Extract parameters from results
4. Move to Phase 4 (Interview)

**Example workflow (Firecrawl):**
```
User: /api-create firecrawl
Claude: [Phase 3] Researching Firecrawl...
  → Context7: "Show Firecrawl API"
  → WebSearch: "Firecrawl official API documentation"
  → Found: /scrape, /crawl, /map endpoints
  → Proceed to interview
```

**Current coverage metrics:**
- ✅ Discovers: Core endpoints explicitly documented
- ✅ Discovers: Main parameters with clear examples
- ✅ Discovers: Authentication methods (usually prominent)
- ❌ Misses: Webhooks (separate docs section)
- ❌ Misses: Batch endpoints (advanced features)
- ❌ Misses: Rate limits (buried in ToS)
- ❌ Misses: Undocumented parameters (in source code only)
- ❌ Misses: Error codes (not in overview docs)

**Real Example (Firecrawl API):**
- **Searched for:** `/scrape`, `/crawl`, `/map`
- **Found:** 3 endpoints, ~15 parameters
- **Missed:** `/webhooks`, `/batch`, `/credits`, rate limits, `excludePaths`, `allowBackwardLinks`
- **Coverage:** ~60% of actual API surface

---

#### 🔴 Root Cause Analysis

**The workflow assumes:**
1. ✅ You know what to search for (FALSE - can't search for unknown features)
2. ✅ Documentation is complete and discoverable (FALSE - undocumented params exist)
3. ✅ Search results show everything (FALSE - ToC structure reveals more than search)

**Reality:**
- 🔴 APIs have undocumented features (source code is truth)
- 🔴 ToC/navigation reveals structure that search doesn't
- 🔴 Webhooks/batch endpoints often in separate documentation sections
- 🔴 Advanced parameters only in code examples, not formal docs
- 🔴 Error codes scattered across multiple pages

**Why search-first fails:**
- Can't find what you don't know to search for
- Search engines prioritize popular docs (miss advanced features)
- Documentation ToC shows full API surface area
- Source code contains undocumented parameters

---

#### 🟡 Proposed Solution A: Map-Reduce Research Pattern (Original TLDR Plan)

**How it would work:**

**Phase 3: Initial Research (MAP - breadth)**
```
1. WebSearch: "[API] official documentation" → find docs homepage
2. Firecrawl: Scrape ToC/sidebar HTML
3. Parse navigation structure → extract all endpoint paths
4. Haiku LLM: Categorize endpoints (core, advanced, utils)
5. Generate feature matrix
6. Estimate coverage: 80-90%
```

**Phase 5: Deep Research (REDUCE - depth)**
```
1. For selected endpoints, deep dive with Sonnet
2. WebFetch each endpoint documentation page
3. Extract all parameters, error codes, examples
4. Cost: $0.48 (multiple page fetches)
```

**Total cost breakdown:**
- Phase 3 (Firecrawl): $0.03
- Phase 5 (multiple WebFetch + Sonnet): $0.48
- **Total:** $0.51/API
- **Coverage:** 85%

---

#### 🟢 Proposed Solution B: Greptile MCP Integration (RECOMMENDED)

**What is Greptile?**
- AI codebase intelligence platform ($0.15/query standard, $0.45/genius)
- Builds codegraph of functions, classes, variables, call relationships
- Natural language queries return context-aware results
- MCP server available (same pattern as Context7)
- SOC2 compliant, supports 30+ languages

**Research:**
- [Greptile Official Site](https://www.greptile.com/)
- [Greptile Pricing](https://www.greptile.com/pricing) - $0.15/query, $30/dev/month for PR reviews
- [Y Combinator - Greptile](https://www.ycombinator.com/companies/greptile) - $25M Series A (Sept 2025)

**Phase 3: Initial Research with Greptile**
```
1. Try Context7 first (free, fast)
2. If insufficient docs, propose Greptile to user
3. Greptile queries:
   - "List all API endpoints for {library}"
   - "Show webhooks and async features"
   - "Show authentication methods"
   - "Show rate limits and quotas"
4. Cache results (7-day freshness)
```

**Phase 5: Deep Research with Greptile**
```
For complex features discovered in interview:
1. Query: "Show {feature} implementation with parameters"
2. Query: "Show error codes for {endpoint}"
3. Cost: $0.15 per query
```

**Phase 10: Verification with Greptile Genius**
```
If 3+ gaps found:
1. Propose Greptile Genius ($0.45)
2. Query: "Compare parameters to source code"
3. User approves before charging
```

---

#### ⚖️ Comprehensive Comparison: All Three Approaches

**Cost & Coverage Summary:**

| Method | Phase 3 | Phase 5 | Phase 10 | Total | Coverage | Winner? |
|--------|---------|---------|----------|-------|----------|---------|
| **🔴 Current (Context7)** | $0.05 | $0.05 | $0 | **$0.10** | **60%** | ❌ Cheapest but incomplete |
| **🟡 ToC Scraping (Plan A)** | $0.03 | $0.48 | $0 | **$0.51** | **85%** | ❌ Better but expensive |
| **🟢 Greptile (Plan B)** | $0.05 | $0.10 | $0 | **$0.15** | **95%** | ✅ **BEST VALUE** |
| **🔵 Greptile + Genius** | $0.05 | $0.10 | $0.45 | **$0.60** | **98%** | ⚠️ Premium option |

**Winner:** 🟢 **Greptile standard queries** (3.4x cheaper than ToC, 95% coverage, +35% vs current)

---

#### ⚖️ Detailed Pros and Cons

**🔴 Current Approach (Context7 + WebSearch)**

✅ **Pros:**
- **Free** - No API costs
- **Fast** - Immediate results (< 5 seconds)
- **No setup** - Works out of the box
- **No API keys needed** - No account creation
- **Reliable** - Context7 rarely fails
- **Good for popular libraries** - Well-documented APIs work fine
- **Minimal user friction** - No approval prompts

❌ **Cons:**
- **Only 60% coverage** - Misses 40% of API features (**CRITICAL**)
- **Search bias** - Only finds what you search for
- **No undocumented feature discovery** - Can't read source code
- **Misses advanced features** - Webhooks, batch, rate limits
- **Documentation-dependent** - If docs are incomplete, so is coverage
- **No structural understanding** - Can't see full API surface area
- **Error code gaps** - Scattered across docs, hard to find
- **Manual follow-up required** - User must discover missed features later

**Cost savings: $0** | **Quality: 60%** | **User friction: Low**

---

**🟡 Plan A: ToC Scraping (Map-Reduce)**

✅ **Pros:**
- **85% coverage** - Discovers hidden endpoints via ToC structure (+25% vs current)
- **Systematic approach** - Breadth-first discovery guarantees completeness
- **Works for all APIs** - Any documentation site with navigation
- **No API keys needed** - Uses free Firecrawl/WebFetch
- **Discovers structure** - Sees full API organization
- **Reveals advanced features** - ToC shows webhooks, batch, admin sections
- **Categorization built-in** - Haiku groups endpoints logically

❌ **Cons:**
- **Expensive** - $0.51/API (5.1x more than current) (**HIGH COST**)
- **Still documentation-dependent** - If feature isn't in ToC, still missed
- **No undocumented parameters** - Can't read source code
- **Complex implementation** - HTML parsing, ToC extraction logic
- **Fragile** - Breaks if docs site structure changes
- **Slower** - Multiple page fetches + LLM calls (30-60 seconds)
- **Firecrawl dependency** - New external service to maintain
- **False positives** - May extract non-API links from navigation

**Cost increase: +$0.41/API** | **Quality: 85%** | **User friction: Low**

---

**🟢 Plan B: Greptile MCP Integration (RECOMMENDED)**

✅ **Pros:**
- **95% coverage** - Best discovery rate (+35% vs current, +10% vs ToC)
- **3.4x cheaper than Plan A** - $0.15 vs $0.51 (**BEST VALUE**)
- **Source code truth** - Discovers undocumented parameters
- **Natural language queries** - No HTML parsing, no fragile scraping
- **MCP integration** - Same pattern as Context7 (already in workflow)
- **Fast** - Query response in 3-5 seconds
- **Adaptive** - Use only when Context7 insufficient (cost control)
- **User approval required** - Cost transparency built-in
- **7-day caching** - Query once, reuse for week
- **Fallback strategy** - Graceful degradation if unavailable
- **Discovers code patterns** - Call relationships, dependencies
- **SOC2 compliant** - Enterprise-ready security

❌ **Cons:**
- **Requires API key** - User must sign up for Greptile ($30/dev/month or pay-as-you-go)
- **GitHub dependency** - Only works for open-source libraries with public repos
- **Cost per query** - $0.15 standard, $0.45 genius (but cheaper than Plan A)
- **New external service** - Another dependency to maintain
- **MCP server setup** - One-time configuration needed
- **Not for closed-source** - Private APIs without GitHub repos excluded
- **Query limits** - API rate limits may apply
- **Approval friction** - User prompt before each query (by design)

**Cost increase: +$0.05/API** | **Quality: 95%** | **User friction: Medium** | **Value: Excellent**

---

**🔵 Plan B+: Greptile with Genius Mode (Premium)**

✅ **Pros:**
- **98% coverage** - Highest possible (+38% vs current)
- **Deep source verification** - Compares implementation to parameters
- **Catches memory errors** - Verifies Claude didn't hallucinate params
- **Perfect for verification** - Phase 10 (after implementation)
- **Adaptive proposal** - Only suggested if 3+ gaps found

❌ **Cons:**
- **Expensive** - $0.60 total if Genius used (6x current cost)
- **Overkill for most APIs** - 95% coverage sufficient
- **Requires 3+ gaps** - Only triggered on complex APIs
- **User approval required** - Must explicitly opt-in to $0.45 charge

**Cost increase: +$0.50/API** | **Quality: 98%** | **User friction: High** | **Value: Good for complex APIs**

---

#### 🎯 Strategic Recommendation

**Decision:** ✅ **Implement Plan B (Greptile standard queries)**

**Reasoning:**
1. **Best value** - 3.4x cheaper than Plan A, 95% coverage
2. **Source code access** - Discovers undocumented features (Plan A can't)
3. **Lower risk** - MCP pattern already proven with Context7
4. **Adaptive cost** - Only pay when Context7 insufficient
5. **User control** - Approval required before cost incurred
6. **Fallback strategy** - Graceful degradation to current approach

**Implementation priority:** v3.11.0 (after bug fixes in v3.10.2)

**This is the most important enhancement.** The current workflow is fundamentally flawed because it can't discover what it doesn't know to search for. Greptile solves this at 1/3 the cost of ToC scraping while providing superior coverage.

#### Integration Strategy

**Decision Tree: When to Use Greptile**
```
Phase 3: Initial Research
├─> Try Context7 first (free)
├─> Context7 comprehensive? → Use Context7, proceed
└─> Context7 sparse/missing?
    ├─> Detect GitHub repo
    ├─> Repo found? → PROPOSE Greptile ($0.15)
    └─> User approves? → Query Greptile
```

**User Approval Required:** All Greptile queries require explicit user consent (cost transparency)

#### New Hooks Needed
1. `enforce-greptile-approval.py` - Blocks Greptile without user approval
2. `track-greptile-cost.py` - Logs cost per query ($0.15 or $0.45)
3. Modify `track-tool-use.py` - Add Greptile query tracking

#### Files to Create/Modify
- `.claude/mcp-config.json` - Add Greptile MCP server
- `.claude/hooks/enforce-greptile-approval.py` (NEW)
- `.claude/hooks/track-tool-use.py` (MODIFY - add Greptile tracking)
- `.claude/api-dev-state.json` - Add `repository` field, update sources schema
- `.claude/research/{api}/greptile-cache.json` (NEW - 7-day cache)
- `.claude/commands/api-research.md` (UPDATE - document Greptile)

---

### 3. 📊 Tracking Large Plans (Multi-Endpoint APIs)
**Status:** ❓ Needs Design Decision
**Priority:** P1 (High)
**Effort:** Medium
**Affects:** api-create (primarily)

---

#### 🔴 Current Setup (Single-Endpoint State Tracking)

**How it works now:**

**State file structure:**
```json
{
  "version": "1.0.0",
  "endpoint": "brandfetch",
  "current_phase": 8,
  "phases": {
    "disambiguation": { "status": "complete" },
    "scope": { "status": "complete" },
    "research_initial": { "status": "complete" },
    "interview": { "status": "complete" },
    "research_deep": { "status": "complete" },
    "schema": { "status": "complete" },
    "environment": { "status": "complete" },
    "tdd_red": { "status": "in_progress" }
  }
}
```

**Current workflow for multi-endpoint APIs:**
```
User: /api-create firecrawl
Claude: [Phase 3] Found 12 endpoints (/scrape, /crawl, /map, /batch, ...)
Claude: Which endpoints do you want to build?
User: "All of them"
Claude: [Phase 4-13] Builds ONE endpoint (e.g., /scrape)
Claude: [Phase 13] Complete! (But what about the other 11?)
User: ... now what? Start over for /crawl?
```

**The Scenario:**
User discovers an API has **50 endpoints**. Current interview asks:
> "Which endpoints do you want to build?"

**Current problems:**
1. ❌ No visual interface to select/deselect endpoints
2. ❌ State file doesn't track per-endpoint progress
3. ❌ Can't pause and resume mid-API (loses progress)
4. ❌ Must manually run `/api-create [api]-[endpoint]` for each one
5. ❌ No way to see "25/50 endpoints complete"
6. ❌ User forgets which endpoints are done
7. ❌ Can't prioritize (e.g., "core first, then advanced")

**Real Example (Stripe API):**
- 300+ endpoints across 50+ resources
- Current workflow: Build payment endpoint, then... restart for refunds? customers? subscriptions?
- No progress tracking across resources
- No way to defer non-essential endpoints

---

#### 🟢 Proposed Solutions (Three Options)

**Option A: Checkbox Interview (Recommended)**
```markdown
Based on research, Firecrawl API has 12 endpoints:

Core Endpoints:
☐ POST /scrape      - Single page scrape
☐ POST /crawl       - Multi-page crawl
☐ POST /map         - Site structure mapping

Advanced:
☐ POST /batch       - Batch processing
☐ GET  /credits     - Check credits
☑ POST /webhooks    - Register webhook (SELECTED)

Which endpoints should we build?
[1] All (12 endpoints)
[2] Core only (3 endpoints)
[3] Custom selection (specify numbers: 1,3,6)
```

**Option B: Multi-Endpoint State**
```json
{
  "endpoint": "firecrawl",
  "type": "multi_endpoint_api",
  "endpoints": {
    "scrape": { "status": "complete", "phase": 13 },
    "crawl": { "status": "in_progress", "phase": 8 },
    "webhooks": { "status": "deferred", "phase": null }
  },
  "active_sub_endpoint": "crawl"
}
```

**Option C: Batch Mode**
Generate all routes at once, test together:
```
src/app/api/v2/firecrawl/
├── scrape/route.ts
├── crawl/route.ts
├── map/route.ts
├── batch/route.ts
└── __tests__/
    └── firecrawl-integration.test.ts  # Tests all endpoints
```

---

#### ⚖️ Pros and Cons: Three Approaches

**🔴 Current (Single-Endpoint Only)**

✅ **Pros:**
- Simple state structure
- Easy to understand
- Works fine for single-endpoint APIs (70% of use cases)
- No complex UI needed

❌ **Cons:**
- **Breaks for multi-endpoint APIs** - Must manually restart for each endpoint
- **No progress tracking** - Can't see 5/50 complete
- **No resumability** - Session interruption loses all progress
- **No prioritization** - Can't mark core vs optional endpoints
- **User friction** - Tedious for large APIs (Stripe, AWS, Twilio)

---

**🟡 Option A: Checkbox Interview**

✅ **Pros:**
- **Visual selection** - User sees all endpoints at once
- **Batch selection** - "All (12)", "Core only (3)", "Custom (1,3,6)"
- **Clear prioritization** - Group by category (core, advanced, admin)
- **User control** - Explicit selection before work starts
- **Good UX** - Familiar checkbox pattern
- **No accidental work** - User approves scope upfront

❌ **Cons:**
- **Terminal UI limitations** - Checkboxes hard to render in CLI
- **Long lists** - 50+ endpoints = wall of text
- **No filtering** - Must scroll through all endpoints
- **Static** - Can't change selection mid-workflow

---

**🟢 Option B: Multi-Endpoint State (Recommended)**

✅ **Pros:**
- **Per-endpoint progress** - Track phase 1-13 for each endpoint separately
- **Resumable** - Session interruption = resume where you left off
- **Pausable** - User can defer endpoints ("build /scrape now, /webhooks later")
- **Progress visibility** - "5/12 endpoints complete"
- **Concurrent workflows** - Multiple APIs in progress simultaneously
- **Granular commits** - One commit per endpoint (better git history)
- **Quality over speed** - One endpoint at a time ensures thorough tests

❌ **Cons:**
- **Complex state structure** - Nested objects for each endpoint
- **Slower** - One endpoint at a time (but higher quality)
- **More disk writes** - State updated per-endpoint, not per-API
- **Harder to visualize** - Need `/api-status` command to see progress

---

**🔵 Option C: Batch Mode**

✅ **Pros:**
- **Fast** - Generate all routes at once
- **Simple** - One schema, one test file
- **Good for similar endpoints** - CRUD operations (GET/POST/PUT/DELETE)
- **Less user time** - No per-endpoint interviews
- **Efficient for demos** - Quick scaffold of entire API

❌ **Cons:**
- **Superficial tests** - One test file for 50 endpoints = low coverage (**CRITICAL**)
- **No per-endpoint validation** - Miss edge cases unique to each endpoint
- **Hard to debug** - If one endpoint fails, which one?
- **All-or-nothing** - Can't pause or prioritize
- **Lower quality** - Speed over thoroughness
- **Defeats TDD** - Red-Green-Refactor loses meaning with batch generation

---

#### 🎯 Strategic Recommendation

**Decision:** ✅ **Option A + Option B Hybrid**

**Implementation:**
1. **Phase 4 (Interview):** Use checkbox UI (Option A) to select endpoints
2. **State tracking:** Use multi-endpoint state (Option B) to track per-endpoint progress
3. **Execution:** Generate routes ONE AT A TIME (quality over speed)
4. **Visualization:** `/api-status firecrawl` shows progress dashboard

**Why not Option C (batch)?**
Tests would be superficial. One endpoint at a time ensures thorough validation. TDD workflow loses meaning if we generate 50 files at once without individual Red-Green-Refactor cycles.

**New State Schema:**
```json
{
  "version": "3.11.0",
  "workflow_type": "multi_endpoint",
  "api_name": "firecrawl",
  "endpoints": {
    "firecrawl/scrape": {
      "phase": 13,
      "status": "complete",
      "route_path": "src/app/api/v2/firecrawl/scrape/route.ts",
      "test_path": "src/app/api/v2/firecrawl/scrape/__tests__/scrape.test.ts",
      "completed_at": "2025-12-16T10:45:00Z"
    },
    "firecrawl/crawl": {
      "phase": 8,
      "status": "in_progress",
      "route_path": "src/app/api/v2/firecrawl/crawl/route.ts",
      "started_at": "2025-12-16T11:00:00Z"
    },
    "firecrawl/webhooks": {
      "phase": null,
      "status": "deferred",
      "priority": "low"
    }
  },
  "active_endpoint": "firecrawl/crawl",
  "progress": {
    "completed": 1,
    "in_progress": 1,
    "pending": 10,
    "total": 12,
    "completion_percentage": 8
  }
}
```

**User experience:**
```bash
$ /api-create firecrawl
[Phase 3] Discovered 12 endpoints...
[Phase 4] Which endpoints should we build?

Core Endpoints:
☑ POST /scrape      - Single page scrape
☑ POST /crawl       - Multi-page crawl
☐ POST /map         - Site structure mapping

Advanced:
☐ POST /batch       - Batch processing
☐ GET  /credits     - Check credits
☐ POST /webhooks    - Register webhook

[1] All (12 endpoints)
[2] Core only (3 endpoints)
[3] Custom selection (specify numbers: 1,2)

Your choice: 2

✓ Selected 3 endpoints. Building one at a time...
[Phase 5-13] Building /scrape... ✓ Complete!
[Phase 5-13] Building /crawl... (in progress)

$ /api-status firecrawl
╔══════════════════════════════════════╗
║ Firecrawl API Progress              ║
╠══════════════════════════════════════╣
║ ✓ /scrape     [Phase 13] Complete   ║
║ ⚙ /crawl      [Phase 8]  In Progress║
║ ⏸ /map        [Deferred]             ║
╚══════════════════════════════════════╝
```

---

### 4. 🤖 Autonomous Mode
**Status:** ⚠️ Philosophical Conflict
**Priority:** P3 (Low - discuss first)
**Effort:** Medium
**Affects:** All workflows

---

#### 🔴 Current Setup (Interview-Driven Development)

**How it works now:**

**Core philosophy:** Human-in-the-loop at every decision point

**13-Phase workflow requires user input at:**
- Phase 1: Disambiguate ambiguous terms
- Phase 2: Confirm scope understanding
- Phase 4: Answer 10-15 questions about API behavior
- Phase 5: Approve deep research queries (if needed)
- Phase 7: Confirm environment/API keys available
- Phase 10: Review verification results, approve fixes
- Phase 13: Final review before commit

**Example interaction:**
```
[Phase 4] Interview Questions:
1. How should errors be handled?
   a) Throw exceptions
   b) Return error objects
   c) Use Result<T, E> pattern

User: b) Return error objects

2. What caching strategy?
   a) No caching
   b) In-memory (24 hours)
   c) User-configurable TTL

User: c) User-configurable TTL

[Claude implements based on USER decisions]
```

**Benefits:**
- ✅ User preferences encoded in implementation
- ✅ No assumptions (always ask, never guess)
- ✅ Prevents over-engineering (user says "simple" → stays simple)
- ✅ Catches misunderstandings early (Phase 2 confirmation)
- ✅ User learns about API (reading questions = education)

**Drawbacks:**
- ❌ Requires user attention for 30-60 minutes
- ❌ Can't run unattended (no CI/CD integration)
- ❌ Blocks on user availability

---

#### 🔴 The Request
User said:
> "Run a mode that lets it just go autonomously where the questions are answered by Claude."

**Implied use cases:**
1. Testing the workflow itself (verify hooks work)
2. Demo mode (show workflow without manual input)
3. Regression testing (re-build known APIs)
4. CI/CD integration (automated API scaffolding)

---

#### 🔴 The Philosophical Conflict

**The package is built on interview-driven development to prevent:**
1. ❌ Self-answering questions (Claude guesses instead of asking)
2. ❌ Assumption-based implementation (Claude defaults to "what most APIs do")
3. ❌ Context dilution (forgetting user preferences over 50+ turns)
4. ❌ Over-engineering (Claude adds features user doesn't want)

**Autonomous mode would:**
- ✅ Speed up demos/testing
- ✅ Allow CI/CD integration
- ✅ Enable regression testing
- ❌ **Defeat the core value proposition** (no more interview-driven)
- ❌ **Reduce implementation quality** (assumptions instead of decisions)
- ❌ **Remove user control** (Claude decides, not user)

---

#### 🟡 Proposed Solution A: Full Autonomous Mode (NOT RECOMMENDED)

**How it would work:**
```bash
/hustle-api-create brandfetch --autonomous
```

**Behavior:**
- Phase 1: Skip (no disambiguation)
- Phase 2: Auto-confirm scope
- Phase 3: Run research automatically
- Phase 4: Claude answers its own questions with defaults
- Phase 5-13: Auto-proceed through all phases
- No user prompts at any stage

---

#### 🟢 Proposed Solution B: Demo Mode with Guardrails

**How it would work:**
```bash
/hustle-api-create brandfetch --demo-mode
```

**Demo mode behavior:**
1. Phase 1-2: Auto-confirm scope
2. Phase 3: Run research, auto-proceed
3. Phase 4: Answer interview questions with DEFAULTS
4. Phase 5: Skip deep research (use initial research only)
5. Phase 6-13: Auto-confirm at each checkpoint
6. **Final output:** `.claude/demo-sessions/brandfetch-demo.json` (full transcript)

**Guardrails:**
- ✅ Can only use demo mode on APIs ALREADY in registry (prevents novel APIs)
- ✅ Logs all auto-decisions to review file
- ✅ Hook: `detect-demo-mode.py` - Adds `[DEMO]` prefix to all commits
- ✅ Creates demo branch (not main)
- ✅ Never pushes to remote

---

#### 🔵 Proposed Solution C: Answer File (RECOMMENDED)

**How it would work:**
```bash
/hustle-api-create brandfetch --answers=.claude/research/brandfetch/answers.json
```

**Answer file format:**
```json
{
  "scope": "Build all endpoints",
  "format_preference": "Both SVG and PNG",
  "caching_strategy": "24 hours in-memory",
  "error_handling": "Error objects with codes",
  "rate_limiting": "Respect API limits (600 req/hour)",
  "retry_strategy": "Exponential backoff (3 retries max)"
}
```

**Behavior:**
- User pre-writes answers to interview questions
- Workflow reads from file instead of prompting user
- User still reviews at Phase 2, 10, 13 (critical checkpoints)
- Full traceability (answer file is version controlled)

---

#### ⚖️ Pros and Cons Comparison

**🔴 Current (Interview-Driven)**

✅ **Pros:**
- **High quality** - User decisions encoded in implementation
- **No assumptions** - Always ask, never guess
- **User control** - Every decision explicit
- **Educational** - User learns about API through questions
- **Catches misunderstandings** - Early confirmation prevents wrong implementation

❌ **Cons:**
- **Requires user time** - 30-60 minutes of active participation
- **Not automatable** - Can't run in CI/CD
- **Blocks on user** - Must wait for user responses
- **Tedious for demos** - Hard to show workflow quickly

---

**🟡 Solution A: Full Autonomous (NOT RECOMMENDED)**

✅ **Pros:**
- **Fast** - No user interaction needed (5-10 minutes)
- **CI/CD friendly** - Can run unattended
- **Good for demos** - Quick showcase of workflow
- **Regression testing** - Re-build APIs automatically

❌ **Cons:**
- **Defeats core value proposition** - No interview-driven development (**CRITICAL**)
- **Assumptions everywhere** - Claude guesses instead of asking
- **Lower quality** - Generic defaults don't match user preferences
- **No user control** - Can't influence decisions
- **Over-engineering risk** - Claude may add unwanted features
- **Not production-ready** - Must manually review/fix implementation

---

**🟢 Solution B: Demo Mode with Guardrails**

✅ **Pros:**
- **Fast for testing** - Verify workflow hooks work
- **Controlled autonomy** - Only for known APIs
- **Clear labeling** - `[DEMO]` commits prevent confusion
- **Safe** - Demo branch, never pushes to remote
- **Transparent** - Full transcript saved for review
- **Good for CI/CD testing** - Validate workflow itself, not APIs

❌ **Cons:**
- **Limited use case** - Only for APIs already in registry
- **Still lower quality** - Default answers don't match user preferences
- **Manual cleanup** - Must delete demo branches
- **Confusing** - Users might expect production-ready output
- **Maintenance burden** - Must maintain default answer logic

---

**🔵 Solution C: Answer File (RECOMMENDED)**

✅ **Pros:**
- **Best of both worlds** - Automation + quality
- **Version controlled** - Answers tracked in git
- **Reproducible** - Same answers = same implementation
- **Shareable** - Team can reuse answer files
- **Explicit defaults** - User writes answers, not Claude
- **Good for regression** - Re-build with same decisions
- **CI/CD friendly** - Automated with user-defined answers
- **Production-ready** - User approved all decisions upfront

❌ **Cons:**
- **Upfront work** - Must write answer file first
- **File maintenance** - Must update if questions change
- **Not truly autonomous** - Still requires user input (just earlier)
- **Learning curve** - Users must understand answer file format

---

#### 🎯 Strategic Recommendation

**Decision:** ✅ **Solution C: Answer File Approach**

**Reasoning:**
1. **Preserves interview-driven philosophy** - User still makes all decisions
2. **Enables automation** - Pre-write answers, run unattended
3. **Production quality** - User-approved decisions, not defaults
4. **Version controlled** - Answer files tracked in git
5. **Shareable** - Team can collaborate on answer files
6. **Graceful migration** - If users demand full autonomy later, add Solution B

**Implementation plan:**
1. **v3.11.1:** Implement answer file support
2. **v3.11.1:** Add `/api-create --generate-answers` to create template
3. **v3.12.0:** Add demo mode if users request it (validate with data)

**Valid use cases:**
1. ✅ **Regression testing** - Re-build API with same decisions
2. ✅ **Team standardization** - Share answer files for consistency
3. ✅ **CI/CD integration** - Automated scaffolding with user-approved answers
4. ✅ **Faster iterations** - Pre-answer common questions

**Invalid use cases:**
1. ❌ **Production API development** - Still should use interactive interview (higher quality)
2. ❌ **Learning new APIs** - Interview process is educational

**User experience:**
```bash
# First time: Generate answer template
$ /api-create brandfetch --generate-answers
✓ Created .claude/research/brandfetch/answers.json
  Edit this file, then re-run with --answers flag

# Second time: Use answers
$ /api-create brandfetch --answers=.claude/research/brandfetch/answers.json
[Phase 1-3] Running research...
[Phase 4] Using answers from file (no prompts)
[Phase 5-13] Building...
✓ Complete!

# CI/CD: Same answer file works everywhere
$ git add .claude/research/brandfetch/answers.json
$ git commit -m "Add Brandfetch answer template"
```

---

### 5. 💰 Cost & Time Tracking
**Status:** ✅ Essential Feature
**Priority:** P0 (Highest)
**Effort:** Medium
**Affects:** All workflows

---

#### 🔴 Current Setup (No Tracking)

**How it works now:**
- Zero cost tracking across workflows
- No time tracking
- No metrics dashboard
- No session summaries
- Users have no visibility into:
  - How much each API costs to build
  - Which phases take the most time
  - Quality metrics (verification loops, re-research counts)
  - Cost comparison between APIs

**Current pain points:**
1. ❌ Can't optimize workflow (don't know where bottlenecks are)
2. ❌ Can't budget for API development (unknown costs)
3. ❌ Can't measure quality (no verification loop tracking)
4. ❌ Can't compare efficiency (no baseline metrics)
5. ❌ Can't justify Greptile cost ($0.15/query) without data

**User quote:**
> "I don't know if spending $1.70 per API is good or bad because I have no data"

---

#### 🟢 Proposed Change (Comprehensive Session Metrics)

#### What to Track
```json
{
  "session_metrics": {
    "session_id": "brandfetch-2025-12-13-1234",
    "started_at": "2025-12-13T10:00:00Z",
    "ended_at": "2025-12-13T10:45:32Z",
    "duration_minutes": 45.5,
    "total_turns": 67,
    "phases_completed": 13
  },
  "cost_breakdown": {
    "research_phase": {
      "context7_calls": 5,
      "websearch_calls": 8,
      "tokens_input": 125000,
      "tokens_output": 32000,
      "cost_usd": 0.42
    },
    "implementation_phase": {
      "model": "claude-sonnet-4.5",
      "tokens_input": 89000,
      "tokens_output": 15000,
      "cost_usd": 1.20
    },
    "total_cost_usd": 1.62
  },
  "efficiency_metrics": {
    "cost_per_endpoint": 1.62,
    "time_per_phase_avg_minutes": 3.5,
    "re_research_count": 2,
    "verification_loops": 1
  }
}
```

---

#### ⚖️ Pros and Cons

**🔴 Current (No Tracking)**

✅ **Pros:**
- Simple (no overhead)
- No storage required
- No parsing logic needed

❌ **Cons:**
- **Zero visibility** - Can't see costs or time
- **Can't optimize** - Don't know bottlenecks
- **Can't budget** - Unknown costs per API
- **Can't measure quality** - No metrics
- **Can't justify new features** - No data for Greptile ROI

---

**🟢 Proposed (Comprehensive Tracking)**

✅ **Pros:**
- **Full visibility** - Cost, time, quality metrics
- **Optimization data** - Identify bottlenecks
- **Budget planning** - Know expected costs
- **Quality measurement** - Track verification loops
- **ROI justification** - Data to support Greptile investment
- **Comparison** - Benchmark between APIs
- **Session replay** - Full transcript for debugging
- **Historical trends** - Track improvements over time

❌ **Cons:**
- **Implementation effort** - Hook logic, parsing, storage
- **Disk space** - Session files accumulate
- **Maintenance** - Must update if Claude Code output format changes
- **Privacy** - Session transcripts contain API keys (must sanitize)

---

#### 🔵 Implementation Details

**Hook: `track-session-metrics.py` (PostToolUse)**
- Fires after every tool use
- Logs to `.claude/api-dev-state.json`
- Aggregates at Phase 13
- Sanitizes sensitive data (API keys, secrets)

**Challenge:** Getting token counts from Claude Code
**Solution:** Parse from tool results, estimate when unavailable

**Data retention:**
- State file: Persistent (until cleaned manually)
- Session files: 30-day retention (auto-cleanup)
- Aggregate stats: Permanent (`.claude/metrics/summary.json`)

#### Display at End
```
═══════════════════════════════════════════════════════
🎉 API Development Complete: brandfetch
═══════════════════════════════════════════════════════

📊 Session Metrics:
   Duration:      45 minutes 32 seconds
   Turns:         67
   Phases:        13/13 ✓

💰 Cost Breakdown:
   Research:      $0.42 (Context7 + WebSearch)
   Implementation: $1.20 (Claude Sonnet 4.5)
   Verification:  $0.08 (Phase 10 re-research)
   ─────────────────────────────
   TOTAL:         $1.70

⚡ Efficiency:
   Cost/endpoint: $1.70
   Time/phase:    3.5 min average
   Verification loops: 1 (excellent!)

💾 Session saved to:
   .claude/hustle-api-sessions/brandfetch/session.json
```

**Strategic value:** 🎯 Must-have feature. Users need visibility into:
1. How much each API costs to build
2. Where time is spent (identify bottlenecks)
3. Quality metrics (verification loops = quality indicator)

**Bonus:** This data can optimize the workflow itself.

**Recommendation:** ✅ Implement in v3.10.2 (critical bugs release)

---

### 6. ⚡ Auto-Approve Edits
**Status:** ⚠️ Security vs Speed Trade-off
**Priority:** P2 (Medium)
**Effort:** Low
**Affects:** All workflows

---

#### 🔴 Current Setup (Permission Required)

**How it works now:**
```
Claude: I need to edit src/app/api/v2/brandfetch/route.ts
User: [Approve] or [Reject]
Claude: I need to edit src/app/api/v2/brandfetch/__tests__/brandfetch.test.ts
User: [Approve] or [Reject]
... (repeat 10-20 times per workflow)
```

**Current behavior:**
- Claude Code prompts user before every Write/Edit/Delete operation
- User must click [Approve] for each file operation
- Workflow pauses until user responds
- Security: User can reject malicious or incorrect operations

**User pain point:**
- 10-20 approval prompts per workflow = tedious
- Must stay present for entire workflow
- Can't step away during long workflows

---

#### 🟢 Proposed Solutions (Three Approaches)

#### 🔵 Option A: Pattern-Based Auto-Approve (RECOMMENDED)

**How it would work:**
```json
// .claude/settings.json
{
  "auto_approve": {
    "enabled": false,  // Default: OFF
    "allowed_patterns": [
      "src/app/api/v2/**/*.ts",
      "src/app/api/v2/**/__tests__/*.test.ts"
    ],
    "blocked_patterns": [
      ".env*",
      "package.json",
      ".claude/hooks/*.py",
      "node_modules/**"
    ],
    "require_approval_for": [
      "delete",
      "outside_project"
    ]
  }
}
```

**User enables with:**
```bash
/hustle-api-create brandfetch --auto-approve
```

**Hook behavior:**
- `enforce-auto-approve.py` checks settings
- If enabled + file matches allowed pattern → auto-approve
- If blocked pattern or deletion → still require approval
- If outside project directory → require approval

---

#### ⚖️ Security Implications & Pros/Cons

| Scenario | With Approval | Pattern Auto-Approve | Global Auto-Approve |
|----------|--------------|---------------------|---------------------|
| Malicious prompt injection | 🟢 User can reject | 🟡 Pattern limits damage | 🔴 Code gets written |
| Claude hallucinates wrong file | 🟢 User catches it | 🟡 Only allowed paths affected | 🔴 File overwritten |
| Accidental deletion | 🟢 User prevents | 🟢 Deletion blocked | 🔴 Data lost |
| Edit .env file | 🟢 User rejects | 🟢 Blocked pattern | 🔴 Secrets overwritten |
| Edit package.json | 🟢 User reviews | 🟢 Blocked pattern | 🔴 Dependencies broken |

---

**🔴 Current (Permission Required)**

✅ **Pros:**
- **Maximum security** - User reviews every operation
- **Catch errors** - User prevents hallucinated file paths
- **Prevent accidents** - User blocks deletions
- **Audit trail** - User explicitly approves each change

❌ **Cons:**
- **Tedious** - 10-20 approvals per workflow
- **Blocks workflow** - Can't step away
- **User friction** - Interrupts focus
- **Slow** - Adds 5-10 minutes to workflow

---

**🟢 Option A: Pattern-Based (RECOMMENDED)**

✅ **Pros:**
- **Safe** - Only API files, never config/secrets
- **Granular control** - Allowed/blocked patterns
- **Still blocks dangerous ops** - Deletions require approval
- **Faster workflow** - No prompts for safe operations
- **User can step away** - Auto-approves safe files
- **Explicit opt-in** - Default OFF, must enable per-workflow
- **Audit trail** - Hook logs all auto-approved operations

❌ **Cons:**
- **Pattern maintenance** - Must update if file structure changes
- **False sense of security** - User might trust too much
- **Still requires some approvals** - Deletions, blocked patterns
- **Implementation complexity** - Pattern matching logic

---

**🔵 Option B: Global Auto-Approve (NOT RECOMMENDED)**

✅ **Pros:**
- **Zero prompts** - Complete automation
- **Fastest** - No interruptions
- **Simple** - No pattern logic needed

❌ **Cons:**
- **Maximum risk** - Any file can be overwritten (**CRITICAL**)
- **No protection** - Malicious prompts succeed
- **Accidental data loss** - Deletions auto-approved
- **Secrets at risk** - .env files can be overwritten
- **No audit trail** - Operations happen silently

---

#### 🎯 Strategic Recommendation

**Decision:** ✅ **Option A: Pattern-Based Auto-Approve**

**Default configuration:**
```json
{
  "auto_approve": {
    "enabled": false,  // OFF by default (security first)
    "allowed_patterns": [
      "src/app/api/v2/**/*.ts",  // API routes
      "src/app/api/v2/**/__tests__/*.test.ts"  // Tests
    ],
    "blocked_patterns": [
      ".env*",  // Environment secrets
      "*.key",  // Key files
      "*.pem",  // Certificates
      "package.json",  // Dependencies
      "package-lock.json",  // Lock file
      ".claude/hooks/**",  // Workflow hooks
      ".claude/settings.json",  // Settings
      ".git/**"  // Git internals
    ],
    "require_approval_for": [
      "delete",  // Always confirm deletions
      "outside_project",  // Outside working directory
      "hidden_files"  // Dotfiles (except allowed)
    ]
  }
}
```

**Implementation priority:** v3.11.1 (UX enhancements)

**Reasoning:**
- Safety first (default OFF)
- Granular control (pattern-based)
- Still catches dangerous operations
- Significant UX improvement for power users

---

### 7. 📝 Iterative Documentation
**Status:** ✅ Better UX
**Priority:** P1 (High)
**Effort:** Medium
**Affects:** All workflows

---

#### 🔴 Current Setup (Documentation at End Only)

**How it works now:**

**Current documentation flow:**
```
Phase 3: Research
  └─> Findings stored in memory only

Phase 4: Interview
  └─> User decisions stored in memory only

Phase 5: Deep Research
  └─> Additional findings stored in memory only

Phase 6-11: Implementation
  └─> No documentation written

Phase 12: Documentation (FINALLY!)
  └─> Try to recall everything from memory
  └─> Write: api-tests-manifest.json entry
  └─> Write: OpenAPI spec
  └─> Cache: .claude/research/index.json
```

**Current problems:**
1. ❌ **Memory loss** - By Phase 12 (50+ turns later), details are forgotten
2. ❌ **Context dilution** - Specific parameters discovered in Phase 3 lost
3. ❌ **No resumability** - Session interruption = lose all research
4. ❌ **Can't verify** - Phase 10 has no written record to compare against
5. ❌ **Not shareable** - Research only in memory, not portable
6. ❌ **Single point of failure** - All documentation at once, if Phase 12 fails, lose everything

**User quote:**
> "Documentation happens at the end but not during the actual research phase... we need to iteratively add to the documentation so we don't lose track"

---

#### 🟢 Proposed Change (Write as You Go)

**New iterative flow:**
```
Phase 3: Initial Research
  └─> Write: .claude/research/{api}/CURRENT.md (Section: "## Initial Research")

Phase 4: Interview
  └─> Append: CURRENT.md (Section: "## Interview Decisions")
  └─> Write: interview.json

Phase 5: Deep Research
  └─> Append: CURRENT.md (Section: "## Deep Research - Advanced Features")

Phase 6: Schema
  └─> Write: schema.json
  └─> Append: CURRENT.md with schema summary

Phase 10: Verification
  └─> Read: CURRENT.md (compare to implementation)
  └─> Append: "## Verification Results"

Phase 12: Final Documentation
  └─> Read: CURRENT.md (single source of truth)
  └─> Generate: api-tests-manifest.json
  └─> Generate: OpenAPI spec
```

---

#### ⚖️ Pros and Cons Comparison

**🔴 Current (Documentation at End)**

✅ **Pros:**
- Simple (one-time write at Phase 12)
- No intermediate file writes
- Minimal disk I/O

❌ **Cons:**
- **Memory loss** - 50+ turns between research and documentation (**CRITICAL**)
- **Context dilution** - Forgets details discovered early
- **Not resumable** - Session interruption loses all research
- **Can't verify** - Phase 10 has no written record to compare
- **Not shareable** - Research only in memory
- **Single point of failure** - If Phase 12 fails, lose everything

---

**🟢 Proposed (Iterative Documentation)**

✅ **Pros:**
- **Zero memory loss** - Everything written immediately
- **Better verification** - Phase 10 compares to written docs
- **Resumable** - Read CURRENT.md to resume after interruption
- **Shareable** - Zip research folder, send to team
- **Audit trail** - See evolution of research
- **Incremental visibility** - User sees progress in real-time
- **Safer** - Distributed writes = no single point of failure

❌ **Cons:**
- **More disk writes** - Write at Phases 3, 4, 5, 6, 10, 12
- **File size grows** - CURRENT.md gets larger
- **Append complexity** - Must handle markdown append
- **Potential conflicts** - If file locked/edited externally

---

#### 🎯 Strategic Recommendation

**Decision:** ✅ **Implement Iterative Documentation**

**Implementation priority:** v3.11.0 (with research overhaul)

**This is how it should have worked from the start.** Current approach relies on Claude's memory, which is unreliable over 50+ turns.

---

### 8. ❓ Template Output
**Status:** ❓ Needs Clarification
**Priority:** P? (Unknown)
**Effort:** Unknown
**Affects:** Unknown

---

#### 🔴 Current Setup (Unknown)

**User said:**
> "The template is an output at the end with the API."

**Unclear what this refers to:**
1. Route.ts template for code generation?
2. Documentation templates?
3. Test manifest templates?
4. OpenAPI spec templates?
5. Answer file templates (Section 4)?

---

#### ⚖️ Possible Interpretations

**Option A: Route Template**
- Current: `templates/route.ts.template` for API routes
- Issue: Template not customizable?

**Option B: Documentation Template**
- Current: No template for documentation
- Issue: Want consistent documentation format?

**Option C: Test Template**
- Current: Test generation uses inline logic
- Issue: Want reusable test templates?

**Option D: Answer File Template (from Section 4)**
- Current: No template for answer files
- Proposed: `/api-create --generate-answers` creates template
- **Already covered in Section 4**

---

#### 🎯 Request for Clarification

**Questions for user:**
1. What specific template are you referring to?
2. What is the current behavior that's problematic?
3. What would you like the template to do instead?
4. Can you provide an example?

**Recommendation:** ⏸️ **Pause until clarified** - Can't design solution without understanding the problem.

---

### 9. 🐛 Registry Issues (Multiple Critical Bugs)
**Status:** 🐛 Multiple Bugs
**Priority:** P0 (Highest - broken functionality)
**Effort:** Medium
**Affects:** All workflows + Showcase pages

---

#### 🔴 Current Setup (Broken Registry System)

**How it's supposed to work:**
```
Phase 13: Completion
  └─> Hook: `update-registry.py` (PostToolUse)
  └─> Update: `.claude/registry.json`
  └─> Add new API entry with:
      - name, endpoint, method
      - request/response schemas
      - example values
      - test instructions

Showcase pages read registry.json
  └─> Display all APIs in UI
  └─> Provide interactive testing
```

**Current problems - 4 critical bugs:**

**Bug #1: Registry Doesn't Update**
- **Expected:** After Phase 13, `registry.json` gets new entry
- **Actual:** Registry file unchanged
- **Root cause:** `update-registry.py` hook not firing or failing silently

**Bug #2: Registry Not Fetched**
- **Expected:** Showcase pages read `registry.json` and display APIs
- **Actual:** Empty or static list
- **Root cause:** Template page doesn't have fetch logic

**Bug #3: Examples Have Empty Values**
- **Expected:** Example body has valid sample values
- **Actual:** All example values are empty strings
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
- **Observation:** Some endpoints use GET, some POST, some both
- **Problem:** No consistent pattern for when to use which method

**Impact:**
- ❌ Showcase pages broken (can't discover APIs)
- ❌ Can't test APIs interactively
- ❌ New APIs don't appear in UI
- ❌ Examples don't work (empty values)

**User quote:**
> "The registry didn't update at the end. And the registry doesn't actually get fetched into the template page"

---

#### 🟢 Proposed Fixes (Four Bug Fixes)

**Fix #1: Registry Update Hook**

**Root cause investigation:**
1. Check if hook is registered in `.claude/settings.json`
2. Check if hook fires (add debug logging)
3. Check if file write succeeds (permissions)
4. Check if hook crashes silently (error handling)

**Proposed fix:**
```python
# .claude/hooks/update-registry.py
import json
import os
from pathlib import Path

def update_registry(state):
    try:
        registry_path = Path('.claude/registry.json')

        # Ensure file exists
        if not registry_path.exists():
            registry = {"version": "1.0.0", "apis": []}
        else:
            with open(registry_path, 'r') as f:
                registry = json.load(f)

        # Add new API entry
        new_api = {
            "name": state["endpoint"],
            "path": f"/api/v2/{state['endpoint']}",
            "method": state.get("http_method", "POST"),
            "schema": state.get("schema", {}),
            "examples": generate_examples(state["schema"]),
            "added_at": datetime.now().isoformat()
        }

        # Remove duplicates, update existing
        registry["apis"] = [api for api in registry["apis"]
                            if api["name"] != state["endpoint"]]
        registry["apis"].append(new_api)

        # Write with atomic operation
        temp_path = registry_path.with_suffix('.tmp')
        with open(temp_path, 'w') as f:
            json.dump(registry, f, indent=2)
        temp_path.replace(registry_path)  # Atomic

        print(f"✓ Registry updated: {state['endpoint']}")
        return True

    except Exception as e:
        print(f"❌ Registry update failed: {e}")
        # Don't block workflow, just log
        return False
```

---

**Fix #2: Registry Fetch in Showcase**

**Current (broken):**
```tsx
// src/app/api-showcase/page.tsx
import registryData from '@/.claude/registry.json';  // ❌ Doesn't work in Next.js App Router
```

**Proposed fix:**
```tsx
// Step 1: Create API route
// src/app/api/registry/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const registryPath = path.join(process.cwd(), '.claude/registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    return NextResponse.json(registry);
  } catch (error) {
    return NextResponse.json({ error: 'Registry not found', apis: [] }, { status: 404 });
  }
}

// Step 2: Update showcase page
// src/app/api-showcase/page.tsx
'use client';
import { useEffect, useState } from 'react';

export default function APIShowcase() {
  const [apis, setApis] = useState([]);

  useEffect(() => {
    fetch('/api/registry')
      .then(res => res.json())
      .then(data => setApis(data.apis || []))
      .catch(err => console.error('Failed to load registry:', err));
  }, []);

  return (
    <div>
      {apis.map(api => (
        <APICard key={api.name} api={api} />
      ))}
    </div>
  );
}
```

---

**Fix #3: Example Value Generation**

**Current (broken):**
```python
# Generates empty examples
example_body = {key: "" for key in schema.keys()}
```

**Proposed fix:**
```python
def generate_examples(zod_schema):
    """Generate realistic example values from Zod schema"""

    def get_example_value(field_name, field_schema):
        # Use schema default if available
        if hasattr(field_schema, '_def') and field_schema._def.get('defaultValue'):
            return field_schema._def.defaultValue

        # Type-based examples
        type_name = field_schema._def.typeName

        if type_name == 'ZodString':
            # Use field name to infer example
            if 'email' in field_name.lower():
                return 'user@example.com'
            elif 'url' in field_name.lower() or 'domain' in field_name.lower():
                return 'example.com'
            elif 'name' in field_name.lower():
                return 'John Doe'
            else:
                return 'example_value'

        elif type_name == 'ZodNumber':
            return 100

        elif type_name == 'ZodBoolean':
            return True

        elif type_name == 'ZodEnum':
            # Use first enum value
            return field_schema._def.values[0]

        elif type_name == 'ZodArray':
            # Generate array with one example element
            element_schema = field_schema._def.type
            return [get_example_value(field_name, element_schema)]

        else:
            return None

    example_body = {}
    for field_name, field_schema in zod_schema.shape.items():
        example_body[field_name] = get_example_value(field_name, field_schema)

    return example_body
```

---

**Fix #4: HTTP Method Consistency**

**Proposed convention:**
| Operation | HTTP Method | Example |
|-----------|-------------|---------|
| **Read data** | GET | `/api/v2/brandfetch?domain=example.com` |
| **Create/Generate** | POST | `/api/v2/generate-html` (body: prompt) |
| **Update** | PUT/PATCH | `/api/v2/user-preferences` |
| **Delete** | DELETE | `/api/v2/documents/123` |
| **Idempotent reads** | GET | `/api/v2/health` |

**Guideline for workflow:**
- Default to POST for AI operations (generate, analyze, transform)
- Use GET for queries with simple params (health, status, fetch)
- Document in Phase 2 (Scope confirmation)

---

#### ⚖️ Impact Assessment

**Current (Broken):**

❌ **Problems:**
- **Zero API discovery** - Can't find created APIs
- **No interactive testing** - Showcase pages don't work
- **Wasted effort** - Built APIs but can't use them
- **Poor UX** - User must manually track APIs
- **Examples don't work** - Empty values can't be tested

---

**Proposed (Fixed):**

✅ **Benefits:**
- **Full API discovery** - All APIs visible in registry
- **Interactive testing** - Showcase pages work correctly
- **Better UX** - Central API catalog
- **Working examples** - Realistic values for testing
- **Consistent patterns** - HTTP methods follow conventions

---

#### 🎯 Strategic Recommendation

**Decision:** ✅ **Fix all 4 bugs in v3.10.2 (this week)**

**Priority:** **CRITICAL** - Registry is a core feature, currently completely broken

**Implementation order:**
1. Fix #1 (Registry update) - Most critical, blocks everything else
2. Fix #3 (Example generation) - Quick win, high value
3. Fix #2 (Registry fetch) - Showcase page functionality
4. Fix #4 (HTTP method convention) - Documentation/guideline update

**Testing strategy:**
```bash
# Test registry update
$ /api-create test-api
$ cat .claude/registry.json  # Should show new entry

# Test showcase fetch
$ curl http://localhost:3001/api/registry  # Should return JSON

# Test examples
$ cat .claude/registry.json | jq '.apis[0].examples'
# Should show realistic values, not empty strings
```

**Files to create/modify:**
1. `.claude/hooks/update-registry.py` - Fix registration logic
2. `src/app/api/registry/route.ts` - New API endpoint for fetching
3. `src/app/api-showcase/page.tsx` - Update to fetch from API
4. `.claude/commands/api-research.md` - Document HTTP method conventions

**Estimated time:** 1 day (4 hours per bug)

**This MUST be fixed before any other enhancements.** Without a working registry, the entire showcase feature is useless.

---

## Additional Gaps Identified

### Gap 10: No Rollback/Undo
**Scenario:** User completes Phase 8, realizes scope was wrong
**Current:** No way to go back
**Proposed:**
```bash
/hustle-api-status brandfetch --rollback-to=phase:4
```

### Gap 11: No Diff View
**Scenario:** Phase 10 verification finds differences
**Current:** Text description of differences
**Proposed:** Visual diff of expected vs actual

### Gap 12: No Multi-Project Support
**Scenario:** User has 3 Next.js projects, wants same workflow
**Current:** Must reinstall tools in each
**Proposed:** `--scope=user` installs globally

### Gap 13: No Schema Validation in Tests
**Scenario:** Tests pass but request doesn't match Zod schema
**Current:** Manual validation
**Proposed:** Auto-generate schema validation tests

### Gap 14: No Rate Limit Testing
**Scenario:** API has rate limits (e.g., 10 req/min)
**Current:** Not tested
**Proposed:** Performance budget hook checks rate limit compliance

### Gap 15: No Webhook Testing Templates
**Scenario:** API supports webhooks (like Firecrawl)
**Current:** No template for webhook receivers
**Proposed:** `/hustle-api-create [api] --with-webhooks`

---

## Implementation Roadmap

### Phase 1: Critical Bugs (v3.10.2) - 1 week
**Goal:** Fix broken functionality

1. ✅ Fix registry update hook (#9a)
2. ✅ Fix registry fetch in showcase (#9b)
3. ✅ Fix example value generation (#9c)
4. ✅ Add cost/time tracking (#5)

**Reason:** Users are blocked by these bugs today.

---

### Phase 2: Research Overhaul (v3.11.0) - 2 weeks
**Goal:** Achieve 100% API feature discovery via Greptile

**Strategic Change:** Replace ToC scraping with Greptile MCP integration

1. ✅ Install Greptile MCP server
2. ✅ Create Greptile approval/tracking hooks
3. ✅ Integrate Greptile in Phase 3 (propose when Context7 insufficient)
4. ✅ Integrate Greptile in Phase 5 (adaptive proposals)
5. ✅ Integrate Greptile Genius in Phase 10 (verification)
6. ✅ Update research folder structure (#1) - per-API folders
7. ✅ Implement iterative documentation (#7) - write during research
8. ✅ Update state schema - add `repository`, `research_costs`

**Reason:** Greptile is 3.4x cheaper than ToC scraping and discovers code-level features

---

### Phase 3: UX Enhancements (v3.11.1) - 1 week
**Goal:** Better developer experience

1. ✅ Multi-endpoint selection UI (#3)
2. ✅ Auto-approve with patterns (#6)
3. ✅ Answer file support (proto-autonomous) (#4)
4. ✅ Session metrics dashboard
5. ✅ Update all command docs (api, ui, combine)

**Reason:** Quality-of-life improvements after core functionality solid.

---

### Phase 4: Advanced Features (v3.12.0) - 2 weeks
**Goal:** Power user features

1. ✅ Rollback/undo support (#Gap 10)
2. ✅ Visual diff view (#Gap 11)
3. ✅ Webhook templates (#Gap 15)
4. ✅ Rate limit testing (#Gap 14)
5. ✅ Schema validation tests (#Gap 13)

**Reason:** Nice-to-haves, not blockers.

---

## Documentation Updates Required

### Files to Update
1. `/Users/alfonso/Documents/GitHub/api-dev-tools/README.md`
   - Add map-reduce research explanation
   - Update phase descriptions
   - Add cost tracking section
   - Document auto-approve patterns

2. `/Users/alfonso/Documents/GitHub/api-dev-tools/commands/hustle-api-create.md`
   - Add --demo-mode flag
   - Add --auto-approve flag
   - Add --answers flag
   - Update phase descriptions

3. `/Users/alfonso/Documents/GitHub/api-dev-tools/commands/hustle-ui-create.md`
   - Add brand guide integration details
   - Add 4-step verification explanation
   - Update research phase for UI patterns

4. `/Users/alfonso/Documents/GitHub/api-dev-tools/commands/hustle-combine.md`
   - Add registry selection flow
   - Add orchestration patterns
   - Add error handling strategy

5. `.claude/CLAUDE.md` (in user projects)
   - Inject comprehensive workflow docs
   - Add cost tracking info
   - Add best practices

---

## Honest Assessment

### What's Working
✅ Core TDD workflow (Red-Green-Refactor)
✅ Hook enforcement system
✅ State tracking
✅ Interview-driven approach

### What's Broken
❌ Research misses features (#2 - CRITICAL)
❌ Registry updates (#9 - CRITICAL)
❌ Documentation too late (#7)
❌ No cost visibility (#5)

### What's Missing
⚠️ Multi-endpoint support (#3)
⚠️ Rollback/undo (#Gap 10)
⚠️ Visual verification (#Gap 11)
⚠️ Webhook templates (#Gap 15)

### Strategic Priority
**Fix research FIRST.** Everything else builds on accurate research.

If research discovers only 60% of features, the other 40% will:
- Never get implemented
- Require manual additions later
- Reduce trust in the workflow

**Recommendation:** Ship v3.10.2 (bug fixes) immediately, then focus 100% on v3.11.0 (research overhaul).

---

## Greptile Integration Details

### MCP Server Setup
```json
// .claude/mcp-config.json
{
  "mcpServers": {
    "greptile": {
      "command": "npx",
      "args": ["-y", "@greptile/mcp-server"],
      "env": {
        "GREPTILE_API_KEY": "${GREPTILE_API_KEY}"
      }
    }
  }
}
```

### Example Queries

**Phase 3: Overview**
- "Provide comprehensive overview of {library} API"
- "List all endpoints with HTTP methods"
- "Show authentication methods"
- "List webhooks and async features"

**Phase 5: Deep Dive**
- "Show all parameters for {endpoint}"
- "Show error codes for {endpoint}"
- "Show rate limiting behavior"

**Phase 10: Verification**
- "Compare these parameter names to actual source code" (Genius mode)

### Fallback Strategy
If Greptile unavailable:
1. Continue with Context7/WebSearch
2. Log warning in state
3. User not blocked (graceful degradation)

---

## Questions for User

1. **Greptile Integration:** Approve $0.15/query for better research? (vs planned $0.51 ToC scraping)
2. **Autonomous mode:** Do you want full autonomy or just answer files?
3. **Multi-endpoint tracking:** Prefer one-at-a-time or batch generation?
4. **Auto-approve:** Default off with opt-in, or default on with opt-out?
5. **Template output issue (#8):** Can you clarify what template you're referring to?
6. **Cost tracking:** Should this track ALL Claude Code usage or just workflow-specific?
7. **Rollback:** Should this delete generated files or just reset state?

---

## Next Steps

**Immediate (today):**
1. User review and feedback on this plan
2. Prioritize which enhancements to tackle first
3. Decide on v3.10.2 vs v3.11.0 scope

**Short-term (this week):**
1. Fix critical bugs (#5, #9)
2. Release v3.10.2
3. Begin research overhaul design

**Medium-term (next 2 weeks):**
1. Implement map-reduce research
2. Test with 5+ real APIs
3. Release v3.11.0

**Long-term (next month):**
1. UX polish
2. Advanced features
3. User feedback iteration

---

---

## Summary: TLDR Comprehensiveness Assessment

**Is TLDR.md comprehensive enough?**

**Answer:** The TLDR is excellent as an **executive summary** but **NOT comprehensive enough** for full implementation.

**What TLDR covers well:**
- ✅ High-level problems (research gaps, broken registry, no cost tracking)
- ✅ Skills vs Commands architecture decision
- ✅ Testing strategy overview (4 methods)
- ✅ Roadmap timeline (v3.10.2 → v3.12.0)
- ✅ Key metrics (current vs future state)

**What TLDR is missing for implementation:**
- ❌ Detailed phase-by-phase workflow specifications
- ❌ Hook enforcement patterns and integration points
- ❌ Specific file paths and code changes
- ❌ **Greptile integration** (major cost/accuracy improvement)
- ❌ State schema updates
- ❌ Fallback strategies

**Recommendation:** Use TLDR for high-level communication, use THIS document for implementation.

---

## Key Finding: Greptile Changes the Plan

**Original TLDR Proposal:**
- Map-reduce pattern with ToC scraping
- Cost: +$0.51/API
- Coverage: 85%

**Updated Recommendation with Greptile:**
- Greptile MCP integration
- Cost: +$0.15/API (3.4x cheaper)
- Coverage: 95%
- Bonus: Discovers undocumented features from source code

**This changes v3.11.0 implementation strategy significantly.**

---

**Document Version:** 2.0 (Updated with Greptile research)
**Last Updated:** 2025-12-16
**Author:** Claude (Sonnet 4.5)
**Status:** Ready for User Review

**Sources:**
- [Greptile Official Site](https://www.greptile.com/)
- [Greptile Pricing Documentation](https://www.greptile.com/pricing)
- [Greptile Y Combinator Profile](https://www.ycombinator.com/companies/greptile)
- [Greptile API Documentation](https://huntscreens.com/en/products/greptile)
