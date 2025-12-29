# Advanced Patterns for Claude Code Development

**Generated:** 2025-12-29
**Based On:** Ralph Wiggum Technique, Sankalp's Context Engineering Guide
**Repository:** @hustle-together/api-dev-tools v3.12.x

---

## Executive Summary

This document captures advanced Claude Code patterns discovered through community research, comparing them against our current implementation and identifying enhancement opportunities.

---

## Pattern 1: Ralph Wiggum Autonomous Loop

### What It Is

An autonomous execution mode where Claude runs 50-100+ sequential tool calls without user intervention, completing complex multi-phase tasks in a single "loop."

### Research Findings

- Claude can handle 90+ autonomous tool calls per session
- Most effective when: clear goal, defined boundaries, stop conditions
- Reduces "context switching tax" from user interruptions
- Named after Ralph Wiggum's "I'm doing things!" energy

### Our Current Implementation

```
Phase 1 → User Confirms → Phase 2 → User Confirms → ...
```

Every phase requires explicit user acknowledgment.

### Enhancement Opportunity

Add autonomous mode flag to workflow commands:

```bash
/hustle-api-create stripe-webhooks --autonomous
```

When enabled:

- Run phases 1-9 without stopping (research → interview → green)
- Only pause at Phase 10 (verification) for user review
- Use TodoWrite for progress visibility instead of prompts

### Implementation Priority: **Medium**

Useful for trusted scenarios but requires careful guardrails.

---

## Pattern 2: Context Budget Awareness

### What It Is

Understanding that only 50-60% of injected context is "effectively" used by the model, with implications for how we structure information.

### Research Findings

- Model attention is not uniform across context window
- Recent context gets more attention than distant context
- Structured data (JSON, tables) parse better than prose
- System reminders can "refresh" attention on key information

### Our Current Implementation

- `session-startup.py`: Injects ~300 tokens at session start
- `periodic-reground.py`: Injects ~500 tokens every 7 turns
- Skills: ~200-500 tokens each, loaded on-demand
- No tracking of context utilization

### Enhancement Opportunity

Add context efficiency monitoring:

```python
# In periodic-reground.py
context_metrics = {
    "total_context_size": estimate_context_size(state),
    "key_decisions_count": len(decisions),
    "research_age_days": days_since_research,
    "reground_count": len(reground_history),
    "estimated_effective_context": total * 0.55  # 55% rule
}
```

Report context health in re-grounding:

```
**Context Health:**
  - Session tokens: ~12,000 (estimated)
  - Effective context: ~6,600 (55%)
  - Key decisions in memory: 5 of 8
  - Recommendation: Consider summarizing research cache
```

### Implementation Priority: **Low**

Nice-to-have visibility but doesn't affect functionality.

---

## Pattern 3: Throw-Away First Draft (Spike)

### What It Is

Writing a quick implementation to understand the problem space, then deliberately deleting it before doing proper TDD.

### Research Findings

- First implementation reveals hidden requirements
- "Throw-away" mindset reduces attachment to suboptimal code
- TDD works better when you understand what you're testing
- The spike is exploration, not production code

### Our Current Implementation

- Direct TDD: Phase 8 (Red) → Phase 9 (Green)
- No exploratory phase
- We have `/spike` command but it's not integrated into main workflow

### Enhancement Opportunity

Make spike optional in `/hustle-api-create`:

```markdown
## Phase 7.5: Spike (Optional)

**Ask user:** "Would you like to do a quick spike implementation first?"

If yes:

1. Write quick implementation without tests
2. Note discoveries: edge cases, complexity, dependencies
3. **Delete the spike code**
4. Proceed to Phase 8 (Red) with better understanding

If no:

- Proceed directly to Phase 8 (Red)
```

### Implementation Priority: **Medium**

Valuable for complex/unfamiliar APIs. Already have `/spike` skill.

---

## Pattern 4: Operator Mode Toggle

### What It Is

Different behavioral modes for different scenarios:

- **Interactive**: Step-by-step with user confirmation (current default)
- **Autonomous**: Run until completion or blocker
- **Review**: Ask for approval before every write operation

### Research Findings

- Users want different levels of autonomy for different tasks
- Bug fixes: often want autonomous mode
- New features: often want interactive mode
- Refactoring: often want review mode

### Our Current Implementation

- Always interactive mode
- No way to toggle behavior

### Enhancement Opportunity

Add mode parameter to commands:

```bash
/hustle-api-create endpoint --mode=autonomous  # Run until completion
/hustle-api-create endpoint --mode=interactive # Current behavior (default)
/hustle-api-create endpoint --mode=review      # Confirm every edit
```

Mode affects:

- Phase transition behavior
- File write confirmations
- Research depth decisions

### Implementation Priority: **High**

Significant UX improvement for different workflows.

---

## Pattern 5: Skills as "Prompt on Demand"

### What It Is

Skills are not just commands - they're specialized prompts that inject domain-specific context exactly when needed.

### Research Findings

- Skills should encode expert knowledge, not just commands
- Each skill is a "mini CLAUDE.md" for that domain
- Skills can reference other skills for composition
- Best skills include: examples, anti-patterns, verification steps

### Our Current Implementation

- 23 skills in `.skills/` directory
- Skills contain instructions and examples
- Good structure but could be more "expert-like"

### Enhancement Opportunity

Enrich skills with:

1. **Anti-patterns section**: What NOT to do
2. **Verification checklist**: How to know it's done right
3. **Common mistakes**: Pitfalls to avoid
4. **Reference implementations**: Link to gold-standard examples

Example enhancement for `api-create` skill:

```markdown
## Anti-Patterns (AVOID)

- Generic template questions not derived from research
- Implementing without checking rate limits
- Skipping webhook signature verification
- Using string concatenation for API URLs

## Verification Checklist

- [ ] All parameters from docs are in schema
- [ ] Error handling covers documented error codes
- [ ] Rate limiting is implemented if API requires
- [ ] Tests cover happy path AND error scenarios
```

### Implementation Priority: **Medium**

Improves quality but requires expertise to write well.

---

## Pattern 6: System Reminders as Attention Manipulation

### What It Is

Using `<system-reminder>` tags strategically to keep critical information in model attention.

### Research Findings

- System reminders bypass normal context decay
- Most effective for: constraints, decisions, current state
- Should be concise (under 100 tokens each)
- Can be injected via PostToolUse hooks

### Our Current Implementation

- `periodic-reground.py` injects context every 7 turns
- Format uses markdown headers and bullet points
- Good structure but could be more targeted

### Enhancement Opportunity

Add "critical reminders" that appear more frequently:

```python
# Every turn (not just every 7)
critical_reminders = [
    f"Active endpoint: {endpoint}",
    f"Current phase: {current_phase}",
    f"Must verify: {next_verification_step}"
]
```

These ultra-short reminders (under 30 tokens) prevent drift without overwhelming context.

### Implementation Priority: **Low**

Current 7-turn interval works well. Optimization only if drift observed.

---

## Pattern 7: Two-Model Workflow Optimization

### What It Is

Using cheaper/faster models for exploration and expensive/accurate models for implementation.

### Research Findings

- Haiku: $0.001/query, fast, good for: search, summaries, validation
- Sonnet: $0.015/query, accurate, good for: implementation, complex reasoning
- Opus: $0.075/query, best quality, good for: critical decisions, complex code
- Don't use Opus for tasks Haiku can handle

### Our Current Implementation

- 7 subagents defined
- Haiku: parallel-researcher, research-validator, docs-generator
- Sonnet: schema-generator, test-writer, implementation-reviewer, code-reviewer

### Enhancement Opportunity

Explicitly assign model tiers in workflow:

| Phase                       | Model             | Reason                 |
| --------------------------- | ----------------- | ---------------------- |
| 1-2 (Disambiguation, Scope) | Main session      | User interaction       |
| 3 (Research)                | Haiku subagents   | Parallel cheap queries |
| 4 (Interview)               | Main session      | User interaction       |
| 5 (Deep Research)           | Haiku subagents   | More cheap queries     |
| 6 (Schema)                  | Sonnet subagent   | Accuracy critical      |
| 7 (Environment)             | Haiku             | Simple checks          |
| 8 (TDD Red)                 | Sonnet subagent   | Test quality matters   |
| 9 (TDD Green)               | Main session      | Complex implementation |
| 10 (Verify)                 | Haiku subagents   | Validation queries     |
| 11 (Code Review)            | Sonnet (Greptile) | External service       |
| 12-14                       | Main session      | Finalization           |

### Implementation Priority: **Already Implemented**

We have this pattern. Document for clarity.

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 hours)

1. Move `.skills/` to `.claude/skills/` (or symlink)
2. Add TodoWrite calls to main workflow skills
3. Document two-model workflow in skills

### Phase 2: Medium Effort (4-8 hours)

1. Add `--mode` parameter to workflow commands
2. Integrate `/spike` into `/hustle-api-create` optionally
3. Enhance skills with anti-patterns and checklists

### Phase 3: Larger Features (8-16 hours)

1. Implement Ralph Wiggum autonomous mode
2. Add context budget tracking/reporting
3. Create dashboard for workflow metrics

---

## Comparison Matrix

| Pattern            | Research Best Practice  | Our Implementation | Status  |
| ------------------ | ----------------------- | ------------------ | ------- |
| Autonomous loop    | 90+ tool calls          | Phase-by-phase     | Gap     |
| Context budget     | 50-60% effective        | No tracking        | Gap     |
| Throw-away spike   | Before TDD              | Optional `/spike`  | Partial |
| Operator modes     | Interactive/Auto/Review | Always interactive | Gap     |
| Skills as prompts  | Expert knowledge        | Good structure     | Partial |
| System reminders   | Attention manipulation  | 7-turn reground    | Good    |
| Two-model workflow | Haiku/Sonnet split      | 7 subagents        | Good    |

---

## Conclusion

Our implementation already exceeds standard Claude Code patterns in several areas:

- 14-phase enforcement with loop-back
- 7-turn re-grounding
- Two-model subagent architecture
- Research-driven interview questions

Key gaps to address:

1. **Autonomous mode** - Allow trusted workflows to run without interruption
2. **Operator modes** - Give users control over interaction level
3. **Skills location** - Move to native `.claude/skills/` path
4. **TodoWrite integration** - Visual progress during long workflows

The Ralph Wiggum pattern is the most impactful gap - enabling autonomous completion of trusted workflows would significantly improve UX for experienced users.

---

_Last Updated: 2025-12-29_
_Document Version: 1.0.0_
