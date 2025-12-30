# Security Audit & Dependency Management

Automated security scanning for dependencies and code to catch vulnerabilities early.

## Overview

Security auditing includes:
- **Dependency audit** - npm/pnpm audit for known vulnerabilities
- **License compliance** - Verify dependencies use approved licenses
- **Secret scanning** - Detect accidentally committed secrets
- **SAST** - Static Application Security Testing for code

## Quick Setup

### 1. Dependency Audit

```bash
# npm
npm audit --audit-level=high

# pnpm
pnpm audit --audit-level=high

# Yarn
yarn audit --level high
```

### 2. Add to CI

Create `.github/workflows/security.yml`:

```yaml
name: Security Audit

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  schedule:
    # Run weekly on Sundays
    - cron: '0 0 * * 0'

jobs:
  dependency-audit:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run audit
        run: pnpm audit --audit-level=high
        continue-on-error: true

      - name: Check for critical vulnerabilities
        run: |
          CRITICAL=$(pnpm audit --json | jq '.metadata.vulnerabilities.critical')
          HIGH=$(pnpm audit --json | jq '.metadata.vulnerabilities.high')
          if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            echo "::error::Found $CRITICAL critical and $HIGH high vulnerabilities"
            exit 1
          fi

  license-check:
    name: License Compliance
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check licenses
        run: npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0;Unlicense'

  secret-scan:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for secret scanning

      - name: Detect secrets
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  sast:
    name: Static Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/typescript
            p/react
```

## Pre-commit Integration

### Add to .husky/pre-push

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running security checks..."

# Dependency audit
pnpm audit --audit-level=high

# Secret scanning (if git-secrets installed)
if command -v git-secrets &> /dev/null; then
  git secrets --scan
fi
```

### Add to lint-staged

```javascript
// .lintstagedrc.js
module.exports = {
  '*': [
    () => 'pnpm audit --audit-level=high',
    () => 'git secrets --scan 2>/dev/null || true',
  ],
};
```

## Vulnerability Response

### Severity Levels

| Level | Action | Timeline |
|-------|--------|----------|
| Critical | Stop work, fix immediately | < 24 hours |
| High | Priority fix | < 1 week |
| Moderate | Plan fix | < 1 month |
| Low | Track in backlog | As convenient |

### Auto-fix with Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
    reviewers:
      - "team-leads"
    labels:
      - "dependencies"
      - "security"
```

## License Compliance

### Approved Licenses

```javascript
// .licensecheckrc
{
  "allowedLicenses": [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "CC0-1.0",
    "Unlicense",
    "0BSD"
  ],
  "excludePackages": [
    "@types/*"
  ]
}
```

### Check Command

```bash
npx license-checker --production --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0;Unlicense'
```

## Secret Patterns

### .gitleaks.toml

```toml
[allowlist]
description = "Allowlist for testing patterns"
paths = [
  '''\.test\.ts$''',
  '''\.spec\.ts$''',
  '''test/''',
  '''__tests__/''',
]

[[rules]]
description = "API Keys"
regex = '''(?i)(api[_-]?key|apikey|api[_-]?token)[\"']?\s*[:=]\s*[\"']([a-zA-Z0-9_\-]{20,})[\"']'''
tags = ["key", "API"]

[[rules]]
description = "Private Keys"
regex = '''-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----'''
tags = ["key", "private"]

[[rules]]
description = "JWT Tokens"
regex = '''eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+'''
tags = ["token", "JWT"]
```

## Integration with API Dev Tools

### Hook: Pre-Write Security Check

Add to `.claude/settings.json` PreToolUse:

```json
{
  "matcher": "Write|Edit",
  "hooks": [
    {
      "type": "command",
      "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/security-check.py"
    }
  ]
}
```

The hook checks for:
1. Hardcoded secrets in code
2. Insecure patterns (eval, innerHTML)
3. SQL injection vulnerabilities
4. XSS vulnerabilities

## Reporting

### Security Report Skill

```bash
# Generate security report
/security-report

# Output:
═══════════════════════════════════════════════════════
                 SECURITY REPORT
═══════════════════════════════════════════════════════
Last Scan: 2025-12-29 10:00:00

Dependencies:
  Total: 1,234
  Vulnerabilities: 0 critical, 2 high, 5 moderate

Licenses:
  Status: COMPLIANT
  Non-approved: 0

Secrets:
  Detected: 0
  Files scanned: 456

SAST:
  Issues: 3 warnings, 0 errors

Overall Status: ⚠️ REVIEW REQUIRED
═══════════════════════════════════════════════════════
```

## See Also

- [Pre-Commit Setup](./PRE-COMMIT-SETUP.md)
- [CI/CD Configuration](./CI-CD.md)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
