# API Create - Comprehensive API Development Workflow

**Usage:** `/api-create [endpoint-name]`

**Purpose:** Orchestrates the complete API development workflow using interview-driven, test-first methodology.

## Workflow Steps

This command executes the following phases automatically:

### Phase 1: Planning & Research
1. **Documentation Discovery**
   - Search for official API documentation
   - Track all documentation links
   - Identify available SDKs and libraries
   - Document version requirements

2. **User Interview** (Anthropic Interviewer methodology)
   - What is this API endpoint for? (Purpose)
   - Who will use it? (Users)
   - When/where will it be used? (Context)
   - What are common use cases? (Real-world scenarios)
   - What are edge cases to handle? (Boundaries)
   - What are dependencies? (External services, API keys)

### Phase 2: Documentation & Schema
3. **Schema Documentation**
   - Document ALL request parameters (required + optional)
   - Document ALL response fields
   - Create Zod request schema
   - Create Zod response schema
   - Document validation rules
   - Document error cases

4. **Environment Setup**
   - Identify required API keys
   - Check .env.example for keys
   - Verify environment variables
   - Document custom header support
   - Create setup instructions

### Phase 3: TDD Implementation
5. **Red Phase** - Write failing tests
   - Test basic success case
   - Test all parameter combinations
   - Test validation failures
   - Test error handling
   - Test edge cases from interview
   - Run tests (should fail)

6. **Green Phase** - Minimal implementation
   - Create route handler
   - Implement Zod validation
   - Add AI SDK integration
   - Pass all tests
   - Run tests (should pass)

7. **Refactor Phase** - Clean up
   - Extract reusable patterns
   - Improve error messages
   - Add JSDoc comments
   - Optimize performance
   - Run tests (should still pass)

### Phase 4: Documentation & Integration
8. **Update Documentation**
   - Add to `/src/app/api-test/api-tests-manifest.json`
   - Update `/src/v2/docs/v2-api-implementation-status.md`
   - Add OpenAPI spec to `/src/lib/openapi/`
   - Include code examples
   - Document real-world outputs
   - Add testing notes

9. **Final Validation**
   - Run full test suite
   - Check test coverage (must be 100%)
   - Verify TypeScript compilation
   - Test in API test interface
   - Create commit with `/commit`

## Template for Interview

When executing this command, conduct the following interview:

```
## API Endpoint: [endpoint-name]

### 1. Purpose & Context
- **What problem does this solve?**
- **Who are the primary users?**
- **What triggers usage of this API?**

### 2. Real-World Usage
- **Describe a typical request scenario:**
- **What are the most common parameters?**
- **What does a successful response look like?**

### 3. Parameters & Configuration
- **What parameters are REQUIRED?**
- **What parameters are OPTIONAL?**
- **What are valid value ranges/formats?**
- **Are there parameter dependencies?**

### 4. Dependencies & Integration
- **What external services does this use?**
- **What API keys are required?**
- **What AI models/providers are involved?**
- **Are there rate limits or quotas?**

### 5. Edge Cases & Errors
- **What can go wrong?**
- **How should errors be handled?**
- **What are boundary conditions?**
- **What should be validated?**

### 6. Documentation Sources
- **Official documentation links:**
- **SDK/library documentation:**
- **Related endpoints or examples:**
```

## Output Artifacts

This command creates:

1. **Interview Document**: `/src/v2/docs/endpoints/[endpoint-name].md`
2. **Route Handler**: `/src/app/api/v2/[endpoint-name]/route.ts`
3. **Test Suite**: `/src/app/api/v2/[endpoint-name]/__tests__/[endpoint-name].api.test.ts`
4. **OpenAPI Spec**: `/src/lib/openapi/endpoints/[endpoint-name].ts`
5. **Updated Manifests**:
   - `/src/app/api-test/api-tests-manifest.json`
   - `/src/v2/docs/v2-api-implementation-status.md`

## Execution

Execute this command and I will:
1. ✅ Start the interview to understand the endpoint
2. ✅ Research and document all available options
3. ✅ Create comprehensive Zod schemas
4. ✅ Verify environment/API key requirements
5. ✅ Write failing tests first (TDD Red)
6. ✅ Implement minimal passing code (TDD Green)
7. ✅ Refactor for quality (TDD Refactor)
8. ✅ Update all documentation and manifests
9. ✅ Verify 100% test coverage
10. ✅ Create semantic commit

<claude-commands-template>
## Project-Specific Rules

1. **API Location**: All V2 APIs go in `/src/app/api/v2/[endpoint-name]/`
2. **Testing**: Use Vitest, require 100% coverage
3. **Validation**: All requests/responses use Zod schemas
4. **AI SDK**: Use Vercel AI SDK 5.0.11 patterns from `/src/v2/docs/ai-sdk-catalog.json`
5. **Package Manager**: Use `pnpm` for all operations
6. **Documentation**: Follow patterns in `/src/v2/docs/Main Doc – V2 Development Patterns.md`
7. **API Keys**: Support three methods (env, NEXT_PUBLIC_, custom headers)
8. **Test Command**: `pnpm test:run` before commits

## Never Skip
- Interview phase (understand before coding)
- Documentation research (find ALL parameters)
- Failing tests first (TDD Red is mandatory)
- Manifest updates (keep docs in sync)
- Coverage verification (100% required)
</claude-commands-template>
