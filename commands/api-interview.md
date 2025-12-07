# API Interview - Structured API Discovery

**Usage:** `/api-interview [endpoint-name]`

**Purpose:** Conduct structured interview to understand API endpoint purpose, usage, and requirements before any implementation.

## Interview Methodology

Based on Anthropic Interviewer approach with three phases:

### Phase 1: Planning (Internal)
- Review endpoint name and context
- Identify key areas to explore
- Prepare follow-up questions

### Phase 2: Interviewing (User Interaction)
Ask structured questions to understand:

#### A. Purpose & Context
1. **What problem does this API endpoint solve?**
   - What's the business/technical need?
   - What happens without this endpoint?

2. **Who are the primary users?**
   - Frontend developers? End users? Other systems?
   - What's their technical level?

3. **What triggers usage of this API?**
   - User action? Scheduled task? Event-driven?
   - How frequently is it called?

#### B. Real-World Usage Scenarios
4. **Walk me through a typical request:**
   - What data does the user provide?
   - What do they expect back?
   - What happens with the response?

5. **What are the most common use cases?** (Ask for 3-5 examples)
   - Common scenario 1: ___
   - Common scenario 2: ___
   - Edge scenario: ___

6. **Show me an example request/response you envision:**
   - Request body/params
   - Expected response
   - Error cases

#### C. Technical Requirements
7. **What parameters are absolutely REQUIRED?**
   - Can the API work without them?
   - What happens if they're missing?

8. **What parameters are OPTIONAL?**
   - What defaults make sense?
   - How do they modify behavior?

9. **What are valid value ranges/formats?**
   - Type constraints (string, number, enum)?
   - Length/size limits?
   - Format requirements (email, URL, date)?

10. **Are there parameter dependencies?**
    - If X is provided, must Y also be provided?
    - Mutually exclusive options?

#### D. Dependencies & Integration
11. **What external services does this use?**
    - AI providers (OpenAI, Anthropic, Google)?
    - Third-party APIs (Firecrawl, Brave Search)?
    - Database (Supabase)?

12. **What API keys are required?**
    - Where are they configured?
    - Are there fallback options?
    - Can users provide their own keys?

13. **What AI models/providers are involved?**
    - Specific models (GPT-4, Claude Sonnet)?
    - Why those models?
    - Are there alternatives?

14. **Are there rate limits, quotas, or costs?**
    - Per-request costs?
    - Rate limiting needed?
    - Cost tracking required?

#### E. Error Handling & Edge Cases
15. **What can go wrong?**
    - Invalid input?
    - External service failures?
    - Timeout scenarios?

16. **How should errors be communicated?**
    - HTTP status codes?
    - Error message format?
    - User-facing vs. technical errors?

17. **What are boundary conditions?**
    - Very large inputs?
    - Empty/null values?
    - Concurrent requests?

18. **What should be validated before processing?**
    - Input validation rules?
    - Authentication/authorization?
    - Resource availability?

#### F. Documentation & Resources
19. **Where is official documentation?**
    - Link to external API docs
    - SDK documentation
    - Code examples

20. **Are there similar endpoints for reference?**
    - In this codebase?
    - In other projects?
    - Industry examples?

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

## 6. Real-World Scenarios
### Scenario 1: [Common Use Case]
**Request:**
```json
{example}
```
**Response:**
```json
{example}
```

## 7. Edge Cases & Error Handling
[Identified edge cases and how to handle them]

## 8. Validation Rules
[What must be validated]

## 9. Documentation Links
- [Official docs]
- [SDK docs]
- [Related resources]

## 10. Test Cases (To Implement)
- [ ] Test: [scenario from interview]
- [ ] Test: [edge case from interview]
- [ ] Test: [error handling from interview]

## 11. Open Questions
[Any ambiguities to resolve]
```

## Usage Example

```bash
/api-interview generate-css
```

I will then ask all 20 questions, document responses, and create the endpoint documentation file ready for TDD implementation.

<claude-commands-template>
## Interview Guidelines

1. **Ask ALL questions** - Don't skip steps even if obvious
2. **Request examples** - Concrete examples > abstract descriptions
3. **Clarify ambiguity** - If answer is unclear, ask follow-ups
4. **Document links** - Capture ALL external documentation URLs
5. **Real scenarios** - Focus on actual usage, not hypothetical
6. **Be thorough** - Better to over-document than under-document

## After Interview

- Read interview document before implementing
- Refer to it during TDD cycles
- Update it if requirements change
- Use it for code review context
</claude-commands-template>
