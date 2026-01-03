#!/usr/bin/env node
/**
 * Extract Schema Documentation
 *
 * Parses Zod schema files and extracts parameter documentation
 * for use in the API Showcase registry.
 *
 * Usage:
 *   node scripts/extract-schema-docs.cjs <schema-file-path>
 *
 * Output: JSON with parameter documentation
 *
 * Example:
 *   node scripts/extract-schema-docs.cjs src/lib/schemas/unsplash.ts
 *
 * Created with Hustle API Dev Tools (v3.12.10)
 */

const fs = require("fs");
const path = require("path");

/**
 * Parse Zod schema file and extract documentation
 * Uses regex-based parsing since we can't import TypeScript directly
 */
function parseZodSchema(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  const result = {
    file: filePath,
    actions: [],
    schemas: {},
    enums: {},
    constants: {},
  };

  // Extract action enum values
  const actionMatch = content.match(
    /ActionSchema\s*=\s*z\.enum\(\[([^\]]+)\]\)/,
  );
  if (actionMatch) {
    result.actions = actionMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter(Boolean);
  }

  // Extract all enums
  const enumRegex = /export const (\w+Schema)\s*=\s*z\.enum\(\[([^\]]+)\]\)/g;
  let enumMatch;
  while ((enumMatch = enumRegex.exec(content)) !== null) {
    const name = enumMatch[1].replace("Schema", "");
    const values = enumMatch[2]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter(Boolean);
    result.enums[name] = values;
  }

  // Extract request schemas (z.object definitions)
  const schemaRegex =
    /export const (\w+RequestSchema)\s*=\s*z\s*\.?\s*object\(\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\)/gs;
  let schemaMatch;

  while ((schemaMatch = schemaRegex.exec(content)) !== null) {
    const schemaName = schemaMatch[1];
    const schemaBody = schemaMatch[2];
    const params = parseSchemaParams(schemaBody, result.enums);

    // Get action name from schema name (e.g., SearchRequestSchema -> search)
    const actionName = schemaName
      .replace("RequestSchema", "")
      .replace(/([A-Z])/g, (m, p1, offset) =>
        offset > 0 ? "_" + p1.toLowerCase() : p1.toLowerCase(),
      )
      .replace(/^_/, "");

    result.schemas[actionName] = {
      name: schemaName,
      params: params,
    };
  }

  return result;
}

/**
 * Parse individual parameters from schema body
 */
function parseSchemaParams(schemaBody, enums) {
  const params = [];

  // Split by lines and process each field
  const lines = schemaBody.split("\n");

  for (const line of lines) {
    // Match field definitions like: fieldName: z.string().min(1)...
    const fieldMatch = line.match(/^\s*(\w+)\s*:\s*z\.(.+)/);
    if (!fieldMatch) continue;

    const [, name, definition] = fieldMatch;
    const param = {
      name,
      type: "string",
      required: true,
      description: "",
      default: null,
      enum: null,
    };

    // Determine type
    if (definition.includes("string()") || definition.includes("literal(")) {
      param.type = "string";
    } else if (
      definition.includes("number()") ||
      definition.includes("coerce.number()")
    ) {
      param.type = "number";
    } else if (
      definition.includes("boolean()") ||
      definition.includes("coerce.boolean()")
    ) {
      param.type = "boolean";
    } else if (definition.includes("array(")) {
      param.type = "array";
    }

    // Check if it references an enum
    for (const [enumName, enumValues] of Object.entries(enums)) {
      if (definition.includes(enumName + "Schema")) {
        param.type = "enum";
        param.enum = enumValues;
        break;
      }
    }

    // Check if optional
    if (definition.includes(".optional()")) {
      param.required = false;
    }

    // Extract default value
    const defaultMatch = definition.match(/\.default\(([^)]+)\)/);
    if (defaultMatch) {
      let defaultVal = defaultMatch[1].trim();
      // Parse the default value
      if (defaultVal === "true") param.default = true;
      else if (defaultVal === "false") param.default = false;
      else if (/^\d+$/.test(defaultVal)) param.default = parseInt(defaultVal);
      else param.default = defaultVal.replace(/['"]/g, "");
      param.required = false;
    }

    // Extract description from validation messages
    const descMatch = definition.match(
      /['"]([^'"]+is required|[^'"]+too long|[^'"]+invalid)['"]/i,
    );
    if (descMatch) {
      param.description = descMatch[1];
    }

    // Extract min/max for numbers
    const minMatch = definition.match(/\.min\((\d+)/);
    const maxMatch = definition.match(/\.max\((\d+)/);
    if (minMatch) param.min = parseInt(minMatch[1]);
    if (maxMatch) param.max = parseInt(maxMatch[1]);

    params.push(param);
  }

  return params;
}

/**
 * Generate example value for a parameter
 */
function generateExample(param) {
  if (param.default !== null && param.default !== undefined) {
    return param.default;
  }

  if (param.enum && param.enum.length > 0) {
    return param.enum[0];
  }

  // Generate based on param name and type
  const name = param.name.toLowerCase();

  if (param.type === "number") {
    if (param.min !== undefined) return param.min;
    if (name.includes("page")) return 1;
    if (name.includes("per_page") || name.includes("count")) return 10;
    return 10;
  }

  if (param.type === "boolean") {
    return true;
  }

  // String examples based on common param names
  if (name === "query" || name === "q" || name === "search")
    return "nature sunset";
  if (name.includes("id")) return "abc123";
  if (name.includes("url")) return "https://example.com";
  if (name.includes("color")) return "blue";
  if (name.includes("orientation")) return "landscape";
  if (name.includes("size")) return "regular";

  return "example";
}

/**
 * Generate working examples for an endpoint
 */
function generateExamples(action, params, apiId) {
  const examples = {};
  const baseUrl = `http://localhost:3000/api/v2/${apiId}`;

  // Build query parts from required params
  const buildQuery = (includeOptional = false) => {
    const parts = [`action=${action}`];
    for (const param of params) {
      if (param.name === "action") continue;
      if (param.required || includeOptional) {
        const val = generateExample(param);
        if (val !== null && val !== undefined) {
          parts.push(`${param.name}=${encodeURIComponent(String(val))}`);
        }
      }
    }
    return parts.join("&");
  };

  // Basic example with required params only
  const basicQuery = buildQuery(false);
  examples.basic = {
    description: `Basic ${action} request`,
    query: basicQuery,
    curl: `curl -X GET '${baseUrl}?${basicQuery}'`,
  };

  // Full example with all params
  const fullQuery = buildQuery(true);
  if (fullQuery !== basicQuery) {
    examples.full = {
      description: `${action} with all parameters`,
      query: fullQuery,
      curl: `curl -X GET '${baseUrl}?${fullQuery}'`,
    };
  }

  // If there are enums, generate examples for each enum value
  for (const param of params) {
    if (param.enum && param.enum.length > 1) {
      for (const enumVal of param.enum.slice(0, 3)) {
        // First 3 enum values
        const enumQuery = basicQuery.replace(
          `${param.name}=${encodeURIComponent(String(generateExample(param)))}`,
          `${param.name}=${encodeURIComponent(enumVal)}`,
        );
        // Only add if different from basic
        if (enumQuery !== basicQuery) {
          examples[`${param.name}_${enumVal}`] = {
            description: `${action} with ${param.name}=${enumVal}`,
            query: enumQuery,
            curl: `curl -X GET '${baseUrl}?${enumQuery}'`,
          };
        }
      }
    }
  }

  return examples;
}

/**
 * Format output for registry.json
 */
function formatForRegistry(parsed, apiId = "api") {
  const endpoints = {};

  for (const [action, schema] of Object.entries(parsed.schemas)) {
    const params = schema.params
      .map((p) => ({
        name: p.name,
        type: p.type,
        required: p.required,
        description: p.description || `The ${p.name} parameter`,
        default: p.default,
        enum: p.enum,
        min: p.min,
        max: p.max,
        example: String(generateExample(p)),
      }))
      .filter((p) => p.name !== "action"); // Filter out the action param itself

    endpoints[action] = {
      method: "GET", // Default, could be enhanced
      description: `${action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, " ")} action`,
      params: params,
      examples: generateExamples(action, params, apiId),
    };
  }

  return {
    actions: parsed.actions,
    endpoints: endpoints,
  };
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: node extract-schema-docs.cjs <schema-file-path> [api-id]",
    );
    console.error(
      '  api-id: Optional API identifier for generating curl examples (e.g., "unsplash")',
    );
    process.exit(1);
  }

  const schemaPath = args[0];
  const apiId = args[1] || path.basename(schemaPath, ".ts");

  if (!fs.existsSync(schemaPath)) {
    console.error(`File not found: ${schemaPath}`);
    process.exit(1);
  }

  try {
    const parsed = parseZodSchema(schemaPath);
    const formatted = formatForRegistry(parsed, apiId);
    console.log(JSON.stringify(formatted, null, 2));
  } catch (error) {
    console.error("Error parsing schema:", error.message);
    process.exit(1);
  }
}

module.exports = {
  parseZodSchema,
  formatForRegistry,
  generateExample,
  generateExamples,
};
