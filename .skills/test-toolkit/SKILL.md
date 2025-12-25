---
name: test-toolkit
description: Test the api-dev-tools toolkit itself - validate hooks, skills, state machine, templates, and external integrations. Use during development of the toolkit or to verify installation is correct. Keywords: test, validate, hooks, skills, verify, check, integration, debug
version: "3.11.0"
license: MIT
author: Hustle Together
compatibility: Claude Code with Python 3.9+
allowed-tools: Read Bash Grep Glob TodoWrite
metadata:
  category: "development"
  tags: ["test", "validate", "hooks", "skills", "debug", "toolkit"]
---

# Test Toolkit

Validate all components of the api-dev-tools toolkit.

## Usage

```bash
/test-toolkit              # Run all tests
/test-toolkit --hooks      # Test Python hooks only
/test-toolkit --skills     # Test SKILL.md files only
/test-toolkit --templates  # Test templates only
/test-toolkit --state      # Test state machine
/test-toolkit --integrations  # Check external tools
```

## Test Categories

### 1. Hook Validation (`--hooks`)

Tests all Python hooks in `.skills/_shared/hooks/` and `.claude/hooks/`:

```
┌─────────────────────────────────────────────────────────┐
│  Hook Validation                                        │
├─────────────────────────────────────────────────────────┤
│  ✅ api-workflow-check.py     - Syntax valid            │
│  ✅ enforce-research.py       - Syntax valid            │
│  ✅ track-tool-use.py         - Syntax valid            │
│  ...                                                    │
│                                                         │
│  Tests run:                                             │
│  • Python syntax (py_compile)                           │
│  • Import validation                                    │
│  • JSON output format                                   │
│  • Required functions exist                             │
└─────────────────────────────────────────────────────────┘
```

**Commands:**
```bash
# Syntax check all hooks
for f in .skills/_shared/hooks/*.py .claude/hooks/*.py; do
  python3 -m py_compile "$f" 2>&1 && echo "✅ $(basename $f)" || echo "❌ $(basename $f)"
done

# Test hook with mock input
echo '{"tool_name": "Read", "tool_input": {"file_path": "test.ts"}}' | python3 hook.py
```

### 2. Skill Validation (`--skills`)

Tests all SKILL.md files in `.skills/`:

```
┌─────────────────────────────────────────────────────────┐
│  Skill Validation                                       │
├─────────────────────────────────────────────────────────┤
│  ✅ api-create         - Valid frontmatter              │
│  ✅ hustle-ui-create   - Valid frontmatter              │
│  ✅ commit             - Valid frontmatter              │
│  ...                                                    │
│                                                         │
│  Checks:                                                │
│  • YAML frontmatter parses                              │
│  • Required fields: name, description                   │
│  • allowed-tools are valid tool names                   │
│  • No broken internal links                             │
└─────────────────────────────────────────────────────────┘
```

**Validation rules:**
- `name` field must exist and match directory name
- `description` field must exist
- `allowed-tools` must be space-separated valid tool names
- Version should match package.json

### 3. Template Validation (`--templates`)

Tests all templates in `templates/`:

```
┌─────────────────────────────────────────────────────────┐
│  Template Validation                                    │
├─────────────────────────────────────────────────────────┤
│  ✅ component/Component.tsx       - Valid TypeScript    │
│  ✅ component/Component.test.tsx  - Valid TypeScript    │
│  ✅ component/Component.stories.tsx - Valid TypeScript  │
│  ✅ page/page.tsx                 - Valid TypeScript    │
│  ✅ page/page.e2e.test.ts         - Valid TypeScript    │
│  ⚠️  api-test/route.test.ts       - MISSING             │
│                                                         │
│  Checks:                                                │
│  • TypeScript syntax valid                              │
│  • Placeholder variables present (__NAME__, etc.)       │
│  • Test templates have describe/it blocks               │
└─────────────────────────────────────────────────────────┘
```

### 4. State Machine Validation (`--state`)

Tests the api-dev-state.json schema and transitions:

```
┌─────────────────────────────────────────────────────────┐
│  State Machine Validation                               │
├─────────────────────────────────────────────────────────┤
│  ✅ State file exists                                   │
│  ✅ JSON is valid                                       │
│  ✅ All phases present                                  │
│  ✅ workflow_active field exists                        │
│  ✅ integrations section exists                         │
│                                                         │
│  Phase transition rules:                                │
│  • not_started → in_progress ✅                         │
│  • in_progress → complete ✅                            │
│  • complete → in_progress (re-open) ✅                  │
│  • not_started → complete (skip) ❌ BLOCKED             │
└─────────────────────────────────────────────────────────┘
```

### 5. Integration Check (`--integrations`)

Checks external tool availability:

```
┌─────────────────────────────────────────────────────────┐
│  Integration Check                                      │
├─────────────────────────────────────────────────────────┤
│  Graphite CLI:                                          │
│    Command: gt --version                                │
│    Status: ❌ Not installed                             │
│    Install: brew install withgraphite/tap/graphite     │
│                                                         │
│  GitHub CLI:                                            │
│    Command: gh --version                                │
│    Status: ✅ Installed (v2.40.0)                       │
│                                                         │
│  CodeRabbit:                                            │
│    Check: GitHub App installed on repo                  │
│    Status: ⚠️  Unknown (check GitHub settings)          │
│                                                         │
│  Greptile:                                              │
│    Check: GitHub App installed on repo                  │
│    Status: ⚠️  Unknown (check GitHub settings)          │
│                                                         │
│  Node.js:                                               │
│    Command: node --version                              │
│    Status: ✅ v20.11.0                                  │
│                                                         │
│  pnpm:                                                  │
│    Command: pnpm --version                              │
│    Status: ✅ v10.11.0                                  │
└─────────────────────────────────────────────────────────┘
```

## Implementation

When `/test-toolkit` is invoked:

1. **Parse arguments** to determine which tests to run
2. **Initialize TodoWrite** with test categories as tasks
3. **Run each test category**, updating todos as they complete
4. **Report results** in a summary table

### Test Runner Script

```bash
#!/bin/bash
# Quick validation script

echo "=== Hook Validation ==="
for f in .skills/_shared/hooks/*.py .claude/hooks/*.py 2>/dev/null; do
  [ -f "$f" ] && python3 -m py_compile "$f" 2>&1 && echo "✅ $(basename $f)" || echo "❌ $(basename $f)"
done

echo ""
echo "=== Skill Count ==="
echo "Skills: $(find .skills -name 'SKILL.md' | wc -l)"

echo ""
echo "=== Template Check ==="
ls templates/*/

echo ""
echo "=== State File ==="
cat .claude/api-dev-state.json | python3 -m json.tool > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"

echo ""
echo "=== Integration Check ==="
command -v gt >/dev/null && echo "✅ Graphite CLI" || echo "❌ Graphite CLI not found"
command -v gh >/dev/null && echo "✅ GitHub CLI" || echo "❌ GitHub CLI not found"
command -v node >/dev/null && echo "✅ Node.js $(node --version)" || echo "❌ Node.js not found"
command -v pnpm >/dev/null && echo "✅ pnpm $(pnpm --version)" || echo "❌ pnpm not found"
```

## Expected Results

### All Tests Passing

```
┌─────────────────────────────────────────────────────────┐
│  Test Toolkit Results                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Hooks:        19/19 passing ✅                         │
│  Skills:       31/31 valid ✅                           │
│  Templates:    8/9 complete ⚠️ (1 missing)              │
│  State:        Valid ✅                                 │
│  Integrations: 3/5 available ⚠️                         │
│                                                         │
│  Missing:                                               │
│  • templates/api-test/route.test.ts                     │
│  • Graphite CLI not installed                           │
│  • CodeRabbit/Greptile status unknown                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Adding New Tests

To extend test coverage:

1. Add test logic to appropriate category
2. Update the summary output
3. Add to TodoWrite task list
4. Document in this SKILL.md

## Related Skills

- `/api-status` - Check API workflow progress
- `/gap` - Analyze implementation gaps
- `/stats` - View session statistics
