# API Development Tools for Claude Code

**Interview-driven, research-first API development workflow**

Automates the complete API development lifecycle from understanding requirements to deployment through structured interviews, deep research, test-driven development, and comprehensive documentation.

## 🚀 Quick Start

```bash
# Install in your project
npx @hustle-together/api-dev-tools --scope=project

# Start developing an API
/api-create my-endpoint
```

## 📦 What This Installs

### Slash Commands
Five powerful slash commands for Claude Code:

- **`/api-create [endpoint]`** - Complete automated workflow (Interview → Research → TDD → Docs)
- **`/api-interview [endpoint]`** - Structured 20-question interview about purpose and usage
- **`/api-research [library]`** - Deep research of external APIs/SDKs (finds ALL parameters)
- **`/api-env [endpoint]`** - Check required API keys and environment setup
- **`/api-status [endpoint]`** - Track implementation progress and phase completion

### Enforcement Hooks
Six Python hooks that provide **real programmatic guarantees**:

- **`enforce-external-research.py`** - (v1.7.0) Detects external API questions and requires research before answering
- **`enforce-research.py`** - Blocks API code writing until research is complete
- **`enforce-interview.py`** - (v1.8.0+) Verifies structured questions with options were asked; (v1.9.0+) Injects decision reminders on writes
- **`verify-implementation.py`** - Checks implementation matches interview requirements
- **`track-tool-use.py`** - (v1.9.0+) Captures user decisions from AskUserQuestion; logs all research activity
- **`api-workflow-check.py`** - Prevents stopping until required phases are complete + git diff verification

### State Tracking
- **`.claude/api-dev-state.json`** - Persistent state file tracking all workflow progress

### MCP Servers (Auto-installed via `claude mcp add`)
- **Context7** - Fetches LIVE documentation from library source code (not training data)
- **GitHub** - Read/create issues, pull requests, and access repository data (requires `GITHUB_PERSONAL_ACCESS_TOKEN`)

## 🎯 Why Use This?

### Problems This Solves

- ❌ **Writing tests without understanding purpose** → Mechanical tests that miss real use cases
- ❌ **Incomplete API research** → Missing optional parameters and edge cases
- ❌ **Runtime errors from missing API keys** → Tests fail due to configuration issues
- ❌ **No documentation of real usage** → Future developers don't understand context
- ❌ **Inconsistent implementation patterns** → Every endpoint looks different

### What You Get

- ✅ **Interview-first development** → Deep understanding before any code
- ✅ **Comprehensive research** → Discover ALL parameters, not just documented ones
- ✅ **Environment validation** → Verify API keys before starting
- ✅ **TDD enforced** → Red → Green → Refactor cycle mandatory
- ✅ **Auto-documentation** → Updates manifests, OpenAPI specs, status tracking
- ✅ **Consistent workflow** → Repeatable, testable, maintainable

## 💡 How It Works

### Fully Automated
```bash
/api-create generate-pdf
```

This single command:
1. **Interviews you** about the endpoint (20 structured questions)
2. **Researches** required libraries and external APIs
3. **Checks environment** for API keys and configuration
4. **Writes failing tests** first (TDD Red phase)
5. **Implements** minimal solution (TDD Green phase)
6. **Refactors** for quality (TDD Refactor phase)
7. **Updates documentation** (manifests, OpenAPI, examples)
8. **Creates commit** with semantic message

### Manual Step-by-Step
```bash
/api-interview generate-pdf    # Understand purpose & requirements
/api-research pdf-lib          # Research PDF library thoroughly
/api-env generate-pdf          # Verify environment & API keys
/red                           # Write ONE failing test
/green                         # Implement to make it pass
/refactor                      # Clean up the code
/api-status generate-pdf       # Update progress tracking
/commit                        # Create semantic commit
```

## 📋 Installation

### One-Time Installation
```bash
cd your-project
npx @hustle-together/api-dev-tools --scope=project
```

### Team-Wide Auto-Installation

Add to your project's `package.json`:
```json
{
  "scripts": {
    "postinstall": "npx @hustle-together/api-dev-tools --scope=project"
  }
}
```

Now anyone who runs `npm install` or `pnpm install` gets the commands automatically.

## 📚 Command Reference

### `/api-create [endpoint-name]`

**The orchestrator.** Runs the complete workflow automatically.

**Example:**
```bash
/api-create user-preferences
```

**What it does:**
- Interviews you about requirements
- Researches dependencies (Next.js API routes, Zod, etc.)
- Checks environment (Supabase keys, etc.)
- Writes comprehensive tests
- Implements with Zod validation
- Updates all documentation
- Creates commit

---

### `/api-interview [endpoint-name]`

**Structured discovery.** 20-question interview based on Anthropic Interviewer methodology.

**Example:**
```bash
/api-interview send-email
```

**Questions cover:**
- Purpose & context
- Real-world usage scenarios
- Required vs. optional parameters
- Dependencies & API keys
- Error handling & edge cases
- Documentation sources

**Output:** `/src/v2/docs/endpoints/[endpoint-name].md`

---

### `/api-research [library-or-service]`

**Deep dive.** Discovers ALL parameters by reading source code and documentation.

**Example:**
```bash
/api-research resend-api
```

**Finds:**
- Official documentation links
- Complete request/response schemas
- Undocumented parameters (from source code)
- TypeScript type definitions
- Rate limits, quotas, costs
- Integration patterns
- Code examples

**Output:** `/src/v2/docs/research/[library-name].md`

---

### `/api-env [endpoint-name]`

**Environment check.** Verifies API keys and configuration before implementation.

**Example:**
```bash
/api-env send-email
```

**Checks:**
- Required API keys exist in `.env.local`
- Templates in `.env.example`
- `.gitignore` protects secrets
- Service connectivity (optional)

**Output:** Terminal report + action items

---

### `/api-status [endpoint-name]`

**Progress tracking.** Shows implementation status and phase completion.

**Examples:**
```bash
/api-status send-email         # Specific endpoint
/api-status --all              # All endpoints
```

**Tracks:**
- Interview completion
- Research completion
- Environment readiness
- TDD phases (Red → Green → Refactor)
- Documentation updates
- Test coverage

**Output:** Progress report + status document updates

## 🔄 Workflow Integration

Works seamlessly with existing Claude Code commands:

```bash
/plan          # Create implementation checklist
/gap           # Find missing pieces
/issue [url]   # Start from GitHub issue

/api-create    # ← Run complete API workflow

/commit        # Semantic commit message
/pr            # Create pull request
```

## 🎓 Methodology

Based on proven approaches:

- **[Anthropic Interviewer](https://www.anthropic.com/news/anthropic-interviewer)** - Structured interview methodology
- **TDD (Test-Driven Development)** - Red → Green → Refactor cycle
- **[@wbern/claude-instructions](https://github.com/wbern/claude-instructions)** - Slash command pattern
- **V2 Development Patterns** - Zod schemas, consistent structure

## 📁 Output Artifacts

Each endpoint creates:

```
src/app/api/v2/[endpoint]/
├── route.ts                          # Handler with Zod schemas
├── __tests__/
│   └── [endpoint].api.test.ts        # Comprehensive tests (100% coverage)
└── README.md                          # Endpoint documentation

src/v2/docs/
├── endpoints/
│   └── [endpoint].md                 # Interview results & requirements
└── research/
    └── [library].md                  # External API research findings

Updated files:
- src/app/api-test/api-tests-manifest.json    # Test documentation
- src/lib/openapi/endpoints/[endpoint].ts     # OpenAPI spec
- src/v2/docs/v2-api-implementation-status.md # Progress tracking
```

## 🏗 Project Structure Required

This tool expects:
- **Next.js** API routes (`src/app/api/`)
- **Vitest** for testing
- **Zod** for validation
- **TypeScript** strict mode

Not tied to specific AI providers - works with any API architecture.

## 🔑 Key Principles

1. **Context First** - Understand WHY before HOW
2. **Research Thoroughly** - Find ALL parameters, not just documented
3. **Test First** - No implementation without failing test
4. **Document Everything** - Future you needs to understand this
5. **Verify Environment** - Check API keys before starting
6. **Consistent Process** - Same workflow every time

## 🆚 Comparison

### Without API Dev Tools
```
1. Start coding immediately
2. Guess at parameters
3. Discover missing API keys mid-development
4. Write tests after implementation (if at all)
5. Forget to update documentation
6. Inconsistent patterns across endpoints
7. No progress tracking

Result: Brittle APIs, poor docs, hard to maintain
```

### With API Dev Tools
```
1. Interview to understand requirements
2. Research to find ALL parameters
3. Verify environment before coding
4. Write failing tests first (TDD)
5. Implement with minimal code
6. Auto-update all documentation
7. Track progress throughout

Result: Robust APIs, comprehensive docs, easy to maintain
```

## 🔒 Programmatic Enforcement (Hooks)

Unlike pure markdown instructions that rely on Claude following directions, this package includes **real Python hooks** that enforce workflow compliance.

### How Hooks Work

```
┌─────────────────────────────────────────────────────────────┐
│  USER: "Add Vercel AI SDK"                                  │
│                    ↓                                        │
│  CLAUDE: Calls WebSearch for docs                           │
│                    ↓                                        │
│  HOOK: PostToolUse (track-tool-use.py)                      │
│  → Logs search to api-dev-state.json                        │
│                    ↓                                        │
│  CLAUDE: Tries to Write route.ts                            │
│                    ↓                                        │
│  HOOK: PreToolUse (enforce-research.py)                     │
│  → Checks: Has research been completed?                     │
│  → If NO: BLOCKED with error message                        │
│  → If YES: Allowed to proceed                               │
│                    ↓                                        │
│  CLAUDE: Tries to stop conversation                         │
│                    ↓                                        │
│  HOOK: Stop (api-workflow-check.py)                         │
│  → Checks: Are all required phases complete?                │
│  → If NO: BLOCKED with list of incomplete phases            │
│  → If YES: Allowed to stop                                  │
└─────────────────────────────────────────────────────────────┘
```

### What Gets Enforced

| Action | Hook | Enforcement |
|--------|------|-------------|
| Claude calls WebSearch/WebFetch/Context7 | `track-tool-use.py` | Logged to state file |
| Claude tries to write API code | `enforce-research.py` | **BLOCKED** if no research logged |
| Claude tries to stop | `api-workflow-check.py` | **BLOCKED** if phases incomplete |

### Check Progress Anytime

```bash
# View current state
cat .claude/api-dev-state.json | jq '.phases'

# Or use the status command
/api-status
```

### State File Structure

The `.claude/api-dev-state.json` file tracks:

```json
{
  "endpoint": "stream-text",
  "library": "vercel-ai-sdk",
  "phases": {
    "scope": { "status": "complete" },
    "research_initial": {
      "status": "complete",
      "sources": [
        { "type": "context7", "tool": "resolve_library_id" },
        { "type": "websearch", "query": "Vercel AI SDK docs" },
        { "type": "webfetch", "url": "https://sdk.vercel.ai" }
      ]
    },
    "interview": { "status": "complete" },
    "research_deep": { "status": "complete" },
    "schema_creation": { "status": "in_progress" },
    "tdd_red": { "status": "pending" },
    "tdd_green": { "status": "pending" },
    "tdd_refactor": { "status": "pending" },
    "documentation": { "status": "pending" }
  },
  "verification": {
    "all_sources_fetched": true,
    "schema_matches_docs": false,
    "tests_cover_params": false,
    "all_tests_passing": false
  }
}
```

### Why This Matters

**Without hooks (pure markdown instructions):**
- Claude *might* skip research if confident
- Claude *might* use outdated training data
- No way to verify steps were actually completed

**With hooks (programmatic enforcement):**
- Research is **required** - can't write code without it
- All research activity is **logged** - auditable trail
- Workflow completion is **verified** - can't stop early

## 🔍 Gap Detection & Verification (v1.6.0+)

The workflow now includes automatic detection of common implementation gaps:

### Gap 1: Exact Term Matching
**Problem:** AI paraphrases user terminology instead of using exact terms for research.

**Example:**
- User says: "Use Vercel AI Gateway"
- AI searches for: "Vercel AI SDK" (wrong!)

**Fix:** `verify-implementation.py` extracts key terms from interview answers and warns if those exact terms weren't used in research queries.

### Gap 2: File Change Tracking
**Problem:** AI claims "all files updated" but doesn't verify which files actually changed.

**Fix:** `api-workflow-check.py` runs `git diff --name-only` and compares against tracked `files_created`/`files_modified` in state. Warns about untracked changes.

### Gap 3: Skipped Test Investigation
**Problem:** AI accepts "9 tests skipped" without investigating why.

**Fix:** `verification_warnings` in state file tracks issues that need review. Stop hook shows unaddressed warnings.

### Gap 4: Implementation Verification
**Problem:** AI marks task complete without verifying implementation matches interview.

**Fix:** Stop hook checks that:
- Route files exist if endpoints mentioned
- Test files are tracked
- Key terms from interview appear in implementation

### Gap 5: Test/Production Alignment
**Problem:** Test files check different environment variables than production code.

**Example:**
- Interview: "single gateway key"
- Production: uses `AI_GATEWAY_API_KEY`
- Test: still checks `OPENAI_API_KEY` (wrong!)

**Fix:** `verify-implementation.py` warns when test files check env vars that don't match interview requirements.

### Gap 6: Training Data Reliance (v1.7.0+)
**Problem:** AI answers questions about external APIs from potentially outdated training data instead of researching first.

**Example:**
- User asks: "What providers does Vercel AI Gateway support?"
- AI answers from memory: "Groq not in gateway" (WRONG!)
- Reality: Groq has 4 models in the gateway (Llama variants)

**Fix:** New `UserPromptSubmit` hook (`enforce-external-research.py`) that:
1. Detects questions about external APIs/SDKs using pattern matching
2. Injects context requiring research before answering
3. Works for ANY API (Brandfetch, Stripe, Twilio, etc.) - not just specific ones
4. Auto-allows WebSearch and Context7 without permission prompts

```
USER: "What providers does Brandfetch API support?"
        ↓
HOOK: Detects "Brandfetch", "API", "providers"
        ↓
INJECTS: "RESEARCH REQUIRED: Use Context7/WebSearch before answering"
        ↓
CLAUDE: Researches first → Gives accurate answer
```

### Gap 7: Interview Decisions Not Used During Implementation (v1.9.0+)
**Problem:** AI asks good interview questions but then ignores the answers when writing code.

**Example:**
- Interview: User selected "server environment variables only" for API key handling
- Implementation: AI writes code with custom header overrides (not what user wanted!)

**Fix:** Two-part solution in `track-tool-use.py` and `enforce-interview.py`:

1. **track-tool-use.py** now captures:
   - The user's actual response from AskUserQuestion
   - Matches responses to option values
   - Stores decisions in categorized `decisions` dict (purpose, api_key_handling, etc.)

2. **enforce-interview.py** now injects a decision summary on EVERY write:
```
✅ Interview complete. REMEMBER THE USER'S DECISIONS:

• Primary Purpose: full_brand_kit
• API Key Handling: server_only
• Response Format: JSON with asset URLs
• Error Handling: detailed (error, code, details)

Your implementation MUST align with these choices.
```

This ensures the AI is constantly reminded of what the user actually wanted throughout the entire implementation phase.

## 🔧 Requirements

- **Node.js** 14.0.0 or higher
- **Python 3** (for enforcement hooks)
- **Claude Code** (CLI tool for Claude)
- **Project structure** with `.claude/commands/` support

## 🔌 MCP Servers

This package auto-configures two MCP servers:

### Context7
- **Live documentation lookup** from library source code
- **Current API parameters** (not outdated training data)
- **TypeScript type definitions** directly from packages

When you research a library like `@ai-sdk/core`, Context7 fetches the actual current documentation rather than relying on Claude's training data which may be outdated.

### GitHub
- **Issue management** - Read and create GitHub issues
- **Pull requests** - Create PRs with proper formatting
- **Repository access** - Browse repo contents and metadata

Required for `/pr` and `/issue` commands to work with GitHub MCP tools.

**Setup:** Set `GITHUB_PERSONAL_ACCESS_TOKEN` in your environment:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

The installer runs `claude mcp add` commands directly, which registers the servers in your Claude Code config (`~/.claude.json`). Restart Claude Code after installation for MCP tools to be available.

## 📖 Documentation

After installation, see:
- `.claude/commands/README.md` - Complete command reference
- `.claude/commands/api-create.md` - Full workflow details
- `.claude/commands/api-interview.md` - Interview questions
- `.claude/commands/api-research.md` - Research methodology

## 🤝 Contributing

This is the initial release. Feedback welcome!

**Ideas for improvement:**
- Additional interview questions
- More research sources
- Integration with other tools
- Custom templates
- Multi-language support

## 🙏 Acknowledgments

### @wbern/claude-instructions
The TDD workflow commands (`/red`, `/green`, `/refactor`, `/cycle`) are based on the excellent [@wbern/claude-instructions](https://github.com/wbern/claude-instructions) package by **William Bernmalm**. This project extends those patterns with interview-driven API development, research enforcement hooks, and comprehensive state tracking.

### Anthropic
The interview methodology is inspired by [Anthropic's Interviewer approach](https://www.anthropic.com/news/anthropic-interviewer) for structured discovery.

### Context7
Special thanks to the [Context7](https://context7.com) team for providing live documentation lookup that makes research-first development possible.

---

Thank you to the Claude Code community for making AI-assisted development more rigorous!

## 📄 License

MIT License - Use freely in your projects

## 🔗 Links

- **Repository:** https://github.com/hustle-together/api-dev-tools
- **Issues:** https://github.com/hustle-together/api-dev-tools/issues
- **NPM:** https://www.npmjs.com/package/@hustle-together/api-dev-tools

## 💬 Support

- Open an issue on GitHub
- Check command documentation in `.claude/commands/README.md`
- Review example workflows in the repository

---

**Made with ❤️ for API developers using Claude Code**

*"Interview first, test first, document always"*
