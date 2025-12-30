# Pre-Commit Hooks Setup

Automated quality checks that run before every commit to catch issues early.

## Overview

Pre-commit hooks ensure code quality by running:
- **Linting** - ESLint with type-aware rules
- **Formatting** - Prettier for consistent style
- **Type checking** - TypeScript compiler
- **Tests** - Related unit tests for changed files
- **Security** - Secret detection and dependency audit

## Quick Setup

```bash
# 1. Install dependencies
pnpm add -D husky lint-staged

# 2. Initialize husky
pnpm exec husky init

# 3. Configure pre-commit hook
echo 'pnpm lint-staged' > .husky/pre-commit
```

## Configuration

### lint-staged Configuration

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

### Advanced Configuration (with Type Checking)

Create `.lintstagedrc.js` for more control:

```javascript
module.exports = {
  // TypeScript files - full pipeline
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    () => 'tsc --noEmit', // Type check entire project
  ],

  // JavaScript files
  '*.{js,jsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
  ],

  // Test files - run related tests
  '*.test.{ts,tsx,js,jsx}': [
    'vitest related --run',
  ],

  // Schema files - validate
  '*.schema.ts': [
    'eslint --fix',
    () => 'pnpm run validate:schemas',
  ],

  // JSON/Config files
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],

  // Secret detection
  '*': [
    () => 'git secrets --scan',
  ],
};
```

## Husky Hooks

### pre-commit (Required)

`.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged
pnpm lint-staged

# Check for secrets
git secrets --scan 2>/dev/null || true
```

### commit-msg (Recommended)

`.husky/commit-msg`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate commit message format
npx --no -- commitlint --edit "$1"
```

### pre-push (Recommended)

`.husky/pre-push`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run full test suite before push
pnpm test

# Check for dependency vulnerabilities
pnpm audit --audit-level=high
```

## Integration with API Dev Tools

### Phase 8 (TDD Red) Hook

Add to `.claude/settings.json` PostToolUse hooks:

```json
{
  "matcher": "Write|Edit",
  "hooks": [
    {
      "type": "command",
      "command": "pnpm lint-staged --quiet"
    }
  ]
}
```

This ensures all code written during TDD cycles is automatically formatted and linted.

### CI/CD Integration

Add to your CI workflow:

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Security audit
        run: pnpm audit --audit-level=high
```

## Secret Detection

### Setup git-secrets

```bash
# macOS
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets && make install

# Configure
git secrets --install
git secrets --register-aws
```

### Custom Secret Patterns

Add to `.gitconfig` or run:

```bash
# Block API keys
git secrets --add 'sk_live_[a-zA-Z0-9]{24,}'
git secrets --add 'pk_live_[a-zA-Z0-9]{24,}'

# Block common secret patterns
git secrets --add 'password\s*=\s*["\047][^\047"]{8,}'
git secrets --add 'api_key\s*=\s*["\047][^\047"]{8,}'
```

## Troubleshooting

### Hook Not Running

```bash
# Verify hook is executable
chmod +x .husky/pre-commit

# Reinstall husky
rm -rf .husky
pnpm exec husky init
echo 'pnpm lint-staged' > .husky/pre-commit
```

### Slow Pre-commit

1. Use `--concurrent` in lint-staged
2. Cache ESLint results: `eslint --cache`
3. Only type-check changed files (advanced)

### Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit (use sparingly!)
git commit --no-verify -m "emergency fix"
```

## Best Practices

1. **Never skip hooks in CI** - If it passes locally, it should pass in CI
2. **Keep hooks fast** - Under 10 seconds for pre-commit
3. **Fail loudly** - Use `--max-warnings 0` to treat warnings as errors
4. **Test the hooks** - Run `pnpm lint-staged` manually after setup
5. **Document exceptions** - If bypassing, add TODO to fix later

## See Also

- [ESLint Configuration](./ESLINT-CONFIG.md)
- [Security Best Practices](./SECURITY.md)
- [CI/CD Setup](./CI-CD.md)
