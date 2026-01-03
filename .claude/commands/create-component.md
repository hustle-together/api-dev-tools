---
description: Create a new React component with tests and stories
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Task
argument-hint: <ComponentName>
---

# Create Component: $ARGUMENTS

## Context

- Existing components: !`ls -la src/components/ 2>/dev/null || echo "No components yet"`
- Design system: !`cat src/styles/tokens.ts 2>/dev/null | head -30 || echo "No tokens"`

## Workflow

1. **Check Registry** - Skip if component exists
2. **Research** - Component patterns, accessibility requirements
3. **Schema** - Define props interface
4. **TDD** - Test component behavior, implement, refactor
5. **Storybook** - Create stories for all states
6. **Visual QA** - Screenshot test with Playwright
7. **Docs** - Generate component documentation
8. **Verify** - Run tests, update registry

## File Structure

```
src/components/$ARGUMENTS/
├── $ARGUMENTS.tsx
├── $ARGUMENTS.test.tsx
├── $ARGUMENTS.stories.tsx
└── index.ts
```

Output <promise>COMPONENT_COMPLETE</promise> when finished.
