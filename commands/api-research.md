# API Research - Documentation Discovery & Schema Extraction

**Usage:** `/api-research [library-or-service-name]`

**Purpose:** Automatically research external APIs, SDKs, and libraries to discover ALL available parameters, options, and features.

## What This Command Does

1. **Searches for Official Documentation**
   - Official API docs
   - SDK/library documentation
   - GitHub repositories
   - npm package pages (if applicable)

2. **Extracts Complete Schemas**
   - All request parameters (required + optional)
   - All response fields
   - Type definitions
   - Validation rules
   - Default values

3. **Discovers Hidden Features**
   - Undocumented parameters (from source code)
   - Advanced configuration options
   - Beta/experimental features
   - Deprecated options to avoid

4. **Documents Integration Requirements**
   - Required environment variables
   - API key setup
   - Rate limits and quotas
   - Pricing/cost information
   - Version compatibility

## Research Process

### Step 1: Find Official Sources
```
- Web search for "[library-name] documentation"
- Check npm registry for package info
- Find GitHub repository
- Look for TypeScript definitions
- Search for community resources
```

### Step 2: Deep Dive into Documentation
```
- Read API reference pages
- Review SDK documentation
- Check TypeScript type definitions (.d.ts files)
- Look at example code
- Find changelog for recent changes
```

### Step 3: Source Code Analysis
```
- Review actual implementation code
- Check for undocumented parameters
- Find default values in source
- Identify validation logic
- Discover error cases
```

### Step 4: Test & Verify
```
- Check what parameters are actually used
- Verify parameter names and types
- Test edge cases
- Document observed behavior
```

## Output Format

Creates: `/src/v2/docs/research/[library-name].md`

```markdown
# Research: [Library/Service Name]

**Date:** [current-date]
**Version:** [version-number]
**Status:** Research Complete

## 1. Official Documentation Links
- Main docs: [URL]
- API reference: [URL]
- GitHub repo: [URL]
- npm package: [URL]
- TypeScript types: [URL]

## 2. Installation & Setup
### Installation
```bash
[installation command]
```

### Environment Variables
```env
[required env vars]
```

### API Key Setup
[How to obtain and configure]

## 3. Complete Request Schema
### Required Parameters
| Parameter | Type | Description | Validation |
|-----------|------|-------------|------------|
| [name] | [type] | [desc] | [rules] |

### Optional Parameters
| Parameter | Type | Default | Description | Notes |
|-----------|------|---------|-------------|-------|
| [name] | [type] | [default] | [desc] | [notes] |

### Zod Schema (Preliminary)
```typescript
const RequestSchema = z.object({
  // Required
  requiredParam: z.string().min(1),

  // Optional with defaults
  optionalParam: z.string().default('default-value'),

  // Enums
  mode: z.enum(['option1', 'option2']).default('option1'),

  // Nested objects
  config: z.object({
    setting: z.boolean().default(true),
  }).optional(),
});
```

## 4. Complete Response Schema
### Success Response
```typescript
interface SuccessResponse {
  [field]: [type]; // [description]
}
```

### Error Response
```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
```

### Zod Schema (Preliminary)
```typescript
const ResponseSchema = z.object({
  // Response fields
});
```

## 5. Features & Capabilities
### Core Features
- [Feature 1]: [description]
- [Feature 2]: [description]

### Advanced Features
- [Advanced 1]: [description + how to enable]
- [Advanced 2]: [description + how to enable]

### Experimental/Beta Features
- [Beta feature]: [description + stability notes]

## 6. Limitations & Constraints
- Rate limits: [details]
- Size limits: [details]
- Timeout: [details]
- Quotas: [details]
- Costs: [details]

## 7. Integration Notes
### Vercel AI SDK Integration
[If using AI SDK, document integration patterns]

### Error Handling
[Common errors and how to handle]

### Best Practices
- [Practice 1]
- [Practice 2]

## 8. Code Examples
### Basic Usage
```typescript
[minimal example]
```

### Advanced Usage
```typescript
[example with optional parameters]
```

### Error Handling
```typescript
[example with try/catch]
```

## 9. Testing Considerations
- [ ] Test basic success case
- [ ] Test all optional parameters
- [ ] Test validation failures
- [ ] Test rate limiting
- [ ] Test timeout scenarios
- [ ] Test error responses

## 10. Version History & Changes
[Notable changes in recent versions]

## 11. Related Resources
- [Community examples]
- [Blog posts]
- [Stack Overflow discussions]
- [Alternative libraries]
```

## Usage Examples

### Research an AI SDK
```bash
/api-research vercel-ai-sdk-generateText
```

### Research an External API
```bash
/api-research firecrawl-api
```

### Research a Library
```bash
/api-research anthropic-sdk
```

## Research Workflow

1. **Execute command**: `/api-research [name]`
2. **I search and analyze**: Web search → Documentation → Source code
3. **Document everything**: Create comprehensive research doc
4. **Review together**: You verify accuracy and completeness
5. **Use in implementation**: Reference during TDD cycle

## Why This Matters

Without thorough research:
- ❌ Miss optional parameters that users need
- ❌ Don't test edge cases properly
- ❌ Implement wrong validation rules
- ❌ Create brittle integrations

With thorough research:
- ✅ Know ALL available options
- ✅ Test comprehensively
- ✅ Proper validation
- ✅ Robust implementation
- ✅ Better documentation

---

## Research-First Schema Design (MANDATORY)

### The Anti-Pattern: Schema-First Development

**NEVER DO THIS:**
- ❌ Define interfaces based on assumptions before researching
- ❌ Rely on training data for API capabilities
- ❌ Say "I think it supports..." without verification
- ❌ Build schemas from memory instead of documentation

**Real Example of Failure:**
- User asked: "What providers does Vercel AI Gateway support?"
- AI answered from memory: "Groq not in gateway"
- Reality: Groq has 4 models in the gateway (Llama variants)
- Root cause: No research was done before answering

### The Correct Pattern: Research-First

**ALWAYS DO THIS:**

**Step 1: Research the Source of Truth**
- Use Context7 (`mcp__context7__resolve-library-id` + `get-library-docs`) for SDK docs
- Use WebSearch for official provider documentation
- Query APIs directly when possible (don't assume)
- Check GitHub repositories for current implementation

**Step 2: Build Schema FROM Research**
- Interface fields emerge from discovered capabilities
- Every field has a source (docs, SDK types, API response)
- Don't guess - verify each capability
- Document where each field came from

**Step 3: Verify with Actual Calls**
- Test capabilities before marking them supported
- Investigate skipped tests - they're bugs, not features
- No "should work" - prove it works
- All tests must pass, not be skipped

### Mandatory Checklist Before Answering ANY External API Question

Before responding to questions about APIs, SDKs, or external services:

```
[ ] Did I use Context7 to get current documentation?
[ ] Did I use WebSearch for official docs?
[ ] Did I verify the information is current (not training data)?
[ ] Am I stating facts from research, not memory?
[ ] Have I cited my sources?
```

### Research Query Tracking

All research is now tracked in `.claude/api-dev-state.json`:

```json
{
  "research_queries": [
    {
      "timestamp": "2025-12-07T...",
      "tool": "WebSearch",
      "query": "Vercel AI Gateway Groq providers",
      "terms": ["vercel", "gateway", "groq", "providers"]
    },
    {
      "timestamp": "2025-12-07T...",
      "tool": "mcp__context7__get-library-docs",
      "library": "@ai-sdk/gateway",
      "terms": ["@ai-sdk/gateway"]
    }
  ]
}
```

This allows verification that specific topics were actually researched before answering.

<claude-commands-template>
## Research Guidelines

1. **Read actual code** - TypeScript definitions reveal truth
2. **Test assumptions** - Verify parameters actually work
3. **Document sources** - Track ALL links for future reference
4. **Check versions** - Note version-specific features
5. **Find examples** - Real code > documentation
6. **Look for gotchas** - Common mistakes, limitations, bugs

## Integration with API Development

After research:
- Use in `/api-interview` to ask informed questions
- Reference in `/api-create` for schema creation
- Base tests on discovered parameters
- Update if API changes
</claude-commands-template>
