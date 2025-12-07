# API Development Slash Commands

**Comprehensive API development workflow for V2 implementation**

## Overview

These slash commands implement an interview-driven, test-first methodology for API development. They automate the workflow described in the V2 Development Patterns and ensure consistent, high-quality API implementations.

## Available Commands

### 🎯 Complete Workflow

**`/api-create [endpoint-name]`**
- Orchestrates the entire API development process
- Runs all phases automatically: Interview → Research → Environment Check → TDD → Documentation
- Use this for new endpoints to ensure nothing is missed

### 📋 Individual Phases

**`/api-interview [endpoint-name]`**
- Conducts structured 20-question interview (Anthropic Interviewer methodology)
- Documents purpose, usage, requirements, edge cases
- Creates endpoint documentation file
- **Output:** `/src/v2/docs/endpoints/[endpoint-name].md`

**`/api-research [library-or-service]`**
- Researches external APIs, SDKs, and libraries
- Discovers ALL parameters (documented + undocumented)
- Extracts complete schemas from source code
- Documents integration requirements
- **Output:** `/src/v2/docs/research/[library-name].md`

**`/api-env [endpoint-name]`**
- Checks for required API keys
- Verifies .env.local and .env.example
- Provides setup instructions for missing keys
- **Output:** Terminal report + action items

**`/api-status [endpoint-name]`** or **`/api-status --all`**
- Shows implementation progress
- Tracks phases (Interview → Research → Red → Green → Refactor → Complete)
- Updates V2 implementation status document
- **Output:** Progress report

### 🔴🟢🔵 TDD Cycle

Use the existing TDD commands from AI_WORKFLOW.md:
- `/red` - Write ONE failing test
- `/green` - Minimal implementation to pass
- `/refactor` - Clean up code while tests pass
- `/cycle [description]` - Full Red → Green → Refactor loop

## Complete Workflow Example

### Option 1: Fully Automated
```bash
/api-create generate-css
```
This will:
1. Interview you about the endpoint
2. Research required libraries (Gemini SDK, etc.)
3. Check environment/API keys
4. Write failing tests (Red)
5. Implement minimal solution (Green)
6. Refactor for quality (Refactor)
7. Update all documentation
8. Verify tests and coverage
9. Create commit

### Option 2: Manual Step-by-Step
```bash
# Phase 1: Understanding
/api-interview generate-css
# (Answer 20 questions about purpose, usage, requirements)

# Phase 2: Research
/api-research google-generative-ai
# (Discovers all Gemini SDK parameters)

# Phase 3: Environment
/api-env generate-css
# (Verifies GOOGLE_GENERATIVE_AI_API_KEY exists)

# Phase 4: TDD Implementation
/red
# (Write failing tests based on interview + research)

/green
# (Implement route handler with Zod schemas)

/refactor
# (Clean up, extract patterns, improve code)

# Phase 5: Documentation
# (Update api-tests-manifest.json, OpenAPI spec, status doc)

# Phase 6: Commit
pnpm test:run
/commit
```

## Command Cheat Sheet

| Command | When to Use | Output |
|---------|-------------|--------|
| `/api-create [endpoint]` | Starting new endpoint | Complete implementation |
| `/api-interview [endpoint]` | Need to understand requirements | Documentation file |
| `/api-research [library]` | Integrating external API/SDK | Research document |
| `/api-env [endpoint]` | Before implementation | Environment check report |
| `/api-status [endpoint]` | Check progress | Status report |
| `/red` | Write test first | Failing test |
| `/green` | Make test pass | Working implementation |
| `/refactor` | Clean up code | Improved code |
| `/cycle [desc]` | Implement feature | Full TDD cycle |

## File Structure Created

Each endpoint creates this structure:
```
src/app/api/v2/[endpoint-name]/
├── route.ts                               # API handler with Zod schemas
├── __tests__/
│   └── [endpoint-name].api.test.ts       # Comprehensive tests
└── README.md                              # Endpoint documentation

src/v2/docs/
├── endpoints/
│   └── [endpoint-name].md                # Interview results
└── research/
    └── [library-name].md                 # External API research

src/app/api-test/
└── api-tests-manifest.json               # Updated with new tests

src/lib/openapi/endpoints/
└── [endpoint-name].ts                    # OpenAPI spec
```

## Workflow Principles

### 1. Context First
**Never write code without understanding WHY it exists.**
- Interview before implementation
- Document real-world usage
- Understand edge cases

### 2. Research Thoroughly
**Find ALL parameters, not just the documented ones.**
- Read official docs
- Check source code
- Review TypeScript definitions
- Test assumptions

### 3. Test First (TDD)
**No implementation without a failing test.**
- Red: Write test that fails
- Green: Minimal code to pass
- Refactor: Improve while tests pass

### 4. Document Everything
**Future you needs to understand this.**
- Interview results
- Research findings
- API schemas
- Code examples
- Testing notes

### 5. Verify Environment
**Check API keys before starting.**
- Identify required services
- Verify keys exist
- Document setup
- Test connections

## Integration with Existing Tools

These commands work alongside:
- **`/plan`** - Create implementation checklist
- **`/gap`** - Find missing pieces
- **`/issue [url]`** - Start from GitHub issue
- **`/commit`** - AI-generated semantic commits
- **`/pr`** - Create pull request

## Why This Approach Works

### Problems with Previous Approach
❌ Tests written without understanding purpose
❌ Missing parameters from incomplete research
❌ Failed tests due to missing API keys
❌ No documentation of real-world usage
❌ Mechanical testing without context

### Benefits of New Approach
✅ Deep understanding before coding
✅ Complete parameter coverage
✅ Environment verified upfront
✅ Documentation drives implementation
✅ Tests reflect actual usage patterns
✅ Consistent, repeatable process
✅ Nothing gets forgotten

## Getting Started

### First Time Setup
1. Review this README
2. Read `/src/v2/docs/AI_WORKFLOW.md`
3. Read `/src/v2/docs/Main Doc – V2 Development Patterns.md`
4. Try `/api-create` with a simple endpoint

### For Each New Endpoint
```bash
# Quick automated approach
/api-create [endpoint-name]

# Or manual for learning
/api-interview [endpoint-name]
/api-research [library]
/api-env [endpoint-name]
/cycle [description]
/commit
```

### Checking Progress
```bash
/api-status --all           # See all endpoints
/api-status [endpoint]      # Specific endpoint
pnpm test:run               # Verify tests pass
```

## Installation Pattern (Future)

Currently these commands are project-specific in `.claude/commands/`.

**Future Goal:** Package as NPM tool like `@wbern/claude-instructions`:
```bash
npx @mirror-factory/api-dev-tools --scope=project
```

This would:
- Install commands automatically
- Work across projects
- Support customization via `<claude-commands-template>`
- Auto-update with new features

## References

- **AI Workflow:** `/src/v2/docs/AI_WORKFLOW.md`
- **V2 Patterns:** `/src/v2/docs/Main Doc – V2 Development Patterns.md`
- **AI SDK Catalog:** `/src/v2/docs/ai-sdk-catalog.json`
- **API Testing Plan:** `/src/v2/docs/API_TESTING_PLAN.md`
- **Implementation Status:** `/src/v2/docs/v2-api-implementation-status.md`

## Support

If commands aren't working:
1. Check that files exist in `.claude/commands/`
2. Verify command syntax matches usage examples
3. Review error messages for missing dependencies
4. Check that required docs exist in `/src/v2/docs/`

## Contributing

To improve these commands:
1. Edit markdown files in `.claude/commands/`
2. Update this README
3. Test with real endpoint implementation
4. Document learnings
5. Commit improvements

---

**Last Updated:** 2025-12-06
**Version:** 1.0.0
**Status:** Ready for use
