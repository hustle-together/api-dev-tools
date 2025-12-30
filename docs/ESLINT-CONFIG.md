# Type-Aware ESLint Configuration

ESLint configuration with TypeScript type information for catching type-related errors at lint time.

## Overview

Type-aware ESLint rules use TypeScript's type checker to catch errors that basic linting cannot:

- **Unsafe any usage** - Prevents `any` type from spreading
- **Floating promises** - Catches unhandled promises
- **Null assertions** - Flags unnecessary `!` operators
- **Type coercion** - Warns about implicit type conversions
- **Async patterns** - Validates async/await usage

## Quick Setup

```bash
# Install dependencies
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Configuration

### eslint.config.js (Flat Config - ESLint 9+)

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ===== TYPE SAFETY =====
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // ===== ASYNC PATTERNS =====
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      // ===== STRICT TYPES =====
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',

      // ===== CODE QUALITY =====
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
      }],
      '@typescript-eslint/consistent-type-exports': 'error',

      // ===== NAMING CONVENTIONS =====
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
      ],
    },
  },
  {
    // Disable type-aware rules for config files
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
```

### Legacy .eslintrc.js (ESLint 8)

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  rules: {
    // Same rules as flat config above
  },
};
```

## API-Specific Rules

For API development, add these rules:

```javascript
{
  rules: {
    // ===== ZOD SCHEMA VALIDATION =====
    // Ensure Zod schemas are properly typed
    '@typescript-eslint/no-unsafe-assignment': 'error',

    // ===== API RESPONSE TYPES =====
    // Prevent loose typing in API responses
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],

    // ===== ERROR HANDLING =====
    // Ensure errors are properly typed
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/prefer-promise-reject-errors': 'error',

    // ===== ASYNC API CALLS =====
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
  },
}
```

## React/Next.js Integration

For UI components:

```javascript
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // ... base config
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'warn',
    },
  },
);
```

## Performance Optimization

Type-aware linting can be slow. Optimize with:

### 1. Use Project References

```json
// tsconfig.json
{
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.test.json" }
  ]
}
```

### 2. Limit Files Checked

```javascript
{
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
  ],
}
```

### 3. Cache Results

```bash
eslint --cache --cache-location .eslintcache
```

### 4. Use Project Service (ESLint 9+)

```javascript
{
  languageOptions: {
    parserOptions: {
      projectService: true, // Faster than project array
    },
  },
}
```

## Common Issues

### "Parsing error: Cannot read tsconfig.json"

Ensure `tsconfigRootDir` points to project root:

```javascript
{
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname, // ESM
      // tsconfigRootDir: __dirname, // CommonJS
    },
  },
}
```

### Type-aware rules slow down linting

Use `TIMING=1` to identify slow rules:

```bash
TIMING=1 eslint .
```

Then consider disabling the slowest rules in development.

### False positives with third-party types

Add type declarations or use `@ts-expect-error`:

```typescript
// @ts-expect-error - Library types are incomplete
const result = thirdPartyFunction();
```

## Integration with Pre-commit

See [Pre-Commit Setup](./PRE-COMMIT-SETUP.md) for running ESLint in pre-commit hooks.

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings 0 --cache',
  ],
};
```

## See Also

- [Pre-Commit Setup](./PRE-COMMIT-SETUP.md)
- [TypeScript Best Practices](./TYPESCRIPT.md)
- [API Development Guide](./API-CREATE.md)
