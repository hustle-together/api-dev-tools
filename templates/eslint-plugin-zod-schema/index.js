/**
 * ESLint Plugin for Zod Schema Linting
 *
 * Enforces best practices for Zod schemas:
 * - require-description: All schemas should have .describe()
 * - consistent-naming: Keys should follow naming convention
 * - require-error-message: String validations should have error messages
 * - no-unsafe-defaults: Avoid empty/zero defaults
 * - prefer-strict: Objects should use .strict()
 *
 * Installation:
 *   1. Copy this to your project's eslint-plugin-zod-schema/index.js
 *   2. Add to eslint.config.js (see bottom of file)
 *
 * @version 1.0.0
 * @see docs/SCHEMA-LINT.md
 */

// Helper: Check if node is a Zod method call
function isZodCall(node) {
  if (node.type !== 'CallExpression') return false;

  // Check for z.string(), z.object(), etc.
  if (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.name === 'z'
  ) {
    return true;
  }

  // Check for chained calls like z.string().email()
  if (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'CallExpression'
  ) {
    return isZodCall(node.callee.object);
  }

  return false;
}

// Helper: Check if chain has .describe()
function hasDescribe(node) {
  let current = node;
  while (current) {
    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'MemberExpression' &&
      current.callee.property.name === 'describe'
    ) {
      return true;
    }
    // Move up the chain
    if (current.callee && current.callee.object) {
      current = current.callee.object;
    } else {
      break;
    }
  }
  return false;
}

// Helper: Check naming convention
function matchesCase(name, caseType) {
  if (caseType === 'camelCase') {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }
  if (caseType === 'snake_case') {
    return /^[a-z][a-z0-9_]*$/.test(name);
  }
  return true;
}

// Helper: Check if node is inside z.object()
function isInsideZodObject(node, context) {
  const ancestors = context.getAncestors();
  return ancestors.some(
    (ancestor) =>
      ancestor.type === 'CallExpression' &&
      ancestor.callee.type === 'MemberExpression' &&
      ancestor.callee.object.name === 'z' &&
      ancestor.callee.property.name === 'object'
  );
}

// Helper: Check if string validation has error message
function hasErrorMessage(node) {
  // Check for { message: '...' } in validation call
  if (node.arguments && node.arguments.length > 0) {
    const lastArg = node.arguments[node.arguments.length - 1];
    if (lastArg.type === 'ObjectExpression') {
      return lastArg.properties.some(
        (prop) => prop.key && prop.key.name === 'message'
      );
    }
    // Some validations accept message as string directly
    if (lastArg.type === 'Literal' && typeof lastArg.value === 'string') {
      return true;
    }
  }
  return false;
}

// Helper: Check for unsafe defaults
function isUnsafeDefault(node) {
  if (
    node.callee.type === 'MemberExpression' &&
    node.callee.property.name === 'default'
  ) {
    const defaultArg = node.arguments[0];
    if (!defaultArg) return true; // No argument is unsafe

    // Empty string
    if (defaultArg.type === 'Literal' && defaultArg.value === '') {
      return true;
    }
    // Zero for numbers (might be intentional, but warn)
    if (defaultArg.type === 'Literal' && defaultArg.value === 0) {
      return true;
    }
    // null
    if (defaultArg.type === 'Literal' && defaultArg.value === null) {
      return true;
    }
    // Empty array
    if (
      defaultArg.type === 'ArrayExpression' &&
      defaultArg.elements.length === 0
    ) {
      return true;
    }
    // Empty object
    if (
      defaultArg.type === 'ObjectExpression' &&
      defaultArg.properties.length === 0
    ) {
      return true;
    }
  }
  return false;
}

// String validation methods that should have error messages
const STRING_VALIDATIONS = [
  'email',
  'url',
  'uuid',
  'cuid',
  'regex',
  'min',
  'max',
  'length',
  'startsWith',
  'endsWith',
  'includes',
];

module.exports = {
  meta: {
    name: 'eslint-plugin-zod-schema',
    version: '1.0.0',
  },
  rules: {
    /**
     * Require .describe() on all Zod schemas
     */
    'require-description': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require .describe() on Zod schemas for documentation',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          missingDescribe:
            'Zod schema should have .describe() for documentation and OpenAPI generation',
        },
        schema: [],
      },
      create(context) {
        return {
          VariableDeclarator(node) {
            // Only check schemas (variables ending with Schema or containing schema)
            const varName = node.id.name || '';
            if (
              !varName.toLowerCase().includes('schema') &&
              !varName.endsWith('Schema')
            ) {
              return;
            }

            if (node.init && isZodCall(node.init) && !hasDescribe(node.init)) {
              context.report({
                node: node.init,
                messageId: 'missingDescribe',
              });
            }
          },
        };
      },
    },

    /**
     * Enforce consistent naming in z.object() keys
     */
    'consistent-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce consistent naming convention in schema keys',
          category: 'Stylistic Issues',
          recommended: true,
        },
        messages: {
          inconsistentCase: "Schema key '{{name}}' should be {{case}}",
        },
        schema: [
          {
            type: 'object',
            properties: {
              case: {
                enum: ['camelCase', 'snake_case'],
                default: 'camelCase',
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const caseType = options.case || 'camelCase';

        return {
          Property(node) {
            // Only check inside z.object()
            if (!isInsideZodObject(node, context)) {
              return;
            }

            const keyName = node.key.name || node.key.value;
            if (keyName && !matchesCase(keyName, caseType)) {
              context.report({
                node: node.key,
                messageId: 'inconsistentCase',
                data: {
                  name: keyName,
                  case: caseType,
                },
              });
            }
          },
        };
      },
    },

    /**
     * Require custom error messages on string validations
     */
    'require-error-message': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Require custom error messages on string validation methods',
          category: 'Best Practices',
          recommended: false,
        },
        messages: {
          missingErrorMessage:
            "String validation '{{method}}' should have a custom error message",
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              STRING_VALIDATIONS.includes(node.callee.property.name) &&
              isZodCall(node)
            ) {
              if (!hasErrorMessage(node)) {
                context.report({
                  node,
                  messageId: 'missingErrorMessage',
                  data: {
                    method: node.callee.property.name,
                  },
                });
              }
            }
          },
        };
      },
    },

    /**
     * Warn about potentially unsafe default values
     */
    'no-unsafe-defaults': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Warn about empty/zero default values that might cause issues',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          unsafeDefault:
            'Default value might be unsafe. Empty strings, zeros, nulls, and empty arrays/objects can cause issues. Use .optional() instead or provide a meaningful default.',
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            if (isZodCall(node) && isUnsafeDefault(node)) {
              context.report({
                node,
                messageId: 'unsafeDefault',
              });
            }
          },
        };
      },
    },

    /**
     * Prefer .strict() on z.object() to prevent extra properties
     */
    'prefer-strict': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Prefer .strict() on z.object() to reject extra properties',
          category: 'Best Practices',
          recommended: false,
        },
        messages: {
          preferStrict:
            'Consider using .strict() on z.object() to reject extra properties and prevent data leaks',
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            // Check for z.object() without .strict()
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'z' &&
              node.callee.property.name === 'object'
            ) {
              // Check if parent chain includes .strict()
              const parent = node.parent;
              if (
                parent &&
                parent.type === 'MemberExpression' &&
                parent.property.name === 'strict'
              ) {
                return; // Has .strict()
              }

              // Check full chain
              let current = node.parent;
              while (current) {
                if (
                  current.type === 'CallExpression' &&
                  current.callee.type === 'MemberExpression' &&
                  current.callee.property.name === 'strict'
                ) {
                  return; // Has .strict() somewhere in chain
                }
                current = current.parent;
              }

              context.report({
                node,
                messageId: 'preferStrict',
              });
            }
          },
        };
      },
    },
  },

  // Recommended config
  configs: {
    recommended: {
      plugins: ['zod-schema'],
      rules: {
        'zod-schema/require-description': 'warn',
        'zod-schema/consistent-naming': ['error', { case: 'camelCase' }],
        'zod-schema/no-unsafe-defaults': 'warn',
        'zod-schema/require-error-message': 'off',
        'zod-schema/prefer-strict': 'off',
      },
    },
    strict: {
      plugins: ['zod-schema'],
      rules: {
        'zod-schema/require-description': 'error',
        'zod-schema/consistent-naming': ['error', { case: 'camelCase' }],
        'zod-schema/no-unsafe-defaults': 'error',
        'zod-schema/require-error-message': 'warn',
        'zod-schema/prefer-strict': 'warn',
      },
    },
  },
};

/*
 * USAGE IN eslint.config.js:
 *
 * import zodSchemaPlugin from './eslint-plugin-zod-schema';
 *
 * export default [
 *   {
 *     files: ['**\/*.schema.ts', '**\/*.schemas.ts'],
 *     plugins: {
 *       'zod-schema': zodSchemaPlugin,
 *     },
 *     rules: {
 *       'zod-schema/require-description': 'warn',
 *       'zod-schema/consistent-naming': ['error', { case: 'camelCase' }],
 *       'zod-schema/no-unsafe-defaults': 'warn',
 *     },
 *   },
 * ];
 *
 * Or use the recommended config:
 *
 * import zodSchemaPlugin from './eslint-plugin-zod-schema';
 *
 * export default [
 *   {
 *     files: ['**\/*.schema.ts'],
 *     ...zodSchemaPlugin.configs.recommended,
 *   },
 * ];
 */
