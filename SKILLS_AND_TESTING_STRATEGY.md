# Skills & Testing Strategy for API Dev Tools

**Date:** 2025-12-13
**Context:** Research findings on Claude Code Skills and testing strategies for v3.11.0+

---

## Executive Summary

This document explores how **Claude Code Skills** (launched October 2025) affect our api-dev-tools architecture and provides comprehensive testing strategies to validate workflows without incurring high costs.

**Key Findings:**
- Skills are **model-invoked** (Claude decides when to use) vs our **user-invoked** commands
- Current architecture should evolve to hybrid: Commands + Skills
- Multiple low-cost testing strategies exist (hook unit tests, demo snapshots, QA systems)
- Skills could eventually replace some enforcement hooks

---

## Part 1: Claude Code Skills Overview

### What Are Agent Skills?

Agent Skills are **model-invoked** modular capabilities that extend Claude's functionality in Claude Code. Unlike slash commands (user-invoked), Skills are autonomously triggered by Claude based on request context and the Skill's description.

**Key Characteristics:**
- Discoverable capabilities packaged in organized folders
- Consist of a `SKILL.md` file with instructions plus optional supporting files
- Claude decides when to use them based on your request and the Skill's description
- Enable composition of multiple Skills for complex tasks

### Model-Invoked vs User-Invoked

| Feature | Type | Invocation | Use Case |
|---------|------|-----------|----------|
| **Skills** | Model-invoked | Claude decides autonomously | Capability extensions |
| **Slash commands** | User-invoked | Explicit `/command` | Direct user actions |
| **Hooks** | Programmatic | Triggered by SDK/plugins | Custom workflows |
| **Plugins** | Distribution mechanism | Installed by users | Bundled capabilities and Skills |

---

## Part 2: How Skills Affect Our Roadmap

### Current Architecture (v3.10.x)

**Commands (User-Invoked):**
```bash
/hustle-api-create brandfetch
/hustle-ui-create Button
/hustle-combine api
```

**Hooks (Event-Triggered Enforcement):**
```python
enforce-research.py     # Blocks Write before research
enforce-interview.py    # Blocks Write before interview
verify-after-green.py   # Triggers after tests pass
```

### Future Architecture Proposal

#### Immediate (v3.10.2) - NO CHANGE
**Reason:** Skills are brand new (Oct 2025), not battle-tested yet. Keep commands for stability.

#### Medium-term (v3.11.0) - HYBRID APPROACH

Offer both Commands and Skills:

**1. Commands (Explicit):**
```bash
/hustle-api-create brandfetch
```

**2. Skills (Autonomous):**
```bash
User: "I need to integrate the Brandfetch API"
Claude: (Detects API integration → uses api-development Skill → runs 13 phases)
```

**Directory Structure:**
```
.claude/skills/api-development/
├── SKILL.md              # Main skill definition
├── REFERENCE.md          # Full 13-phase docs
└── templates/
    ├── route.template.ts
    └── schema.template.ts
```

**SKILL.md Example:**
```yaml
---
name: api-development
description: Research-driven API integration with 13-phase TDD workflow. Use when integrating external APIs, building REST endpoints, or creating API routes. Triggers on "integrate API", "build endpoint", "add API support".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebSearch, mcp__context7__*
---

# API Development Skill

When user mentions API integration, automatically run /hustle-api-create workflow.

## Auto-detection triggers
- "integrate the [X] API"
- "build an endpoint for [X]"
- "add [X] API support"
- "create API route for [X]"

## Workflow
Execute the 13-phase interview-driven workflow via `/hustle-api-create [detected-api-name]`

For detailed phase breakdown, see [REFERENCE.md](REFERENCE.md).
```

**Benefit:** More natural UX - users don't need to memorize command syntax.

#### Long-term (v3.12.0) - SKILLS-FIRST ARCHITECTURE

Replace hooks with Skills where appropriate:

| Current Hook | Future Skill | Benefit |
|--------------|--------------|---------|
| `enforce-research.py` | `research-validator` Skill | Claude understands WHY research is needed |
| `enforce-interview.py` | `interview-conductor` Skill | More intelligent question generation |
| `verify-after-green.py` | `implementation-verifier` Skill | Better diff analysis |

**Why Skills > Hooks:**
- **Context-aware:** Skills see the full conversation
- **Flexible:** Can use multiple tools, not just block/allow
- **Composable:** Skills can invoke other skills
- **Debuggable:** Easier to trace than Python hooks

---

## Part 3: Testing Strategies (Without High Costs)

### The Problem

Running full workflow tests incurs significant costs:
- Full `/hustle-api-create` run: ~$1.70
- 10 test runs: ~$17.00
- CI/CD with 50 runs/week: ~$850/week

**Solution:** Multiple low-cost testing approaches

---

### Option 1: Claude QA System (MCP Server) ⭐ Recommended

**What:** Self-hosted automated testing system for Claude Code workflows

**Setup:**
```bash
npm install -g @dylanredfield/claude-qa-system
```

**How it works:**

1. Define test cases in YAML:
```yaml
# tests/api-workflows.yaml
tests:
  - name: "API Create - Brandfetch"
    command: "/hustle-api-create brandfetch --demo-mode"
    expected_phases:
      - disambiguation
      - scope_confirmation
      - research_initial
      - interview
      - deep_research
      - schema
      - environment
      - tdd_red
      - tdd_green
      - verify
      - refactor
      - documentation
      - completion
    expected_files:
      - "src/app/api/v2/brandfetch/route.ts"
      - "src/app/api/v2/brandfetch/__tests__/brandfetch.test.ts"
      - "src/app/api/v2/brandfetch/schema.ts"
    expected_registry_entry:
      name: "brandfetch"
      status: "complete"
      phases_completed: 13
    cost_thresholds:
      max_cost_usd: 2.00
      max_duration_minutes: 50
```

2. Run tests:
```bash
claude-qa-system run tests/api-workflows.yaml
```

3. View results:
```
═══════════════════════════════════════════════
Test: API Create - Brandfetch
═══════════════════════════════════════════════
✓ Phase 1:  Disambiguation complete
✓ Phase 2:  Scope confirmed
✓ Phase 3:  Research completed (3 sources)
✗ Phase 4:  Interview failed - missing schema param
✓ Phase 5:  Deep research complete
...

Summary:
  Passed:  11/13 phases
  Failed:  2/13 phases
  Cost:    $1.62
  Duration: 42 minutes

Issues:
  - Phase 4: Expected 'format' parameter in interview
  - Phase 6: Schema missing 'size' parameter
```

**Cost:** ~$0.10 per test run (with optimizations) vs $1.70 for manual

**Source:** [Claude QA System MCP](https://lobehub.com/mcp/dylanredfield-claude-qa-system)

---

### Option 2: Snapshot Testing (Demo Mode)

**Strategy:** Run workflow once with `--demo-mode`, save transcript, compare future runs

**Implementation:**

```bash
# 1. Generate baseline (one-time cost)
/hustle-api-create brandfetch --demo-mode --output=tests/snapshots/brandfetch-baseline.json

# 2. Future tests compare against baseline (FREE)
diff <(jq -S . tests/snapshots/brandfetch-baseline.json) \
     <(jq -S . .claude/demo-sessions/brandfetch-latest.json)
```

**What to compare:**
```json
{
  "phases_completed": 13,
  "files_created": [
    "src/app/api/v2/brandfetch/route.ts",
    "src/app/api/v2/brandfetch/__tests__/brandfetch.test.ts"
  ],
  "registry_updated": true,
  "cost_usd": 1.70,
  "duration_minutes": 45
}
```

**Validation script:**
```javascript
// scripts/validate-snapshot.js
const baseline = require('./tests/snapshots/brandfetch-baseline.json');
const latest = require('./.claude/demo-sessions/brandfetch-latest.json');

function validate() {
  // Check phases
  if (latest.phases_completed !== 13) {
    throw new Error(`Expected 13 phases, got ${latest.phases_completed}`);
  }

  // Check files
  const expectedFiles = baseline.files_created;
  const actualFiles = latest.files_created;

  for (const file of expectedFiles) {
    if (!actualFiles.includes(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  }

  // Check cost threshold
  if (latest.cost_usd > baseline.cost_usd * 1.2) {
    console.warn(`Cost increased: $${latest.cost_usd} (baseline: $${baseline.cost_usd})`);
  }

  console.log('✓ Snapshot validation passed');
}

validate();
```

**Cost:**
- Baseline generation: $1.70 (one-time)
- Snapshot comparisons: $0 (file diffs)

---

### Option 3: Hook Unit Testing

**Strategy:** Test hooks in isolation without full workflow

**Example:**

```python
# tests/test_enforce_research.py
import sys
import json
import pytest
from pathlib import Path

# Add hooks to path
sys.path.insert(0, str(Path(__file__).parent.parent / '.claude' / 'hooks'))

from enforce_research import should_block, get_block_message

def test_blocks_write_without_research():
    """Should block Write when research not complete"""
    state = {
        "phases": {
            "research_initial": {"status": "pending"}
        }
    }
    tool = "Write"

    result = should_block(state, tool)
    assert result is True

    message = get_block_message(state, tool)
    assert "Research required" in message
    assert "Context7" in message or "WebSearch" in message

def test_allows_write_after_research():
    """Should allow Write after research complete"""
    state = {
        "phases": {
            "research_initial": {
                "status": "complete",
                "sources": ["Context7", "WebSearch"]
            }
        }
    }
    tool = "Write"

    result = should_block(state, tool)
    assert result is False

def test_allows_read_before_research():
    """Should always allow Read tool"""
    state = {
        "phases": {
            "research_initial": {"status": "pending"}
        }
    }
    tool = "Read"

    result = should_block(state, tool)
    assert result is False

def test_blocks_edit_without_interview():
    """Should block Edit when interview not complete"""
    state = {
        "phases": {
            "research_initial": {"status": "complete"},
            "interview": {"status": "pending"}
        }
    }
    tool = "Edit"

    result = should_block(state, tool)
    assert result is True
```

**Run tests:**
```bash
# Install pytest
pip install pytest pytest-cov

# Run hook tests
pytest tests/test_hooks/ -v --cov=.claude/hooks/

# Output:
# tests/test_enforce_research.py::test_blocks_write_without_research PASSED
# tests/test_enforce_research.py::test_allows_write_after_research PASSED
# tests/test_enforce_research.py::test_allows_read_before_research PASSED
# tests/test_enforce_research.py::test_blocks_edit_without_interview PASSED
#
# Coverage: 87% of hooks/enforce_research.py
```

**Cost:** $0 (no Claude Code involved)

---

### Option 4: GitHub Actions CI/CD

**Strategy:** Automated workflow testing on every commit

**Workflow file:**

```yaml
# .github/workflows/test-api-workflows.yml
name: Test API Development Workflows

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test-hooks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install pytest pytest-cov

      - name: Run hook unit tests
        run: |
          pytest tests/test_hooks/ -v --cov=.claude/hooks/ --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml

  test-workflows:
    runs-on: ubuntu-latest
    needs: test-hooks
    steps:
      - uses: actions/checkout@v3

      - name: Install Claude Code
        run: |
          npm install -g @anthropic/claude-code-cli

      - name: Run workflow tests (with demo mode)
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Use demo mode with answer files
          claude --workflow api-create \
                 --answers tests/fixtures/brandfetch-answers.json \
                 --verify tests/expected/brandfetch-output.json

      - name: Validate results
        run: |
          node scripts/validate-snapshot.js

  cost-analysis:
    runs-on: ubuntu-latest
    needs: test-workflows
    steps:
      - uses: actions/checkout@v3

      - name: Analyze test costs
        run: |
          # Parse cost from session logs
          COST=$(jq '.cost_breakdown.total_cost_usd' .claude/api-dev-state.json)
          echo "Test run cost: \$$COST"

          # Fail if cost exceeds threshold
          if (( $(echo "$COST > 2.00" | bc -l) )); then
            echo "::error::Cost exceeded threshold: \$$COST > \$2.00"
            exit 1
          fi
```

**Cost:**
- GitHub Actions: Free (2,000 minutes/month)
- Claude API calls: ~$0.50/run in demo mode

**Source:** [Claude Code + GitHub Actions Guide](https://smartscope.blog/en/ai-development/github-actions-automated-testing-claude-code-2025/)

---

## Part 4: Recommended Testing Strategy

### Phase 1: Low-Cost Validation (Implement NOW)

```bash
# 1. Hook unit tests (FREE)
pytest tests/hooks/ --cov=.claude/hooks/

# 2. State validation (FREE)
node scripts/validate-state-schema.js

# 3. Demo snapshot comparison ($1.70 one-time)
/hustle-api-create test-api --demo-mode
diff tests/snapshots/baseline.json .claude/demo-sessions/test-api.json
```

**Files to create:**
- `tests/test_hooks/test_enforce_research.py`
- `tests/test_hooks/test_enforce_interview.py`
- `tests/test_hooks/test_verify_after_green.py`
- `scripts/validate-state-schema.js`
- `scripts/validate-snapshot.js`

### Phase 2: Automated Testing (v3.10.2)

```bash
# Install QA system
npm install -g @dylanredfield/claude-qa-system

# Create test suite
cat > tests/workflow-suite.yaml << 'EOF'
tests:
  - name: "API Create - Complete Flow"
    command: "/hustle-api-create test-api --demo-mode"
    expected_phases: 13

  - name: "Registry Updates"
    command: "/hustle-api-status test-api"
    expected_output:
      registry_entry: true

  - name: "Cost Tracking"
    command: "cat .claude/api-dev-state.json"
    expected_fields:
      - "session_metrics"
      - "cost_breakdown"
EOF

# Run test suite
claude-qa-system run tests/workflow-suite.yaml
```

**Test cases to create:**
1. ✅ All 13 phases complete
2. ✅ Registry updates correctly
3. ✅ Cost tracking records data
4. ✅ Research cache creates folders
5. ✅ Examples have valid values
6. ✅ Files created match schema
7. ✅ Tests pass after implementation
8. ✅ Verification loop works

### Phase 3: CI/CD Integration (v3.11.0)

```bash
# GitHub Actions runs on every PR
- Test with 5 sample APIs (Brandfetch, Firecrawl, Stripe, Twilio, SendGrid)
- Verify all hooks fire correctly
- Check documentation generates
- Measure cost/time metrics
- Compare against baselines
```

**Estimated costs:**
- Per PR: ~$2.50 (5 APIs × $0.50 demo mode)
- Per day (10 PRs): ~$25
- Per month: ~$750 (vs $850 with full runs)

**Savings:** 12% cost reduction with better coverage

---

## Part 5: Updated Roadmap with Skills + Testing

### v3.10.2 (This Week)

**Focus:** Fix bugs + Add testing infrastructure

**Tasks:**
1. Fix registry update hook
2. Fix example value generation
3. Add cost/time tracking
4. **NEW:** Create hook unit tests
5. **NEW:** Add demo mode flag
6. **NEW:** Create snapshot validation scripts
7. **NEW:** Document testing strategy

**Testing additions:**
- Hook unit tests with pytest (FREE)
- Demo snapshot baselines ($1.70 one-time)
- State validation scripts (FREE)

**Deliverables:**
- `tests/test_hooks/` directory with full coverage
- `scripts/validate-snapshot.js`
- GitHub Actions workflow file
- Updated README with testing docs

---

### v3.11.0 (Next 2 Weeks)

**Focus:** Research overhaul + Skills introduction

**Tasks:**
1. Implement map-reduce research pattern
2. Add ToC scraping (Firecrawl integration)
3. Add feature matrix generation
4. Update research folder structure
5. Implement iterative documentation
6. **NEW:** Create Skills (hybrid approach)
7. **NEW:** Integrate QA system
8. **NEW:** Set up CI/CD workflow tests

**New architecture additions:**
- `.claude/skills/api-development/SKILL.md`
- `.claude/skills/ui-development/SKILL.md`
- `.claude/skills/combine-development/SKILL.md`
- `tests/workflow-suite.yaml` (QA system config)
- `.github/workflows/test-api-workflows.yml`

**Testing enhancements:**
- QA system integration ($0.10/run)
- CI/CD automation (free)
- Comprehensive test suite

---

### v3.11.1 (Following Week)

**Focus:** UX enhancements

**Tasks:**
1. Multi-endpoint selection UI
2. Auto-approve with patterns
3. Answer file support (proto-autonomous)
4. Session metrics dashboard
5. Update all command docs (api, ui, combine)

**Testing:**
- Test multi-endpoint flows
- Validate answer file processing
- Verify auto-approve patterns

---

### v3.12.0 (2 Weeks Later)

**Focus:** Skills-first architecture + Advanced features

**Tasks:**
1. Replace hooks with Skills where beneficial
2. Rollback/undo support
3. Visual diff view
4. Webhook templates
5. Rate limit testing
6. Schema validation tests

**Architecture shift:**
- `enforce-research.py` → `research-validator` Skill
- `enforce-interview.py` → `interview-conductor` Skill
- `verify-after-green.py` → `implementation-verifier` Skill

**Testing:**
- Full automated test suite
- Performance benchmarks
- Cost optimization analysis

---

## Part 6: Comparison Matrix

### Testing Approaches

| Method | Cost/Run | Setup Time | Coverage | CI/CD Ready | Recommended For |
|--------|----------|------------|----------|-------------|-----------------|
| Hook unit tests | $0 | 2 hours | Hooks only | ✅ Yes | Development |
| Demo snapshots | $0 (after $1.70 baseline) | 1 hour | Full workflow | ✅ Yes | Regression |
| QA System | $0.10 | 4 hours | End-to-end | ✅ Yes | CI/CD |
| GitHub Actions | Free (+ API) | 6 hours | Integration | ✅ Yes | Pull requests |
| Manual testing | $1.70 | 0 | Full workflow | ❌ No | Debugging |

### Skills vs Commands

| Aspect | Commands | Skills | Hybrid |
|--------|----------|--------|--------|
| **User invocation** | Explicit `/command` | Natural language | Both |
| **Learning curve** | Must memorize syntax | Intuitive | Easy onboarding |
| **Reliability** | 100% predictable | ~90% (model decides) | Best of both |
| **Flexibility** | Fixed workflow | Adaptive | Adaptive + fallback |
| **Implementation** | Already done | Need to create | Medium effort |
| **Recommended** | Legacy support | New features | **Yes** |

---

## Part 7: Implementation Checklist

### Immediate Actions (This Week)

- [ ] Create `tests/test_hooks/` directory
- [ ] Write hook unit tests (enforce-research, enforce-interview, verify-after-green)
- [ ] Create `scripts/validate-snapshot.js`
- [ ] Generate baseline snapshots for 3 sample APIs
- [ ] Set up GitHub Actions workflow
- [ ] Document testing strategy in README
- [ ] Fix registry bugs
- [ ] Add cost/time tracking

### Short-term (v3.11.0)

- [ ] Create `.claude/skills/api-development/` with SKILL.md
- [ ] Create `.claude/skills/ui-development/` with SKILL.md
- [ ] Create `.claude/skills/combine-development/` with SKILL.md
- [ ] Install and configure QA system
- [ ] Create comprehensive test suite YAML
- [ ] Implement map-reduce research
- [ ] Test Skills with real workflows

### Medium-term (v3.12.0)

- [ ] Replace hooks with Skills (where better)
- [ ] Optimize Skills for performance
- [ ] Create Skills marketplace entry
- [ ] Full automated testing coverage
- [ ] Performance benchmarking

---

## Part 8: Questions & Answers

### Q: Should we abandon commands entirely?

**A:** No. Keep commands as fallback. Skills are new (Oct 2025) and need time to stabilize. Hybrid approach gives users choice.

### Q: Will Skills replace all hooks?

**A:** No. Some hooks are better:
- **Keep hooks for:** Hard enforcement (blocking operations)
- **Use Skills for:** Intelligent assistance (validation, verification)

### Q: How much will testing cost?

**A:** With proposed strategy:
- Development: $0 (hook tests)
- One-time baselines: ~$10 (5-6 APIs)
- CI/CD per month: ~$750 (vs $850 manual)
- **Total savings:** ~$100/month + better coverage

### Q: When should we start?

**A:** Now. Testing infrastructure should be v3.10.2 priority before adding more features.

---

## Resources & Sources

### Official Documentation
- [Agent Skills - Claude Code Docs](https://docs.claude.com/en/docs/claude-code/skills)
- [Agent Skills - Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Skills Resources
- [Official Skills GitHub Repository](https://github.com/anthropics/skills)
- [Awesome Claude Skills Collection](https://github.com/travisvn/awesome-claude-skills)
- [Claude Skills Tutorial](https://www.siddharthbharath.com/claude-skills/)
- [How to Create Claude Skill Guide](https://skywork.ai/blog/ai-agent/how-to-create-claude-skill-step-by-step-guide/)

### Testing Resources
- [Claude QA System MCP](https://lobehub.com/mcp/dylanredfield-claude-qa-system)
- [Claude Code Testing Automation Playbook](https://skywork.ai/blog/agent/claude-code-2025-testing-automation-playbook/)
- [GitHub Actions + Claude Code Guide](https://smartscope.blog/en/ai-development/github-actions-automated-testing-claude-code-2025/)
- [Playwright + Claude Code Testing](https://shipyard.build/blog/playwright-agents-claude-code/)

---

## Appendix: Example Skill Definition

Here's a complete example of how our api-development Skill would look:

```yaml
---
name: api-development
description: Research-driven API integration with 13-phase TDD workflow including disambiguation, scope confirmation, comprehensive research (Context7 + WebSearch + ToC scraping), structured interview, schema creation, environment validation, TDD cycles (Red-Green-Refactor), implementation verification, and documentation generation. Use when integrating external APIs, building REST endpoints, creating API routes, or adding third-party service integrations. Triggers on "integrate API", "build endpoint", "add API support", "create API route", "connect to [service]".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebSearch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__github__*
---

# API Development Skill

This Skill implements the complete 13-phase interview-driven, research-first API development workflow with continuous verification loops.

## When to Use This Skill

Claude will automatically use this Skill when you:
- Mention integrating an external API ("integrate Stripe API")
- Want to build a new API endpoint ("create endpoint for payments")
- Need to add third-party service support ("add SendGrid email support")
- Ask about API routes ("build API route for user authentication")

## How It Works

1. **Auto-detection**: Claude recognizes API integration requests from natural language
2. **Workflow invocation**: Internally calls `/hustle-api-create [detected-api-name]`
3. **13-phase execution**: Guides you through the complete workflow with checkpoints
4. **Verification loops**: Re-researches after implementation to catch memory-based errors

## The 13 Phases

### Phase 1: Disambiguation
Clarify ambiguous terms before research begins.

**Example:**
```
User: "I want to integrate the AI API"
Claude: Which AI API do you mean?
[1] OpenAI API
[2] Anthropic Claude API
[3] Google Gemini API
[4] Cohere API
```

### Phase 2: Scope Confirmation
Confirm understanding of endpoint purpose.

### Phase 3: Initial Research (Map Phase)
- Identify official documentation
- Scrape ToC/navigation structure
- Extract all endpoint paths
- Generate feature matrix

### Phase 4: Interview
Ask questions FROM research findings (not templates).

### Phase 5: Deep Research (Reduce Phase)
Deep dive into selected endpoints with Context7 + WebSearch.

### Phase 6: Schema Creation
Create Zod schemas from research + interview decisions.

### Phase 7: Environment Check
Verify required API keys exist.

### Phase 8: TDD Red Phase
Write failing tests BEFORE implementation.

### Phase 9: TDD Green Phase
Minimal implementation to make tests pass.

### Phase 10: Verification
Re-research documentation and compare to implementation.

### Phase 11: TDD Refactor
Clean up code while keeping tests green.

### Phase 12: Documentation
Update manifests, OpenAPI spec, research cache.

### Phase 13: Completion
Final verification, cost tracking summary, commit.

## Supporting Files

- [REFERENCE.md](REFERENCE.md) - Complete phase documentation
- [templates/route.template.ts](templates/route.template.ts) - Next.js route template
- [templates/schema.template.ts](templates/schema.template.ts) - Zod schema template
- [templates/test.template.ts](templates/test.template.ts) - Vitest test template

## Requirements

- Next.js 15.x with App Router
- TypeScript 5.x
- Zod for validation
- Vitest for testing
- API keys for external services

## Cost Tracking

This Skill automatically tracks:
- Token usage per phase
- Cost per provider (OpenAI, Anthropic, etc.)
- Session duration
- Efficiency metrics

Final summary shows total cost and time spent.

## Examples

### Example 1: Simple API Integration

**Input:**
```
User: "Integrate the Brandfetch API to get company logos"
```

**Skill execution:**
1. Detects "Brandfetch API" integration request
2. Runs `/hustle-api-create brandfetch`
3. Guides through 13 phases
4. Creates:
   - `src/app/api/v2/brandfetch/route.ts`
   - `src/app/api/v2/brandfetch/__tests__/brandfetch.test.ts`
   - `src/app/api/v2/brandfetch/schema.ts`
   - Updates registry, manifests, docs

### Example 2: Multi-Endpoint API

**Input:**
```
User: "Add Firecrawl for web scraping"
```

**Skill execution:**
1. Research discovers 12 endpoints (scrape, crawl, map, batch, webhooks, etc.)
2. Asks which endpoints to build
3. For each selected endpoint, runs complete TDD cycle
4. Tracks each in state file separately

## Troubleshooting

**Issue:** "Skill not triggering when I mention APIs"

**Fix:** Be explicit with trigger words:
- ✅ "Integrate Stripe API"
- ✅ "Build endpoint for payments"
- ❌ "I need payments" (too vague)

**Issue:** "Research missing some API features"

**Fix:** This is addressed in v3.11.0 with map-reduce research pattern that scrapes documentation ToC.

## Version History

- **v3.10.x**: Commands only (no Skill yet)
- **v3.11.0**: Hybrid - Skill wraps command
- **v3.12.0**: Skills-first with hook migration

For full changelog, see [CHANGELOG.md](../../CHANGELOG.md).
```

---

**End of Document**

**Last Updated:** 2025-12-13
**Version:** 1.0
**Status:** Ready for implementation
