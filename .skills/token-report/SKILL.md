---
name: token-report
description: Generate token usage report by workflow phase
tools: Bash, Read
model: haiku
---

# Token Report Skill

Generate an **estimated** token usage report showing approximate costs by workflow phase.

> **Note:** Token counts are estimated based on ccusage session data correlated with
> phase timestamps. Actual usage may vary by ±10%. For precise billing, check your
> Anthropic dashboard.

## When to Use

- After completing an API workflow
- To understand cost distribution across phases
- For budget planning and optimization
- When investigating expensive operations

## Execution Steps

### Step 1: Check ccusage Installation

```bash
which ccusage || npx ccusage --version
```

If not installed:
```bash
npm install -g ccusage
```

### Step 2: Read State File

```bash
cat .claude/api-dev-state.json | jq '.token_usage'
```

### Step 3: Get Current Session Usage

```bash
npx ccusage session --json
```

### Step 4: Generate Report

```
═══════════════════════════════════════════════════════
           TOKEN USAGE REPORT (ESTIMATED)
═══════════════════════════════════════════════════════

Session Started: 2025-12-29 10:00:00
Total Duration: 45 minutes

Phase Breakdown:
─────────────────────────────────────────────────────
Phase                    Tokens      Cost      % Total
─────────────────────────────────────────────────────
1. Disambiguation         1,200     $0.01        2.7%
2. Scope                  1,500     $0.02        3.3%
3. Initial Research       8,400     $0.08       18.7%
4. Interview              3,100     $0.03        6.9%
5. Deep Research         12,500     $0.13       27.8%
6. Schema                 2,800     $0.03        6.2%
7. Environment              500     $0.01        1.1%
8. TDD Red                4,200     $0.04        9.3%
9. TDD Green              5,100     $0.05       11.3%
10. Verify                3,200     $0.03        7.1%
11. Code Review           1,500     $0.02        3.3%
12. Refactor                800     $0.01        1.8%
13. Documentation           200     $0.00        0.4%
14. Completion              100     $0.00        0.2%
─────────────────────────────────────────────────────
TOTAL                    45,100     $0.45      100.0%
═══════════════════════════════════════════════════════

Cost Analysis:
─────────────────────────────────────────────────────
Most Expensive Phase: Deep Research (27.8%)
Optimization Tip: Use targeted searches to reduce research tokens

Research Phases: 40.5% of tokens
Implementation Phases: 20.6% of tokens
Verification Phases: 10.4% of tokens
─────────────────────────────────────────────────────
```

## Output Interpretation

| Metric | Good | Warning | Action |
|--------|------|---------|--------|
| Research % | < 40% | 40-60% | > 60% - Optimize queries |
| Interview % | < 10% | 10-20% | > 20% - Reduce questions |
| TDD % | 15-25% | 10-30% | < 10% - Insufficient testing |

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--endpoint` | Specific endpoint to report | All |
| `--format` | Output format (text/json) | text |
| `--compare` | Compare with previous run | false |

## Examples

```bash
# Full report
/token-report

# Specific endpoint
/token-report --endpoint=users-create

# JSON output for processing
/token-report --format=json

# Compare with last run
/token-report --compare
```

## Integration

This skill reads from:
- `.claude/api-dev-state.json` - Phase timestamps and token data
- ccusage logs - Session token counts

## See Also

- `/api-status` - Current workflow status
- `/api-verify` - Verification phase
