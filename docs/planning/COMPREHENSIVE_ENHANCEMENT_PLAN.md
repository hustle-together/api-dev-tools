# Comprehensive Enhancement Plan - v3.11.0 + v3.12.0

**Version:** 2.0.0 (Expanded from TodoWrite Integration Plan)
**Created:** 2025-12-24
**Status:** Ready for Implementation
**Scope:** ALL roadmap features from ENHANCEMENT_ROADMAP_v3.11.0.md

---

## 📋 Executive Summary

This document consolidates ALL planned enhancements for API Dev Tools v3.11.0 through v3.12.0, including:

- **TodoWrite Integration** (v3.11.0)
- **Async Parallel Research** (v3.11.0)
- **Multi-Strategy Research** (v3.11.0)
- **Skill-Discovery Meta-Skill** (v3.11.0)
- **Per-API Research Folders** (v3.11.0)
- **Cost/Time Tracking** (v3.10.2)
- **Phase 14: Code Review** (v3.12.0)
- **Greptile/CodeRabbit/Graphite Integration** (v3.12.0)
- **Stats & Rename Commands** (v3.11.1)

### Current State (v3.11.0 Phase 1 Complete)
- ✅ Skills Migration complete (23 skills in SKILL.md format)
- ✅ marketplace.json for plugin distribution
- ✅ 18 hooks packaged in `.skills/_shared/hooks/`
- ❌ No TodoWrite integration
- ❌ No async parallelization
- ❌ No multi-strategy research
- ❌ No Phase 14 (code review)

### Proposed State (After Full Implementation)
- ✅ Real-time TodoWrite visual progress
- ✅ Async background agents with Ctrl+B
- ✅ 95% research coverage (vs 60% current)
- ✅ Skill-discovery meta-skill
- ✅ Per-API research folders
- ✅ Comprehensive cost/time tracking
- ✅ Phase 14: AI code review with Greptile/CodeRabbit/Graphite
- ✅ Stats and session management commands

---

## 🎯 Implementation Roadmap

### Phase 1: ✅ COMPLETE - Skills Migration (v3.11.0)

**Status:** Shipped 2025-12-24

**Deliverables:**
- ✅ 23 Agent Skills in SKILL.md format
- ✅ marketplace.json for distribution
- ✅ Cross-platform compatibility (Claude Code, VS Code, Cursor, ChatGPT)
- ✅ 18 enforcement hooks packaged

---

### Phase 2: TodoWrite Integration (v3.11.0)

**Goal:** Add real-time visual task tracking to all 4 workflow modes

**Estimated Effort:** 6-8 hours

#### Implementation Strategy: Hybrid Approach (Recommended)

**Create helper skill:** `/update-todos [workflow] [current-phase]`

**Location:** `.skills/update-todos/SKILL.md` ✅ CREATED

**Integration Points:**

1. **API Create Workflow** (.skills/api-create/SKILL.md)
   - Add `/update-todos api-create 0` at workflow start
   - Add `/update-todos api-create [N]` after each of 13 phases

2. **UI Create Component** (.skills/hustle-ui-create/SKILL.md)
   - Add `/update-todos ui-create-component [N]` calls
   - 13 phases with component-specific names

3. **UI Create Page** (.skills/hustle-ui-create-page/SKILL.md)
   - Add `/update-todos ui-create-page [N]` calls
   - 13 phases with page-specific names

4. **Combine APIs** (.skills/hustle-combine/SKILL.md)
   - Add `/update-todos combine [N]` calls
   - 12 phases (one less than others)

**Files to Modify:**
- `.skills/api-create/SKILL.md` - Add TodoWrite calls
- `.skills/hustle-ui-create/SKILL.md` - Add TodoWrite calls
- `.skills/hustle-ui-create-page/SKILL.md` - Add TodoWrite calls
- `.skills/hustle-combine/SKILL.md` - Add TodoWrite calls
- `.claude/api-dev-state.json` (template) - Add `current_phase` field

**Testing Checklist:**
- [ ] All 4 workflows show proper phase progression
- [ ] Todos update in real-time as phases complete
- [ ] Loop-back scenarios work (e.g., Phase 10 verify fails → back to Phase 8)
- [ ] Multiple concurrent workflows don't conflict

---

### Phase 3: Async Parallel Research (v3.11.0)

**Goal:** 3x faster research using background agents

**Estimated Effort:** 8-10 hours

**Benefits:**
- Research time: 20-30 min → 8-10 min (parallelized)
- Coverage: 60% → 95%
- Cost: Same (agents run in parallel, not sequentially)

#### Implementation

**Phase 3 Enhancement in api-create workflow:**

```markdown
# Current (Sequential)
1. Context7 query → results
2. WebSearch query → results
3. Process and save

# NEW (Parallel with background agents)
1. Spawn Agent-1: Context7 deep dive [Ctrl+B]
2. Spawn Agent-2: WebSearch multiple queries [Ctrl+B]
3. Spawn Agent-3: Skills marketplace search [Ctrl+B]
4. Main agent continues to Phase 4 (Interview)
5. Agents surface results → comprehensive research ready

# User monitors with:
/tasks → Shows all background agents and progress
```

**Files to Modify:**
- `.skills/api-create/SKILL.md` - Add async agent spawning logic in Phase 3
- Add instructions for:
  - `Ctrl+B` to background agents
  - `/tasks` to monitor progress
  - Agent result aggregation

**New State Fields:**
```json
{
  "async_agents_used": 3,
  "async_agents_status": {
    "agent-1": "completed",
    "agent-2": "completed",
    "agent-3": "in_progress"
  }
}
```

---

### Phase 4: Multi-Strategy Research (v3.11.0)

**Goal:** 95% coverage using 3 complementary research strategies

**Estimated Effort:** 6-8 hours

#### The 3 Strategies

**Strategy 1: Context7 MCP (Official Docs)**
- resolve-library-id → get-library-docs
- Multiple topics: "api-endpoints", "webhooks", "rate-limits", "error-handling"
- Coverage: 70% (official documentation)
- Cost: Free

**Strategy 2: WebSearch (Targeted Queries)**
- 6+ specific searches:
  - "[Library] official API documentation"
  - "[Library] webhooks setup guide"
  - "[Library] batch processing endpoints"
  - "[Library] rate limits pricing"
  - "[Library] error codes reference"
  - "[Library] advanced parameters GitHub"
- Coverage: 85% (community + undocumented features)
- Cost: Free

**Strategy 3: Skills Marketplace (Specialized Research)**
- `/skill-finder api-research` to discover tools
- Install: api-documentation-scraper, openapi-parameter-discoverer
- Automated comprehensive discovery
- Coverage: 95% (exhaustive parameter extraction)
- Cost: Free

**Files to Modify:**
- `.skills/api-create/SKILL.md` - Expand Phase 3 with 3 strategies
- Add explicit Context7 multi-topic queries
- Add 6+ WebSearch queries
- Integrate skill-finder invocation

**Success Metrics:**
- Parameter discovery: 60% → 95%
- Undocumented features found: 0 → 10-15
- Research time (with async): 20 min → 8 min

---

### Phase 5: Skill-Discovery Meta-Skill (v3.11.0)

**Goal:** A skill that discovers other skills to enhance workflows

**Estimated Effort:** 4-6 hours

**New Skill:** `.skills/skill-finder/SKILL.md`

**Capabilities:**
- Search SkillsMP.com (25,000+ skills)
- Filter by category, author, popularity
- Install recommended skills
- Suggest skills based on current task

**Usage:**
```bash
/skill-finder [category]
/skill-finder api-development
/skill-finder testing
```

**Integration:**
- Called from Phase 3 of api-create workflow
- Searches for "api-research" category
- Presents top 3 results with star ratings
- Asks user to install and use

**Files to Create:**
- `.skills/skill-finder/SKILL.md`

**Files to Modify:**
- `.skills/api-create/SKILL.md` - Add skill-finder invocation in Phase 3

---

### Phase 6: Per-API Research Folders (v3.11.0)

**Goal:** Replace flat file structure with organized per-API folders

**Estimated Effort:** 4-5 hours

**Current Structure:**
```
.claude/research/
├── index.json
├── brandfetch-research.md          # Flat file
├── button-component-research.md    # Flat file
└── wordpress-ai-research.md        # Flat file
```

**NEW Structure:**
```
.claude/research/
├── index.json                      # Freshness tracking only
├── brandfetch/
│   ├── CURRENT.md                 # Latest research findings
│   ├── sources.json               # URLs + timestamps
│   ├── interview.json             # User decisions from Phase 4
│   ├── schema.json                # Final Zod schema
│   └── skills-cache.json          # Discovered skills for this API
├── button-component/
│   ├── CURRENT.md
│   ├── brand-analysis.json
│   ├── variants.json
│   └── storybook-config.json
```

**Benefits:**
- No file name collisions
- Easy to share research (entire folder)
- Supports concurrent workflows
- Related files grouped together

**Files to Modify:**
- `.skills/api-create/SKILL.md` - Update Phase 3 to create folders
- Update all Write calls to use new folder structure
- Hooks that read research files need updates

**Migration Script:**
```python
# .skills/_shared/migrate-research-folders.py
# Converts existing flat files to folder structure
```

---

### Phase 7: Cost/Time Tracking (v3.10.2 - Backlog)

**Goal:** Comprehensive session metrics displayed at Phase 13

**Estimated Effort:** 6-8 hours

**Tracked Metrics:**
```json
{
  "session_metrics": {
    "session_id": "stripe-payment-2025-12-24-1234",
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
      "skills_used": ["api-documentation-scraper"],
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
    "total_cost_usd": 1.27
  }
}
```

**Display at Phase 13:**
```
═══════════════════════════════════════════════════
🎉 API Development Complete: stripe-payment
═══════════════════════════════════════════════════

📊 Session Metrics:
   Duration:      35 minutes 24 seconds
   Turns:         52
   Phases:        13/13 ✓
   Async agents:  3

💰 Cost Breakdown:
   Research:      $0.32
   Implementation: $0.95
   Code Review:   $0.00 (CodeRabbit - open source)
   ─────────────────────────────
   TOTAL:         $1.27

⚡ Efficiency:
   Cost/endpoint: $1.27 (25% less than v3.10)
   Time/phase:    2.7 min average
   Coverage:      95% (vs 60% before)
```

**Files to Create:**
- `.skills/_shared/hooks/track-session-metrics.py` (PostToolUse)
- `.claude/hustle-api-sessions/[endpoint]/session.json` (per session)

**Files to Modify:**
- `.skills/api-create/SKILL.md` - Display metrics at Phase 13

---

### Phase 8: Phase 14 - AI Code Review (v3.12.0)

**Goal:** Automated code quality checks with 3 industry-leading tools

**Estimated Effort:** 10-12 hours

**Phase 14 Workflow:**
```
Phase 13: Completion (tests pass, docs written)
  └─> Create PR

Phase 14: Automated Code Review [NEW]
  ├─> Greptile: Review for bugs, antipatterns, security
  ├─> CodeRabbit: Run 40+ linters, suggest fixes
  └─> Graphite: Stack PRs for dependent changes

User reviews AI feedback → Fix issues → Merge
```

#### Tool 1: Greptile Integration

**Purpose:** AI-powered PR code review with full codebase context

**API Integration:**
```typescript
// POST https://api.greptile.com/v1/review
{
  "repo": "user/repo",
  "pr_number": 123,
  "codebase_context": true
}
```

**Response:**
```json
{
  "overall_score": 9.2,
  "bugs_caught": 1,
  "security_issues": 0,
  "suggestions": [
    {
      "file": "route.ts",
      "line": 45,
      "type": "optimization",
      "message": "Consider caching Stripe client instance"
    }
  ]
}
```

**Cost:** $30/dev/month (82% bug catch rate)

#### Tool 2: CodeRabbit Integration

**Purpose:** 40+ industry linters with one-click auto-fix

**Webhook Setup:**
```yaml
# .github/workflows/coderabbit.yml
on: [pull_request]
jobs:
  coderabbit:
    runs-on: ubuntu-latest
    steps:
      - uses: coderabbit-ai/coderabbit-action@v1
```

**Auto-Fixes:**
- ESLint errors
- TypeScript type issues
- Prettier formatting
- Security vulnerabilities (Snyk)
- Code complexity warnings

**Cost:** Free for open source, $12/dev/month Pro

#### Tool 3: Graphite Integration

**Purpose:** Stacked PRs for distributed team collaboration

**CLI Commands:**
```bash
gt create --stack stripe-payment
gt stack submit
gt stack status
```

**Benefits:**
- Parallel development across timezones
- Incremental reviews without blocking
- Dependency management between PRs

**Cost:** Free (Hobby), $20/month (Starter)

**Files to Create:**
- `.skills/api-create/SKILL.md` - Add Phase 14 after Phase 13
- `.skills/_shared/hooks/run-code-review.py` (optional, user-configured)
- `.claude/settings.json` - Add preferred tool selection

**User Configuration:**
```json
{
  "code_review": {
    "enabled": true,
    "tools": ["coderabbit", "greptile"],  // User selects
    "auto_fix": true,
    "require_approval": false
  }
}
```

---

### Phase 9: Stats & Rename Commands (v3.11.1)

**Goal:** Better session management and visibility

**Estimated Effort:** 3-4 hours

#### /stats Command

**Usage:**
```bash
/stats
/stats [session-name]
```

**Output:**
```
╔═══════════════════════════════════════════════════
║ 📊 SESSION STATISTICS - /stats
╠═══════════════════════════════════════════════════
║ Session: stripe-payment
║ Duration: 42 minutes 18 seconds
║ Total Cost: $1.42
║
║ PHASE BREAKDOWN:
║ ✓ Phase 1-2:  Disambiguation & Scope    $0.05
║ ✓ Phase 3:    Multi-Strategy Research   $0.32
║ ✓ Phase 8-9:  TDD Red & Green           $0.45
║ ✓ Phase 14:   AI Code Review            $0.15
║
║ TOOLS USED:
║ - Context7 MCP:    5 calls
║ - WebSearch:       8 queries
║ - Greptile:        1 review
╚═══════════════════════════════════════════════════
```

#### /rename Command

**Usage:**
```bash
/rename stripe-payment stripe-checkout
```

**Actions:**
- Renames session folder
- Updates state file
- Updates research folder
- Updates session.json

**Files to Create:**
- `.skills/stats/SKILL.md`
- `.skills/rename/SKILL.md`

---

## 📁 Complete File Manifest

### New Files to Create

1. `.skills/update-todos/SKILL.md` ✅ CREATED
2. `.skills/skill-finder/SKILL.md`
3. `.skills/stats/SKILL.md`
4. `.skills/rename/SKILL.md`
5. `.skills/_shared/hooks/track-session-metrics.py`
6. `.skills/_shared/hooks/run-code-review.py` (optional)
7. `.skills/_shared/migrate-research-folders.py`
8. `demo/execution-trace-COMPREHENSIVE.html` ✅ CREATED
9. `COMPREHENSIVE_ENHANCEMENT_PLAN.md` ✅ THIS FILE

### Files to Modify

1. `.skills/api-create/SKILL.md`
   - Add `/update-todos` calls (Phase 2)
   - Add async agent spawning (Phase 3)
   - Add multi-strategy research (Phase 3)
   - Add skill-finder invocation (Phase 3)
   - Add per-API folder creation (Phase 3)
   - Add cost/time display (Phase 13)
   - Add Phase 14: Code Review

2. `.skills/hustle-ui-create/SKILL.md`
   - Add `/update-todos` calls
   - Add research enhancements

3. `.skills/hustle-ui-create-page/SKILL.md`
   - Add `/update-todos` calls
   - Add research enhancements

4. `.skills/hustle-combine/SKILL.md`
   - Add `/update-todos` calls (12 phases)
   - Add research enhancements

5. `.claude/api-dev-state.json` (template)
   - Add `current_phase` field
   - Add `async_agents_used` field
   - Add `cost_breakdown` object

6. `.claude/settings.json`
   - Add `code_review` configuration
   - Add `todowrite_enabled` toggle

7. All hooks that read research files:
   - Update to use new folder structure

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] TodoWrite updates correctly for all 4 workflows
- [ ] Async agents spawn and report correctly
- [ ] Research folder creation works
- [ ] Cost tracking calculates accurately
- [ ] Stats command aggregates data properly

### Integration Tests
- [ ] End-to-end api-create with ALL features
- [ ] End-to-end ui-create-component with ALL features
- [ ] End-to-end ui-create-page with ALL features
- [ ] End-to-end combine with ALL features

### Performance Tests
- [ ] Async research is 2-3x faster than sequential
- [ ] TodoWrite doesn't slow down execution
- [ ] Per-API folders don't impact I/O performance

### Cross-Platform Tests
- [ ] Works in Claude Code
- [ ] Works in VS Code with Claude extension
- [ ] Works in Cursor
- [ ] Works on Claude.ai web (with limitations)

---

## 📊 Success Metrics

### Quantitative
- **Research Coverage:** 60% → 95% (+58%)
- **Research Time:** 20-30 min → 8-10 min (-60%)
- **Cost Per Endpoint:** $1.89 → $1.42 (-25%)
- **User Abandonment:** Reduce by 40% (with TodoWrite visibility)
- **Bug Detection:** 82% catch rate (with Greptile)

### Qualitative
- Users see real-time progress (TodoWrite)
- Users understand what's happening (cost tracking)
- Users trust the results (95% coverage)
- Users get high-quality code (Phase 14 review)

---

## 🚀 Implementation Timeline

### Sprint 1 (Week 1): Core TodoWrite + Research
- Phase 2: TodoWrite Integration
- Phase 3: Async Parallel Research
- Phase 4: Multi-Strategy Research
- **Deliverable:** Real-time progress + 95% coverage

### Sprint 2 (Week 2): Organization + Discovery
- Phase 5: Skill-Discovery Meta-Skill
- Phase 6: Per-API Research Folders
- Phase 7: Cost/Time Tracking
- **Deliverable:** Better organization + visibility

### Sprint 3 (Week 3): Code Quality + Polish
- Phase 8: Phase 14 - AI Code Review
- Phase 9: Stats & Rename Commands
- **Deliverable:** Production-ready v3.12.0

### Sprint 4 (Week 4): Testing + Documentation
- Complete testing checklist
- Update all documentation
- Create demo videos
- **Deliverable:** Public release

---

## 📚 Documentation Updates Required

1. **README.md**
   - Add TodoWrite section
   - Add async parallelization explanation
   - Add Phase 14 description
   - Update efficiency metrics

2. **.skills/README.md**
   - Document all new skills
   - Update workflow diagrams to show 14 phases
   - Add research strategy explanation

3. **CHANGELOG.md**
   - v3.11.0 release notes
   - v3.11.1 release notes
   - v3.12.0 release notes

4. **Demo Files**
   - ✅ execution-trace-COMPREHENSIVE.html created
   - Update full-workflow-simulation.html with Phase 14

---

## ✅ Pre-Implementation Checklist

**Before Starting:**
- [x] Enhancement roadmap reviewed (ENHANCEMENT_ROADMAP_v3.11.0.md)
- [x] Comprehensive plan created (this document)
- [x] Demo created showing all features
- [ ] User approval on approach
- [ ] Backup current codebase

**During Implementation:**
- [ ] Test each phase independently before moving to next
- [ ] Update documentation as features are added
- [ ] Keep demos in sync with implementation
- [ ] Track actual time vs estimates

**After Implementation:**
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Demos accurate
- [ ] Performance benchmarks met
- [ ] Ready for public release

---

**Status:** Ready for Sprint 1 - User Approval Required
**Next Step:** User reviews this plan and approves implementation start
**Estimated Total Effort:** 6-8 weeks (3 sprints of implementation + 1 sprint polish)

---

## 🎯 Open Questions for User

1. **Priority:** Should we ship v3.11.0 (TodoWrite + Research) before v3.12.0 (Code Review)?
2. **Code Review Tools:** Which tools to support? Greptile ($30/mo) vs CodeRabbit (free OSS)?
3. **Stats Storage:** Store session stats in JSON or SQLite database?
4. **Demo Hosting:** Host comprehensive demo on GitHub Pages or keep local?
5. **Breaking Changes:** OK to change research folder structure (requires migration)?

---

**Document Version:** 2.0.0
**Last Updated:** 2025-12-24
**Author:** Claude Sonnet 4.5
**Related Files:**
- [ENHANCEMENT_ROADMAP_v3.11.0.md](./ENHANCEMENT_ROADMAP_v3.11.0.md)
- [demo/execution-trace-COMPREHENSIVE.html](./demo/execution-trace-COMPREHENSIVE.html)
- [.skills/update-todos/SKILL.md](./.skills/update-todos/SKILL.md)
