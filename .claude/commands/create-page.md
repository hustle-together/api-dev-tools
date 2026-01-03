---
description: Create a new page with routing and data fetching
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Task
argument-hint: <page-path>
---

# Create Page: $ARGUMENTS

## Context

- Existing pages: !`find src/app -name "page.tsx" 2>/dev/null`
- Available components: !`cat .devkit/registry.json 2>/dev/null | jq '.artifacts.components[].name' || echo "[]"`
- Available APIs: !`cat .devkit/registry.json 2>/dev/null | jq '.artifacts.apis[].name' || echo "[]"`

## Workflow

1. **Check Registry** - Skip if page exists
2. **Research** - Next.js App Router patterns, data fetching
3. **Interview** - Confirm layout, data requirements, SEO
4. **Schema** - Define page props, metadata
5. **TDD** - Test page behavior
6. **Integration** - Connect to APIs, use components from registry
7. **Visual QA** - Multi-viewport screenshot testing
8. **Verify** - Update registry

Output <promise>PAGE_COMPLETE</promise> when finished.
