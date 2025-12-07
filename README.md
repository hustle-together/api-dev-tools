# API Development Tools for Claude Code

**Interview-driven, research-first API development workflow**

Automates the complete API development lifecycle from understanding requirements to deployment through structured interviews, deep research, test-driven development, and comprehensive documentation.

## 🚀 Quick Start

```bash
# Install in your project
npx @mirror-factory/api-dev-tools --scope=project

# Start developing an API
/api-create my-endpoint
```

## 📦 What This Installs

Five powerful slash commands for Claude Code:

- **`/api-create [endpoint]`** - Complete automated workflow (Interview → Research → TDD → Docs)
- **`/api-interview [endpoint]`** - Structured 20-question interview about purpose and usage
- **`/api-research [library]`** - Deep research of external APIs/SDKs (finds ALL parameters)
- **`/api-env [endpoint]`** - Check required API keys and environment setup
- **`/api-status [endpoint]`** - Track implementation progress and phase completion

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
npx @mirror-factory/api-dev-tools --scope=project
```

### Team-Wide Auto-Installation

Add to your project's `package.json`:
```json
{
  "scripts": {
    "postinstall": "npx @mirror-factory/api-dev-tools --scope=project"
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

## 🔧 Requirements

- **Node.js** 14.0.0 or higher
- **Claude Code** (CLI tool for Claude)
- **Project structure** with `.claude/commands/` support

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

## 📄 License

MIT License - Use freely in your projects

## 🔗 Links

- **Repository:** https://github.com/mirror-factory/api-dev-tools
- **Issues:** https://github.com/mirror-factory/api-dev-tools/issues
- **NPM:** https://www.npmjs.com/package/@mirror-factory/api-dev-tools

## 💬 Support

- Open an issue on GitHub
- Check command documentation in `.claude/commands/README.md`
- Review example workflows in the repository

---

**Made with ❤️ for API developers using Claude Code**

*"Interview first, test first, document always"*
