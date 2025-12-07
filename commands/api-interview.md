# API Interview - Research-Based Structured Discovery

**Usage:** `/api-interview [endpoint-name]`

**Purpose:** Conduct structured interview with MULTIPLE-CHOICE questions derived from research findings to understand API endpoint purpose, usage, and requirements before any implementation.

## v1.8.0 REQUIREMENT: Structured Questions with Options

**CRITICAL:** All interview questions MUST:
1. Be based on COMPLETED research (Context7 + WebSearch)
2. Use AskUserQuestion tool with the `options` parameter
3. Provide multiple-choice selections derived from research findings
4. Include a "Type something else..." option for custom input

**Example of CORRECT structured question:**
```
AskUserQuestion(
  question="Which AI provider should this endpoint support?",
  options=[
    {"value": "openai", "label": "OpenAI (GPT-4o, GPT-4-turbo)"},
    {"value": "anthropic", "label": "Anthropic (Claude Sonnet, Opus)"},
    {"value": "google", "label": "Google (Gemini Pro, Flash)"},
    {"value": "all", "label": "All providers (multi-provider support)"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

This gives users clear choices from RESEARCHED capabilities, not guesses.

## Interview Methodology

Based on Anthropic Interviewer approach with three phases:

### Phase 0: PREREQUISITE - Research (MANDATORY)
**You CANNOT start the interview until research is complete.**

Before asking ANY questions:
1. Use Context7 to get SDK/API documentation
2. Use WebSearch (2-3 searches) for official docs
3. Gather all available options, parameters, models, providers
4. Build your question options FROM this research

Example research flow:
```
1. mcp__context7__resolve-library-id("vercel ai sdk")
2. mcp__context7__get-library-docs(libraryId)
3. WebSearch("Vercel AI SDK providers models 2025")
4. WebSearch("Vercel AI SDK streaming options parameters")
```

**Research informs options. No research = no good options = interview blocked.**

### Phase 1: Planning (Internal)
- Review endpoint name and context
- Review research findings (what providers, models, parameters exist?)
- Build structured question options from research
- Prepare follow-up questions

### Phase 2: Interviewing (User Interaction with Structured Options)

**EVERY question uses AskUserQuestion with options parameter.**

#### A. Purpose & Context

**Question 1: Primary Purpose**
```
AskUserQuestion(
  question="What is the primary purpose of this endpoint?",
  options=[
    {"value": "data_retrieval", "label": "Retrieve/query data"},
    {"value": "data_transform", "label": "Transform/process data"},
    {"value": "ai_generation", "label": "AI content generation"},
    {"value": "ai_analysis", "label": "AI analysis/classification"},
    {"value": "integration", "label": "Third-party integration"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

**Question 2: Primary Users**
```
AskUserQuestion(
  question="Who are the primary users of this endpoint?",
  options=[
    {"value": "frontend", "label": "Frontend developers (React, Vue, etc.)"},
    {"value": "backend", "label": "Backend services (server-to-server)"},
    {"value": "mobile", "label": "Mobile app developers"},
    {"value": "enduser", "label": "End users directly (browser)"},
    {"value": "automation", "label": "Automated systems/bots"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

**Question 3: Usage Trigger**
```
AskUserQuestion(
  question="What triggers a call to this endpoint?",
  options=[
    {"value": "user_action", "label": "User action (button click, form submit)"},
    {"value": "page_load", "label": "Page/component load"},
    {"value": "scheduled", "label": "Scheduled/cron job"},
    {"value": "webhook", "label": "External webhook/event"},
    {"value": "realtime", "label": "Real-time/streaming updates"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

#### B. Technical Requirements (Research-Based Options)

**Question 4: AI Provider** (options from research)
```
AskUserQuestion(
  question="Which AI provider(s) should this endpoint support?",
  options=[
    // These options come from your Context7/WebSearch research!
    {"value": "openai", "label": "OpenAI (gpt-4o, gpt-4-turbo)"},
    {"value": "anthropic", "label": "Anthropic (claude-sonnet-4-20250514, claude-opus-4-20250514)"},
    {"value": "google", "label": "Google (gemini-pro, gemini-flash)"},
    {"value": "groq", "label": "Groq (llama-3.1-70b, mixtral)"},
    {"value": "multiple", "label": "Multiple providers (configurable)"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

**Question 5: Response Format** (options from research)
```
AskUserQuestion(
  question="What response format is needed?",
  options=[
    // Options based on what the SDK supports (from research)
    {"value": "streaming", "label": "Streaming (real-time chunks)"},
    {"value": "complete", "label": "Complete response (wait for full)"},
    {"value": "structured", "label": "Structured/JSON mode"},
    {"value": "tool_calls", "label": "Tool calling/function calls"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

**Question 6: Required Parameters**
```
AskUserQuestion(
  question="Which parameters are REQUIRED (cannot work without)?",
  options=[
    // Based on researched SDK parameters
    {"value": "prompt_only", "label": "Just the prompt/message"},
    {"value": "prompt_model", "label": "Prompt + model selection"},
    {"value": "prompt_model_config", "label": "Prompt + model + configuration"},
    {"value": "full_config", "label": "Full configuration required"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

**Question 7: Optional Parameters**
```
AskUserQuestion(
  question="Which optional parameters should be supported?",
  options=[
    // From research: discovered optional parameters
    {"value": "temperature", "label": "temperature (creativity control)"},
    {"value": "max_tokens", "label": "maxTokens (response length)"},
    {"value": "system_prompt", "label": "system (system prompt)"},
    {"value": "tools", "label": "tools (function calling)"},
    {"value": "all_standard", "label": "All standard AI parameters"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

#### C. Dependencies & Integration

**Question 8: External Services**
```
AskUserQuestion(
  question="What external services does this endpoint need?",
  options=[
    {"value": "ai_only", "label": "AI provider only (OpenAI, Anthropic, etc.)"},
    {"value": "ai_search", "label": "AI + Search (Brave, Perplexity)"},
    {"value": "ai_scrape", "label": "AI + Web scraping (Firecrawl)"},
    {"value": "ai_db", "label": "AI + Database (Supabase)"},
    {"value": "multiple", "label": "Multiple external services"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

**Question 9: API Key Handling**
```
AskUserQuestion(
  question="How should API keys be handled?",
  options=[
    {"value": "server_only", "label": "Server environment variables only"},
    {"value": "server_header", "label": "Server env + custom header override"},
    {"value": "client_next", "label": "NEXT_PUBLIC_ client-side keys"},
    {"value": "all_methods", "label": "All methods (env, header, client)"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

#### D. Error Handling & Edge Cases

**Question 10: Error Response Format**
```
AskUserQuestion(
  question="How should errors be returned?",
  options=[
    {"value": "simple", "label": "Simple: {error: string}"},
    {"value": "detailed", "label": "Detailed: {error, code, details}"},
    {"value": "ai_sdk", "label": "AI SDK standard format"},
    {"value": "http_native", "label": "HTTP status codes + body"},
    {"value": "custom", "label": "Type something else..."}
  ]
)
```

### Phase 3: Analysis (Documentation)
After interview, I will:
- Synthesize answers into structured document
- Identify gaps or ambiguities
- Create preliminary schema based on answers
- Document all external links and resources
- Outline test cases from real-world scenarios

## Output

Creates: `/src/v2/docs/endpoints/[endpoint-name].md`

**Document Structure:**
```markdown
# API Endpoint: [endpoint-name]

**Date:** [current-date]
**Interviewed by:** Claude Code
**Status:** Interview Complete
**Research Sources:** [list of Context7/WebSearch sources]

## 1. Purpose & Context
[Synthesized understanding of why this exists]

## 2. Users & Usage Patterns
[Who uses it and how]

## 3. Request Schema (Preliminary)
[Zod-style schema based on interview]

## 4. Response Schema (Preliminary)
[Expected response structure]

## 5. Dependencies
- External Services: [list]
- API Keys Required: [list]
- AI Models: [list]

## 6. Interview Responses
| Question | User Selection | Notes |
|----------|---------------|-------|
| Purpose | [selected option] | |
| Users | [selected option] | |
| ... | ... | |

## 7. Real-World Scenarios
### Scenario 1: [Common Use Case]
**Request:**
```json
{example}
```
**Response:**
```json
{example}
```

## 8. Edge Cases & Error Handling
[Identified edge cases and how to handle them]

## 9. Validation Rules
[What must be validated]

## 10. Documentation Links
- [Official docs from research]
- [SDK docs from Context7]
- [Related resources from WebSearch]

## 11. Test Cases (To Implement)
- [ ] Test: [scenario from interview]
- [ ] Test: [edge case from interview]
- [ ] Test: [error handling from interview]

## 12. Open Questions
[Any ambiguities to resolve]
```

## Usage Example

```bash
/api-interview generate-css
```

I will:
1. First complete research (Context7 + WebSearch)
2. Build structured questions with options from research
3. Ask all questions using AskUserQuestion with options
4. Document responses and create the endpoint documentation

<claude-commands-template>
## Interview Guidelines (v1.8.0)

1. **RESEARCH FIRST** - Complete Context7 + WebSearch before ANY questions
2. **STRUCTURED OPTIONS** - Every question uses AskUserQuestion with options[]
3. **OPTIONS FROM RESEARCH** - Multiple-choice options come from discovered capabilities
4. **ALWAYS INCLUDE "Type something else..."** - Let user provide custom input
5. **ASK ONE AT A TIME** - Wait for response before next question
6. **DOCUMENT EVERYTHING** - Capture ALL selections and custom inputs

## Question Format Checklist

Before asking each question:
- [ ] Is research complete?
- [ ] Are options based on research findings?
- [ ] Does it use AskUserQuestion with options parameter?
- [ ] Is there a "Type something else..." option?
- [ ] Will this help build the schema?

## After Interview

- Read interview document before implementing
- Refer to it during TDD cycles
- Update it if requirements change
- Use it for code review context
</claude-commands-template>
