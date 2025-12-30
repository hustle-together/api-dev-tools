# Schema Lint Rules

Automated validation and linting for Zod schemas to ensure API consistency and type safety.

## Overview

Schema linting catches issues like:
- **Inconsistent naming** - snake_case vs camelCase
- **Missing descriptions** - Required for OpenAPI generation
- **Unsafe defaults** - Empty strings, null values
- **Type mismatches** - String dates vs Date objects
- **Missing error messages** - Custom error messages for validation

## Quick Setup

### 1. Create Schema Lint Rules

Create `eslint-plugin-zod-schema/index.js`:

```javascript
module.exports = {
  rules: {
    'require-description': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require description on all Zod schemas',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'z' &&
              !hasDescribe(node)
            ) {
              context.report({
                node,
                message: 'Zod schema should have .describe() for documentation',
              });
            }
          },
        };
      },
    },

    'consistent-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce consistent naming in schema keys',
        },
        schema: [
          {
            type: 'object',
            properties: {
              case: { enum: ['camelCase', 'snake_case'] },
            },
          },
        ],
      },
      create(context) {
        const caseType = context.options[0]?.case || 'camelCase';
        return {
          Property(node) {
            if (isZodObjectProperty(node)) {
              const name = node.key.name || node.key.value;
              if (!matchesCase(name, caseType)) {
                context.report({
                  node,
                  message: `Schema key '${name}' should be ${caseType}`,
                });
              }
            }
          },
        };
      },
    },

    'require-error-message': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require custom error messages on string validations',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (isStringValidation(node) && !hasErrorMessage(node)) {
              context.report({
                node,
                message: 'String validation should have custom error message',
              });
            }
          },
        };
      },
    },
  },
};
```

### 2. Add ESLint Configuration

```javascript
// eslint.config.js
import zodSchemaPlugin from './eslint-plugin-zod-schema';

export default [
  {
    plugins: {
      'zod-schema': zodSchemaPlugin,
    },
    rules: {
      'zod-schema/require-description': 'warn',
      'zod-schema/consistent-naming': ['error', { case: 'camelCase' }],
      'zod-schema/require-error-message': 'warn',
    },
  },
];
```

## Schema Best Practices

### 1. Always Add Descriptions

```typescript
// Bad
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Good
const userSchema = z.object({
  name: z.string().describe('User full name'),
  email: z.string().email().describe('User email address'),
}).describe('User profile data');
```

### 2. Use Branded Types for IDs

```typescript
// Bad - string IDs can be confused
const userId: string = '123';
const postId: string = '456';

// Good - branded types prevent mixing
const UserIdSchema = z.string().uuid().brand<'UserId'>();
const PostIdSchema = z.string().uuid().brand<'PostId'>();

type UserId = z.infer<typeof UserIdSchema>;
type PostId = z.infer<typeof PostIdSchema>;
```

### 3. Custom Error Messages

```typescript
// Bad - generic error
const emailSchema = z.string().email();

// Good - helpful error
const emailSchema = z.string()
  .email({ message: 'Please enter a valid email address' })
  .min(5, { message: 'Email is too short' })
  .max(254, { message: 'Email exceeds maximum length' });
```

### 4. Default Values

```typescript
// Bad - unsafe defaults
const configSchema = z.object({
  timeout: z.number().default(0), // 0 might cause issues
  apiKey: z.string().default(''), // Empty string is truthy
});

// Good - meaningful defaults
const configSchema = z.object({
  timeout: z.number().min(1).default(30000),
  apiKey: z.string().min(1).optional(), // Optional is clearer than ''
});
```

### 5. Strict Objects

```typescript
// Bad - allows extra properties (potential data leak)
const apiResponse = z.object({
  data: z.any(),
});

// Good - strict validation
const apiResponse = z.object({
  data: z.unknown(),
}).strict();
```

## Validation Script

Create `scripts/validate-schemas.ts`:

```typescript
import { glob } from 'glob';
import { z } from 'zod';
import path from 'path';

const SCHEMA_FILES = 'src/**/*.schema.ts';

interface ValidationResult {
  file: string;
  issues: string[];
}

async function validateSchemas(): Promise<void> {
  const files = await glob(SCHEMA_FILES);
  const results: ValidationResult[] = [];

  for (const file of files) {
    const issues: string[] = [];
    const module = await import(path.resolve(file));

    // Check each exported schema
    for (const [name, value] of Object.entries(module)) {
      if (value instanceof z.ZodType) {
        // Check for description
        if (!value.description) {
          issues.push(`${name}: Missing .describe()`);
        }

        // Check for empty defaults
        if (hasEmptyDefault(value)) {
          issues.push(`${name}: Has empty/zero default value`);
        }
      }
    }

    if (issues.length > 0) {
      results.push({ file, issues });
    }
  }

  // Report results
  if (results.length > 0) {
    console.error('\n❌ Schema Validation Failed:\n');
    for (const { file, issues } of results) {
      console.error(`\n${file}:`);
      for (const issue of issues) {
        console.error(`  - ${issue}`);
      }
    }
    process.exit(1);
  }

  console.log('✅ All schemas valid');
}

validateSchemas();
```

### Add to package.json

```json
{
  "scripts": {
    "validate:schemas": "tsx scripts/validate-schemas.ts",
    "lint:schemas": "eslint --ext .schema.ts src/"
  }
}
```

## Integration with Pre-commit

Add to `.lintstagedrc.js`:

```javascript
module.exports = {
  '*.schema.ts': [
    'eslint --fix --max-warnings 0',
    () => 'pnpm run validate:schemas',
  ],
};
```

## OpenAPI Generation

Properly documented schemas enable automatic OpenAPI generation:

```typescript
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const userSchema = z.object({
  id: z.string().uuid().openapi({ example: 'a1b2c3d4-...' }),
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
}).openapi('User');
```

## See Also

- [ESLint Configuration](./ESLINT-CONFIG.md)
- [API Create Workflow](./API-CREATE.md)
- [Pre-Commit Setup](./PRE-COMMIT-SETUP.md)
