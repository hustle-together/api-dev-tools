#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

/**
 * API Development Tools Installer v1.0.0
 *
 * Interactive CLI installer with:
 * - ASCII art branding
 * - Progress indicators
 * - Comprehensive file installation
 *
 * Usage: npx @hustle-together/api-dev-tools --scope=project
 *
 * Optional flags:
 *   --with-storybook   Auto-initialize Storybook for component development
 *   --with-playwright  Auto-initialize Playwright for E2E testing
 *   --with-sandpack    Auto-install Sandpack for live UI previews
 *   --silent           Skip banner and reduce output
 */

// ═══════════════════════════════════════════════════════════════════════════
// ANSI Colors (red/black/white branding)
// ═══════════════════════════════════════════════════════════════════════════

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// ═══════════════════════════════════════════════════════════════════════════
// ASCII Art Banner
// ═══════════════════════════════════════════════════════════════════════════

const BANNER = `
${c.red}    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██╗  ██╗██╗   ██╗███████╗████████╗██╗     ███████╗       ║
    ║     ██║  ██║██║   ██║██╔════╝╚══██╔══╝██║     ██╔════╝       ║
    ║     ███████║██║   ██║███████╗   ██║   ██║     █████╗         ║
    ║     ██╔══██║██║   ██║╚════██║   ██║   ██║     ██╔══╝         ║
    ║     ██║  ██║╚██████╔╝███████║   ██║   ███████╗███████╗       ║
    ║     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚══════╝       ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝${c.reset}

${c.red}${c.bold}                        HUSTLE${c.reset}
${c.bold}                    API Dev Tools${c.reset}
${c.dim}        Interview-driven, research-first API development${c.reset}
                        ${c.gray}v3.12.7${c.reset}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Spinner Animation
// ═══════════════════════════════════════════════════════════════════════════

const spinnerFrames = ["◐", "◓", "◑", "◒"];
let spinnerIndex = 0;
let spinnerInterval = null;

function startSpinner(message) {
  process.stdout.write(`\r${c.gray}${spinnerFrames[0]}${c.reset} ${message}`);
  spinnerInterval = setInterval(() => {
    spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
    process.stdout.write(
      `\r${c.gray}${spinnerFrames[spinnerIndex]}${c.reset} ${message}`,
    );
  }, 100);
}

function stopSpinner(success, message) {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
  }
  const icon = success ? `${c.white}●${c.reset}` : `${c.red}○${c.reset}`;
  process.stdout.write(`\r${icon} ${message}\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Logging Utilities
// ═══════════════════════════════════════════════════════════════════════════

function log(message) {
  console.log(message);
}

function logStep(step, total, message) {
  const progress = `${c.dim}[${step}/${total}]${c.reset}`;
  console.log(`\n${progress} ${c.bold}${message}${c.reset}`);
}

function logSuccess(message) {
  console.log(`  ${c.white}●${c.reset} ${message}`);
}

function logInfo(message) {
  console.log(`  ${c.gray}○${c.reset} ${message}`);
}

function logWarn(message) {
  console.log(`  ${c.red}◆${c.reset} ${message}`);
}

function logError(message) {
  console.log(`  ${c.red}✗${c.reset} ${message}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Interactive Prompt Utilities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Single-select with arrow keys
 * @param {string} question - The question to ask
 * @param {Array<{label: string, value: any}>} options - Options to choose from
 * @returns {Promise<any>} - The selected value
 */
async function selectOne(question, options) {
  return new Promise((resolve) => {
    let selected = 0;

    const renderOptions = () => {
      process.stdout.write("\x1B[?25l"); // Hide cursor
      console.log(`\n${c.bold}${question}${c.reset}`);
      options.forEach((opt, i) => {
        const prefix = i === selected ? `${c.red}❯${c.reset}` : " ";
        const label =
          i === selected ? `${c.bold}${opt.label}${c.reset}` : `${c.dim}${opt.label}${c.reset}`;
        console.log(`  ${prefix} ${label}`);
      });
    };

    const clearOptions = () => {
      process.stdout.write(`\x1B[${options.length + 2}A`); // Move up
      for (let i = 0; i < options.length + 2; i++) {
        process.stdout.write("\x1B[2K\n"); // Clear line
      }
      process.stdout.write(`\x1B[${options.length + 2}A`); // Move back up
    };

    renderOptions();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onKeypress = (key) => {
      if (key === "\u001B[A") {
        // Up arrow
        selected = selected > 0 ? selected - 1 : options.length - 1;
        clearOptions();
        renderOptions();
      } else if (key === "\u001B[B") {
        // Down arrow
        selected = selected < options.length - 1 ? selected + 1 : 0;
        clearOptions();
        renderOptions();
      } else if (key === "\r" || key === "\n") {
        // Enter
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onKeypress);
        process.stdout.write("\x1B[?25h"); // Show cursor
        clearOptions();
        console.log(
          `\n${c.bold}${question}${c.reset} ${c.white}${options[selected].label}${c.reset}`,
        );
        resolve(options[selected].value);
      } else if (key === "\u0003") {
        // Ctrl+C
        process.stdout.write("\x1B[?25h");
        process.exit(0);
      }
    };

    process.stdin.on("data", onKeypress);
  });
}

/**
 * Multi-select with checkboxes
 * @param {string} question - The question to ask
 * @param {Array<{label: string, value: any, checked?: boolean}>} options - Options to choose from
 * @returns {Promise<Array<any>>} - Array of selected values
 */
async function selectMany(question, options) {
  return new Promise((resolve) => {
    let cursor = 0;
    const checked = options.map((opt) => opt.checked || false);

    const renderOptions = () => {
      process.stdout.write("\x1B[?25l");
      console.log(`\n${c.bold}${question}${c.reset} ${c.dim}(space to toggle, enter to confirm)${c.reset}`);
      options.forEach((opt, i) => {
        const pointer = i === cursor ? `${c.red}❯${c.reset}` : " ";
        const checkbox = checked[i] ? `${c.white}◉${c.reset}` : `${c.dim}○${c.reset}`;
        const label = i === cursor ? `${c.bold}${opt.label}${c.reset}` : opt.label;
        console.log(`  ${pointer} ${checkbox} ${label}`);
      });
    };

    const clearOptions = () => {
      process.stdout.write(`\x1B[${options.length + 2}A`);
      for (let i = 0; i < options.length + 2; i++) {
        process.stdout.write("\x1B[2K\n");
      }
      process.stdout.write(`\x1B[${options.length + 2}A`);
    };

    renderOptions();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onKeypress = (key) => {
      if (key === "\u001B[A") {
        cursor = cursor > 0 ? cursor - 1 : options.length - 1;
        clearOptions();
        renderOptions();
      } else if (key === "\u001B[B") {
        cursor = cursor < options.length - 1 ? cursor + 1 : 0;
        clearOptions();
        renderOptions();
      } else if (key === " ") {
        checked[cursor] = !checked[cursor];
        clearOptions();
        renderOptions();
      } else if (key === "\r" || key === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onKeypress);
        process.stdout.write("\x1B[?25h");
        clearOptions();
        const selectedLabels = options
          .filter((_, i) => checked[i])
          .map((o) => o.label)
          .join(", ");
        console.log(`\n${c.bold}${question}${c.reset} ${c.white}${selectedLabels || "None"}${c.reset}`);
        resolve(options.filter((_, i) => checked[i]).map((o) => o.value));
      } else if (key === "\u0003") {
        process.stdout.write("\x1B[?25h");
        process.exit(0);
      }
    };

    process.stdin.on("data", onKeypress);
  });
}

/**
 * Text input prompt
 * @param {string} question - The question to ask
 * @param {Object} options - Options
 * @param {string} options.default - Default value
 * @param {boolean} options.mask - Mask the echoed value (for API keys)
 * @param {string} options.hint - Additional hint text
 * @returns {Promise<string>} - The entered text
 */
async function textInput(question, options = {}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const defaultHint = options.default
      ? ` ${c.dim}(${options.mask ? maskSecret(options.default) : options.default})${c.reset}`
      : "";
    const extraHint = options.hint ? ` ${c.dim}${options.hint}${c.reset}` : "";
    rl.question(`${c.bold}${question}${c.reset}${defaultHint}${extraHint}: `, (answer) => {
      rl.close();
      const result = answer.trim() || options.default || "";

      // If masked, show confirmation with masked value
      if (options.mask && result) {
        // Move cursor up and rewrite line with masked value
        process.stdout.write(`\x1B[1A\x1B[2K`);
        console.log(`${c.bold}${question}${c.reset}: ${c.dim}${maskSecret(result)}${c.reset}`);
      }

      resolve(result);
    });
  });
}

/**
 * Yes/No confirmation
 * @param {string} question - The question to ask
 * @param {boolean} defaultYes - Default to yes
 * @returns {Promise<boolean>}
 */
async function confirm(question, defaultYes = true) {
  const hint = defaultYes ? `${c.dim}(Y/n)${c.reset}` : `${c.dim}(y/N)${c.reset}`;
  const answer = await textInput(`${question} ${hint}`, {});
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith("y");
}

/**
 * Progress bar
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {string} label - Label to show
 */
function progressBar(current, total, label = "") {
  const width = 40;
  const percent = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  const bar = `${c.red}${"█".repeat(filled)}${c.gray}${"░".repeat(empty)}${c.reset}`;
  process.stdout.write(`\r  ${bar} ${percent}% ${label}`);
  if (current === total) console.log();
}

// ═══════════════════════════════════════════════════════════════════════════
// Validation Utilities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mask sensitive values (show only last 4 chars)
 */
function maskSecret(value) {
  if (!value || value.length < 8) return "****";
  return "****" + value.slice(-4);
}

/**
 * Validate hex color format
 */
function isValidHex(color) {
  return /^#[0-9A-Fa-f]{3,8}$/.test(color);
}

/**
 * Color presets for quick selection
 */
const COLOR_PRESETS = {
  // Reds
  red: "#EF4444",
  rose: "#F43F5E",
  pink: "#EC4899",
  // Blues
  blue: "#3B82F6",
  sky: "#0EA5E9",
  cyan: "#06B6D4",
  indigo: "#6366F1",
  // Greens
  green: "#22C55E",
  emerald: "#10B981",
  teal: "#14B8A6",
  // Yellows/Oranges
  yellow: "#EAB308",
  amber: "#F59E0B",
  orange: "#F97316",
  // Purples
  purple: "#A855F7",
  violet: "#8B5CF6",
  fuchsia: "#D946EF",
  // Neutrals
  slate: "#64748B",
  gray: "#6B7280",
  zinc: "#71717A",
  stone: "#78716C",
  // Special
  black: "#000000",
  white: "#FFFFFF",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  navy: "#1E3A5A",
  maroon: "#800000",
  coral: "#FF7F50",
  gold: "#FFD700",
};

/**
 * Parse color input - accepts hex or color name
 */
function parseColor(input, defaultColor) {
  if (!input) return defaultColor;
  const trimmed = input.trim().toLowerCase();

  // Check if it's a valid hex
  if (isValidHex(input.trim())) {
    return input.trim().toUpperCase();
  }

  // Check presets
  if (COLOR_PRESETS[trimmed]) {
    return COLOR_PRESETS[trimmed];
  }

  // Return default if invalid
  return defaultColor;
}

/**
 * Font presets with descriptions
 */
const FONT_PRESETS = {
  // Sans-serif
  inter: { name: "Inter", type: "sans-serif", desc: "Clean, modern" },
  geist: { name: "Geist", type: "sans-serif", desc: "GitHub/Vercel style" },
  "plus jakarta sans": { name: "Plus Jakarta Sans", type: "sans-serif", desc: "Friendly" },
  "dm sans": { name: "DM Sans", type: "sans-serif", desc: "Geometric" },
  "ibm plex sans": { name: "IBM Plex Sans", type: "sans-serif", desc: "Technical" },
  poppins: { name: "Poppins", type: "sans-serif", desc: "Geometric, modern" },
  montserrat: { name: "Montserrat", type: "sans-serif", desc: "Clean, elegant" },
  // Serif
  playfair: { name: "Playfair Display", type: "serif", desc: "Elegant, sophisticated" },
  lora: { name: "Lora", type: "serif", desc: "Well-balanced" },
  merriweather: { name: "Merriweather", type: "serif", desc: "Readable, warm" },
  georgia: { name: "Georgia", type: "serif", desc: "Classic web serif" },
  "source serif": { name: "Source Serif Pro", type: "serif", desc: "Modern serif" },
  crimson: { name: "Crimson Text", type: "serif", desc: "Book-style elegance" },
  // Monospace
  "jetbrains mono": { name: "JetBrains Mono", type: "mono", desc: "Developer favorite" },
  "fira code": { name: "Fira Code", type: "mono", desc: "Ligatures, readable" },
  "source code": { name: "Source Code Pro", type: "mono", desc: "Adobe, clean" },
};

/**
 * Parse font input - accepts font name or description
 */
function parseFont(input, defaultFont) {
  if (!input) return defaultFont;
  const trimmed = input.trim().toLowerCase();

  // Check exact match in presets
  if (FONT_PRESETS[trimmed]) {
    return FONT_PRESETS[trimmed].name;
  }

  // Check if input contains keywords
  if (trimmed.includes("serif") && !trimmed.includes("sans")) {
    // User wants a serif font
    if (trimmed.includes("sophist") || trimmed.includes("elegant")) {
      return "Playfair Display";
    }
    return "Crimson Text";
  }

  if (trimmed.includes("sans") || trimmed.includes("clean") || trimmed.includes("modern")) {
    return "Inter";
  }

  if (trimmed.includes("mono") || trimmed.includes("code")) {
    return "JetBrains Mono";
  }

  // If it looks like a font name (capitalized words), use it directly
  if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(input.trim())) {
    return input.trim();
  }

  return defaultFont;
}

// ═══════════════════════════════════════════════════════════════════════════
// Brandfetch API Integration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch brand data from Brandfetch API
 * @param {string} domain - Company domain (e.g., "stripe.com")
 * @param {string} apiKey - Brandfetch API key
 * @returns {Promise<object|null>} Brand data or null on error
 */
async function fetchBrandData(domain, apiKey) {
  const https = require("https");

  return new Promise((resolve) => {
    const options = {
      hostname: "api.brandfetch.io",
      path: `/v2/brands/${encodeURIComponent(domain)}`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const brand = JSON.parse(data);
            resolve(brand);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });

    req.on("error", () => {
      resolve(null);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

/**
 * Parse Brandfetch API response into config-compatible format
 * @param {object} brandData - Raw Brandfetch API response
 * @returns {object} Parsed brand config
 */
function parseBrandData(brandData) {
  const result = {
    brandName: brandData.name || brandData.domain || "Brand",
    description: brandData.description || "",
    primaryColor: "#E11D48",
    secondaryColor: "#1E40AF",
    accentColor: "#8B5CF6",
    fontFamily: "Inter",
    headingFont: "Inter",
    logoUrl: null,
    logoSvg: null,
    iconUrl: null,
  };

  // Extract colors by type
  if (brandData.colors && brandData.colors.length > 0) {
    // Sort by type priority: brand > accent > dark > light
    const brandColor = brandData.colors.find(c => c.type === "brand");
    const accentColor = brandData.colors.find(c => c.type === "accent");
    const darkColor = brandData.colors.find(c => c.type === "dark");
    const lightColor = brandData.colors.find(c => c.type === "light");

    // Primary = brand color or first color
    if (brandColor) {
      result.primaryColor = brandColor.hex.toUpperCase();
    } else if (brandData.colors[0]) {
      result.primaryColor = brandData.colors[0].hex.toUpperCase();
    }

    // Secondary = dark color or second color
    if (darkColor) {
      result.secondaryColor = darkColor.hex.toUpperCase();
    } else if (brandData.colors[1]) {
      result.secondaryColor = brandData.colors[1].hex.toUpperCase();
    }

    // Accent = accent color or third color
    if (accentColor) {
      result.accentColor = accentColor.hex.toUpperCase();
    } else if (lightColor) {
      result.accentColor = lightColor.hex.toUpperCase();
    } else if (brandData.colors[2]) {
      result.accentColor = brandData.colors[2].hex.toUpperCase();
    }
  }

  // Extract fonts
  if (brandData.fonts && brandData.fonts.length > 0) {
    const titleFont = brandData.fonts.find(f => f.type === "title");
    const bodyFont = brandData.fonts.find(f => f.type === "body");

    if (bodyFont && bodyFont.name) {
      result.fontFamily = bodyFont.name;
    } else if (brandData.fonts[0] && brandData.fonts[0].name) {
      result.fontFamily = brandData.fonts[0].name;
    }

    if (titleFont && titleFont.name) {
      result.headingFont = titleFont.name;
    } else {
      result.headingFont = result.fontFamily;
    }
  }

  // Extract logos - prefer SVG, then PNG
  if (brandData.logos && brandData.logos.length > 0) {
    // Find primary logo (type: "logo")
    const primaryLogo = brandData.logos.find(l => l.type === "logo") || brandData.logos[0];
    const icon = brandData.logos.find(l => l.type === "icon" || l.type === "symbol");

    if (primaryLogo && primaryLogo.formats) {
      // Prefer SVG
      const svg = primaryLogo.formats.find(f => f.format === "svg");
      const png = primaryLogo.formats.find(f => f.format === "png");

      if (svg) {
        result.logoSvg = svg.src;
        result.logoUrl = svg.src;
      } else if (png) {
        result.logoUrl = png.src;
      }
    }

    if (icon && icon.formats) {
      const iconSvg = icon.formats.find(f => f.format === "svg");
      const iconPng = icon.formats.find(f => f.format === "png");
      result.iconUrl = iconSvg?.src || iconPng?.src || null;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// File Copy Utilities
// ═══════════════════════════════════════════════════════════════════════════

function copyDir(src, dest, options = {}) {
  const { filter = () => true, overwrite = false } = options;
  let copied = 0;
  let skipped = 0;
  let total = 0;

  if (!fs.existsSync(src)) return { copied: 0, skipped: 0, total: 0 };

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (!filter(entry.name, srcPath)) continue;

    if (entry.isDirectory()) {
      const result = copyDir(srcPath, destPath, options);
      copied += result.copied;
      skipped += result.skipped;
      total += result.total;
    } else {
      total++;
      if (!fs.existsSync(destPath) || overwrite) {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      } else {
        skipped++;
      }
    }
  }

  return { copied, skipped, total };
}

function copyFile(src, dest, options = {}) {
  const { overwrite = false, executable = false } = options;

  if (!fs.existsSync(src)) return false;

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(dest) || overwrite) {
    fs.copyFileSync(src, dest);
    if (executable) {
      fs.chmodSync(dest, "755");
    }
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// Check Prerequisites
// ═══════════════════════════════════════════════════════════════════════════

function checkPython() {
  const commands = ["python3", "python"];
  for (const cmd of commands) {
    try {
      const version = execSync(`${cmd} --version 2>&1`, {
        encoding: "utf8",
      }).trim();
      if (version.includes("Python 3")) {
        return { ok: true, cmd, version };
      }
    } catch (e) {
      // Continue to next command
    }
  }
  return { ok: false };
}

function checkNode() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split(".")[0], 10);
    return { ok: major >= 18, version };
  } catch (e) {
    return { ok: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Installation
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const silent = args.includes("--silent") || args.includes("-s");
  const quickMode = args.includes("--quick") || args.includes("-q");

  // Show banner
  if (!silent) {
    console.clear();
    log(BANNER);
  }

  // Directory setup
  const targetDir = process.cwd();
  const packageDir = path.dirname(__dirname);
  const claudeDir = path.join(targetDir, ".claude");
  const hooksDir = path.join(claudeDir, "hooks");

  // ─────────────────────────────────────────────────────────────────────────
  // WIZARD STEP 1: Choose Setup Mode
  // ─────────────────────────────────────────────────────────────────────────

  let config = {
    withStorybook: true,
    withPlaywright: true,
    withSandpack: true,
    githubToken: "",
    greptileApiKey: "",
    brandfetchApiKey: "",
    ntfyEnabled: false,
    ntfyTopic: "",
    ntfyServer: "ntfy.sh",
    createBrandGuide: true,
    brandSource: "manual", // "brandfetch" or "manual"
    brandDomain: "",
    brandName: path.basename(targetDir),
    primaryColor: "#E11D48",
    secondaryColor: "#1E40AF",
    accentColor: "#8B5CF6",
    successColor: "#10B981",
    warningColor: "#F59E0B",
    errorColor: "#EF4444",
    fontFamily: "Inter",
    headingFont: "Inter",
    monoFont: "JetBrains Mono",
    borderRadius: "8px",
    darkMode: true,
    imageStyle: "photography", // photography, illustration, abstract, minimal
    iconStyle: "outline", // outline, solid, duotone
    buttonStyle: "rounded", // sharp, subtle, rounded, pill
    cardStyle: "elevated", // flat, bordered, elevated
    animationLevel: "subtle", // none, subtle, moderate, expressive
  };

  if (!silent && !quickMode) {
    const setupMode = await selectOne("Choose installation mode", [
      { label: "Quick Setup (recommended defaults)", value: "quick" },
      { label: "Custom Setup (configure each option)", value: "custom" },
    ]);

    if (setupMode === "custom") {
      // ─────────────────────────────────────────────────────────────────────
      // WIZARD STEP 2: API Keys
      // ─────────────────────────────────────────────────────────────────────

      log(`\n${c.red}━━━ API Keys ━━━${c.reset}`);
      log(`${c.dim}These keys enable advanced features like code review and brand fetching${c.reset}\n`);
      log(`${c.bold}Get your keys (all have free tiers):${c.reset}\n`);
      log(`  ${c.white}GITHUB_TOKEN${c.reset}`);
      log(`    ${c.dim}→${c.reset} https://github.com/settings/tokens`);
      log(`    ${c.dim}Purpose: Create issues, PRs, search code${c.reset}`);
      log(`    ${c.dim}Scope needed: 'repo' for private repos${c.reset}\n`);
      log(`  ${c.white}GREPTILE_API_KEY${c.reset}`);
      log(`    ${c.dim}→${c.reset} https://app.greptile.com/settings/api`);
      log(`    ${c.dim}Purpose: AI code review in Phase 11${c.reset}`);
      log(`    ${c.dim}Free tier: 100 reviews/month${c.reset}\n`);
      log(`  ${c.white}BRANDFETCH_API_KEY${c.reset}`);
      log(`    ${c.dim}→${c.reset} https://brandfetch.com/developers`);
      log(`    ${c.dim}Purpose: Auto-fetch logos, colors, fonts from domains${c.reset}`);
      log(`    ${c.dim}Free tier: 50 requests/month (basic assets)${c.reset}\n`);

      const configureKeys = await selectOne("Configure API keys now?", [
        { label: "Yes, enter them now", value: true },
        { label: "No, I'll add to .env later", value: false },
      ]);

      if (configureKeys) {
        config.githubToken = await textInput("GITHUB_TOKEN", {
          default: process.env.GITHUB_TOKEN || "",
          mask: true,
        });
        config.greptileApiKey = await textInput("GREPTILE_API_KEY", {
          default: process.env.GREPTILE_API_KEY || "",
          mask: true,
        });
        config.brandfetchApiKey = await textInput("BRANDFETCH_API_KEY (optional)", {
          default: process.env.BRANDFETCH_API_KEY || "",
          mask: true,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // WIZARD STEP 3: Testing Tools
      // ─────────────────────────────────────────────────────────────────────

      log(`\n${c.red}━━━ Testing Tools ━━━${c.reset}`);
      log(`${c.dim}Required for component development and E2E testing${c.reset}\n`);
      log(`${c.bold}What each tool does:${c.reset}`);
      log(`  ${c.white}Playwright${c.reset}  → E2E browser testing (required for /hustle-ui-create-page)`);
      log(`  ${c.white}Storybook${c.reset}   → Component development & visual testing (required for /hustle-ui-create)`);
      log(`  ${c.white}Sandpack${c.reset}    → Live code preview in browser (optional)\n`);

      const selectedTools = await selectMany("Select testing tools to install", [
        { label: "Playwright (E2E testing)", value: "playwright", checked: true },
        { label: "Storybook (component development)", value: "storybook", checked: true },
        { label: "Sandpack (live code preview)", value: "sandpack", checked: true },
      ]);

      config.withPlaywright = selectedTools.includes("playwright");
      config.withStorybook = selectedTools.includes("storybook");
      config.withSandpack = selectedTools.includes("sandpack");

      // ─────────────────────────────────────────────────────────────────────
      // WIZARD STEP 4: NTFY Notifications
      // ─────────────────────────────────────────────────────────────────────

      log(`\n${c.red}━━━ Push Notifications (NTFY) ━━━${c.reset}`);
      log(`${c.dim}Get notified on your phone when long tasks complete${c.reset}\n`);
      log(`${c.bold}How it works:${c.reset}`);
      log(`  1. Install NTFY app: ${c.white}iOS${c.reset} App Store / ${c.white}Android${c.reset} Play Store`);
      log(`  2. Subscribe to your topic in the app`);
      log(`  3. Receive push notifications when builds/tests finish\n`);
      log(`${c.dim}Free service, no account required. Learn more: https://ntfy.sh${c.reset}\n`);

      config.ntfyEnabled = await confirm("Enable NTFY push notifications?", false);

      if (config.ntfyEnabled) {
        log(`\n${c.dim}Topic name = channel for your notifications (must match the app)${c.reset}`);
        config.ntfyTopic = await textInput("NTFY Topic name", {
          default: path.basename(targetDir) + "-alerts",
        });
        log(`${c.dim}Server URL = ntfy.sh (public) or your self-hosted server${c.reset}`);
        config.ntfyServer = await textInput("NTFY Server URL", {
          default: "ntfy.sh",
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // WIZARD STEP 5: Brand Guide
      // ─────────────────────────────────────────────────────────────────────

      log(`\n${c.red}━━━ Brand Guide ━━━${c.reset}`);
      log(`${c.dim}Design system that enforces consistent UI across all components${c.reset}\n`);
      log(`${c.bold}Why you need a brand guide:${c.reset}`);
      log(`  • Consistent look across all pages and components`);
      log(`  • Faster development (no color/font decisions each time)`);
      log(`  • Enforced by hooks during /hustle-ui-create`);
      log(`  • Professional, cohesive user experience\n`);

      config.createBrandGuide = await confirm("Create brand guide?", true);

      if (config.createBrandGuide) {
        // Brand source selection
        log(`\n${c.bold}How would you like to create your brand guide?${c.reset}\n`);

        config.brandSource = await selectOne("Brand guide source", [
          { label: "Manual Interview - Answer questions about your brand preferences", value: "manual" },
          { label: "Brandfetch - Auto-fetch from company domain (requires API key)", value: "brandfetch" },
        ]);

        // Default values (may be overridden by Brandfetch)
        let brandDefaults = {
          brandName: path.basename(targetDir),
          primaryColor: "#E11D48",
          secondaryColor: "#1E40AF",
          accentColor: "#8B5CF6",
          fontFamily: "Inter",
          headingFont: "Inter",
          logoUrl: null,
          iconUrl: null,
        };

        if (config.brandSource === "brandfetch") {
          log(`\n${c.bold}Brandfetch Integration${c.reset}`);
          log(`${c.dim}Fetch brand assets to pre-populate the interview${c.reset}\n`);

          if (!config.brandfetchApiKey) {
            log(`${c.white}Get your free API key:${c.reset} https://brandfetch.com/developers`);
            log(`${c.dim}Free tier includes: 50 requests/month, basic brand assets${c.reset}\n`);
            config.brandfetchApiKey = await textInput("BRANDFETCH_API_KEY", {
              default: process.env.BRANDFETCH_API_KEY || "",
              mask: true,
            });
          }

          config.brandDomain = await textInput("Company domain to fetch brand from (e.g., stripe.com)", {
            default: "",
          });

          if (config.brandDomain && config.brandfetchApiKey) {
            // Actually fetch brand data!
            startSpinner(`Fetching brand data from ${config.brandDomain}...`);
            const brandData = await fetchBrandData(config.brandDomain, config.brandfetchApiKey);

            if (brandData) {
              const parsed = parseBrandData(brandData);
              stopSpinner(true, `Fetched brand data from ${config.brandDomain}`);

              // Update defaults with fetched data
              brandDefaults = { ...brandDefaults, ...parsed };

              log(`\n${c.bold}Brand Data Retrieved:${c.reset}`);
              log(`  ${c.white}Name:${c.reset} ${parsed.brandName}`);
              log(`  ${c.white}Primary:${c.reset} ${parsed.primaryColor}`);
              log(`  ${c.white}Secondary:${c.reset} ${parsed.secondaryColor}`);
              log(`  ${c.white}Accent:${c.reset} ${parsed.accentColor}`);
              log(`  ${c.white}Body Font:${c.reset} ${parsed.fontFamily}`);
              log(`  ${c.white}Heading Font:${c.reset} ${parsed.headingFont}`);
              if (parsed.logoUrl) log(`  ${c.white}Logo:${c.reset} ${c.dim}${parsed.logoUrl.substring(0, 50)}...${c.reset}`);

              // Store logo URLs for brand guide
              config.logoUrl = parsed.logoUrl;
              config.iconUrl = parsed.iconUrl;

              log(`\n${c.dim}These values will be used as defaults in the interview below.${c.reset}`);
              log(`${c.dim}Press Enter to accept or type a different value.${c.reset}\n`);
            } else {
              stopSpinner(false, `Could not fetch brand data from ${config.brandDomain}`);
              log(`${c.dim}Continuing with manual defaults...${c.reset}\n`);
            }
          } else if (!config.brandDomain) {
            log(`\n${c.dim}No domain provided - using manual defaults${c.reset}`);
          }
        }

        // Full Brand Interview (with Brandfetch data as defaults if available)
        log(`\n${c.bold}━━━ Brand Interview ━━━${c.reset}`);
        if (config.brandSource === "brandfetch" && config.brandDomain) {
          log(`${c.dim}Confirm or customize the fetched brand values${c.reset}\n`);
        } else {
          log(`${c.dim}Let's define your brand's visual identity${c.reset}\n`);
        }

        // Basic identity
        config.brandName = await textInput("Brand/Project name", {
          default: brandDefaults.brandName,
        });

        // Color palette
        log(`\n${c.bold}Color Palette${c.reset}`);
        log(`${c.dim}Define colors that represent your brand${c.reset}`);
        log(`${c.dim}Enter hex (#E11D48) or color name (red, blue, coral, navy, etc.)${c.reset}\n`);

        let primaryInput = await textInput("Primary color (main CTAs, links)", {
          default: brandDefaults.primaryColor,
          hint: "hex or name",
        });
        config.primaryColor = parseColor(primaryInput, brandDefaults.primaryColor);
        if (primaryInput && primaryInput !== config.primaryColor) {
          log(`  ${c.dim}→ Resolved to ${config.primaryColor}${c.reset}`);
        }

        let secondaryInput = await textInput("Secondary color (accents)", {
          default: brandDefaults.secondaryColor,
          hint: "hex or name",
        });
        config.secondaryColor = parseColor(secondaryInput, brandDefaults.secondaryColor);
        if (secondaryInput && secondaryInput !== config.secondaryColor) {
          log(`  ${c.dim}→ Resolved to ${config.secondaryColor}${c.reset}`);
        }

        let accentInput = await textInput("Accent color (highlights, badges)", {
          default: brandDefaults.accentColor,
          hint: "hex or name",
        });
        config.accentColor = parseColor(accentInput, brandDefaults.accentColor);
        if (accentInput && accentInput !== config.accentColor) {
          log(`  ${c.dim}→ Resolved to ${config.accentColor}${c.reset}`);
        }

        // Typography
        log(`\n${c.bold}Typography${c.reset}`);
        log(`${c.dim}Fonts define your brand's personality${c.reset}`);
        log(`${c.dim}Select from presets or describe what you want (e.g., "elegant serif", "modern sans")${c.reset}\n`);

        // Build font options with fetched font as first option if available
        const fontOptions = [];
        if (brandDefaults.fontFamily && brandDefaults.fontFamily !== "Inter") {
          fontOptions.push({ label: `${brandDefaults.fontFamily} - From Brandfetch (Recommended)`, value: brandDefaults.fontFamily });
        }
        fontOptions.push(
          { label: "Inter - Clean, modern, highly readable", value: "Inter" },
          { label: "Geist - GitHub/Vercel aesthetic", value: "Geist" },
          { label: "Plus Jakarta Sans - Friendly, approachable", value: "Plus Jakarta Sans" },
          { label: "DM Sans - Geometric, professional", value: "DM Sans" },
          { label: "IBM Plex Sans - Technical, serious", value: "IBM Plex Sans" },
          { label: "Other - Describe or enter font name", value: "custom" },
        );

        config.fontFamily = await selectOne("Primary body font", fontOptions);

        if (config.fontFamily === "custom") {
          let fontInput = await textInput("Font name or description", {
            default: brandDefaults.fontFamily,
            hint: 'e.g., "Playfair" or "elegant serif"',
          });
          config.fontFamily = parseFont(fontInput, brandDefaults.fontFamily);
          log(`  ${c.dim}→ Using: ${config.fontFamily}${c.reset}`);
        }

        // Build heading font options with fetched font as first option if available
        const headingOptions = [];
        if (brandDefaults.headingFont && brandDefaults.headingFont !== config.fontFamily) {
          headingOptions.push({ label: `${brandDefaults.headingFont} - From Brandfetch (Recommended)`, value: brandDefaults.headingFont });
        }
        headingOptions.push(
          { label: "Same as body font", value: config.fontFamily },
          { label: "Playfair Display - Elegant, sophisticated", value: "Playfair Display" },
          { label: "Cal Sans - Bold, impactful", value: "Cal Sans" },
          { label: "Clash Display - Modern, striking", value: "Clash Display" },
          { label: "Other - Describe or enter font name", value: "custom" },
        );

        config.headingFont = await selectOne("Heading font", headingOptions);

        if (config.headingFont === "custom") {
          let headingInput = await textInput("Heading font name or description", {
            default: brandDefaults.headingFont,
            hint: 'e.g., "sans-serif that pairs nicely"',
          });
          config.headingFont = parseFont(headingInput, brandDefaults.headingFont);
          log(`  ${c.dim}→ Using: ${config.headingFont}${c.reset}`);
        }

        // UI Style preferences
        log(`\n${c.bold}UI Style Preferences${c.reset}`);
        log(`${c.dim}Define the overall look and feel${c.reset}\n`);

        config.buttonStyle = await selectOne("Button style", [
          { label: "Sharp (0px) - Modern, minimal tech aesthetic", value: "sharp" },
          { label: "Subtle (4px) - Professional, slightly softened", value: "subtle" },
          { label: "Rounded (8px) - Friendly, approachable", value: "rounded" },
          { label: "Pill (9999px) - Playful, fully rounded", value: "pill" },
        ]);

        // Map button style to border radius
        const radiusMap = { sharp: "0", subtle: "4px", rounded: "8px", pill: "9999px" };
        config.borderRadius = radiusMap[config.buttonStyle];

        config.cardStyle = await selectOne("Card style", [
          { label: "Flat - Minimal, no depth", value: "flat" },
          { label: "Bordered - Subtle outline separation", value: "bordered" },
          { label: "Elevated - Shadow for depth", value: "elevated" },
        ]);

        // Visual content style
        log(`\n${c.bold}Visual Content${c.reset}`);
        log(`${c.dim}Preferences for images and icons${c.reset}\n`);

        config.imageStyle = await selectOne("Preferred image style", [
          { label: "Photography - Real photos, authentic feel", value: "photography" },
          { label: "Illustrations - Custom drawn, unique personality", value: "illustration" },
          { label: "Abstract - Shapes, gradients, patterns", value: "abstract" },
          { label: "Minimal - Clean, simple graphics", value: "minimal" },
        ]);

        config.iconStyle = await selectOne("Icon style", [
          { label: "Outline - Light, modern (Lucide, Heroicons)", value: "outline" },
          { label: "Solid - Bold, impactful (Phosphor filled)", value: "solid" },
          { label: "Duotone - Two-tone, distinctive", value: "duotone" },
        ]);

        // Animation preferences
        config.animationLevel = await selectOne("Animation level", [
          { label: "None - Static UI, pure function", value: "none" },
          { label: "Subtle - Micro-interactions, fade-ins", value: "subtle" },
          { label: "Moderate - Page transitions, hovers", value: "moderate" },
          { label: "Expressive - Bold animations, personality", value: "expressive" },
        ]);

        // Dark mode
        config.darkMode = await confirm("Include dark mode support?", true);
      }
    }

    log(`\n${c.red}━━━ Installing ━━━${c.reset}\n`);
  }

  const totalSteps = 10;
  let currentStep = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Check Prerequisites
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Checking prerequisites");
  log(`  ${c.dim}Verifying Node.js 18+ and Python 3 are installed${c.reset}`);

  const node = checkNode();
  if (node.ok) {
    logSuccess(`Node.js ${node.version}`);
  } else {
    logError(`Node.js 18+ required (found ${node.version || "none"})`);
    process.exit(1);
  }

  const python = checkPython();
  if (python.ok) {
    logSuccess(`${python.version}`);
  } else {
    logWarn("Python 3 not found - hooks may not work");
    logInfo("Install: https://www.python.org/downloads/");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Install Commands
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Installing slash commands");
  log(`  ${c.dim}Copying 29 commands including /hustle-api-create, /hustle-ui-create${c.reset}`);

  const commandsDir = path.join(claudeDir, "commands");
  const sourceCommandsDir = path.join(packageDir, "commands");

  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  const commandsResult = copyDir(sourceCommandsDir, commandsDir, {
    filter: (name) => name.endsWith(".md"),
  });

  if (commandsResult.copied > 0) {
    logSuccess(`${commandsResult.copied} new commands installed to .claude/commands/`);
  }
  if (commandsResult.skipped > 0) {
    logInfo(`${commandsResult.skipped} commands already exist (preserved)`);
  }
  if (commandsResult.total === 0) {
    logWarn("No commands found in package");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Install Hooks
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Installing enforcement hooks");
  log(`  ${c.dim}Python hooks that enforce TDD workflow and prevent skipping phases${c.reset}`);

  const sourceHooksDir = path.join(packageDir, "hooks");

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Copy hooks lib directory first
  const sourceHooksLibDir = path.join(sourceHooksDir, "lib");
  const destHooksLibDir = path.join(hooksDir, "lib");

  if (fs.existsSync(sourceHooksLibDir)) {
    if (!fs.existsSync(destHooksLibDir)) {
      fs.mkdirSync(destHooksLibDir, { recursive: true });
    }
    copyDir(sourceHooksLibDir, destHooksLibDir);
  }

  // Copy Python hook files
  let hooksCopied = 0;
  let hooksSkipped = 0;
  let hooksTotal = 0;
  if (fs.existsSync(sourceHooksDir)) {
    const hookFiles = fs
      .readdirSync(sourceHooksDir)
      .filter((f) => f.endsWith(".py"));

    hooksTotal = hookFiles.length;

    for (const file of hookFiles) {
      const src = path.join(sourceHooksDir, file);
      const dest = path.join(hooksDir, file);

      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        fs.chmodSync(dest, "755");
        hooksCopied++;
      } else {
        hooksSkipped++;
      }
    }
  }

  if (hooksCopied > 0) {
    logSuccess(`${hooksCopied} new hooks installed to .claude/hooks/`);
  }
  if (hooksSkipped > 0) {
    logInfo(`${hooksSkipped} hooks already exist (preserved)`);
  }
  logInfo("Includes: enforce-*, notify-*, track-token-usage.py");

  // ─────────────────────────────────────────────────────────────────────────
  // Step 4: Install Subagents
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Installing subagents");
  log(`  ${c.dim}AI agents for parallel research, schema generation, code review${c.reset}`);

  const agentsDir = path.join(claudeDir, "agents");
  const sourceAgentsDir = path.join(packageDir, ".claude", "agents");

  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  const agentsResult = copyDir(sourceAgentsDir, agentsDir, {
    filter: (name) => name.endsWith(".md"),
  });

  if (agentsResult.copied > 0) {
    logSuccess(`${agentsResult.copied} new subagents installed to .claude/agents/`);
  }
  if (agentsResult.skipped > 0) {
    logInfo(`${agentsResult.skipped} subagents already exist (preserved)`);
  }
  logInfo("Haiku: parallel-researcher, research-validator, docs-generator");
  logInfo(
    "Sonnet: schema-generator, test-writer, implementation-reviewer, code-reviewer",
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Step 5: Install Configuration Files
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Setting up configuration");
  log(`  ${c.dim}Creating settings.json, state tracking, and research cache${c.reset}`);

  const sourceTemplatesDir = path.join(packageDir, "templates");

  // Settings
  const settingsSource = path.join(sourceTemplatesDir, "settings.json");
  const settingsDest = path.join(claudeDir, "settings.json");

  if (fs.existsSync(settingsSource)) {
    if (fs.existsSync(settingsDest)) {
      // Merge settings
      try {
        const existing = JSON.parse(fs.readFileSync(settingsDest, "utf8"));
        const newSettings = JSON.parse(fs.readFileSync(settingsSource, "utf8"));
        const merged = mergeSettings(existing, newSettings);
        fs.writeFileSync(settingsDest, JSON.stringify(merged, null, 2));
        logSuccess("Merged settings.json");
      } catch (e) {
        logWarn("Could not merge settings.json");
      }
    } else {
      copyFile(settingsSource, settingsDest);
      logSuccess("Created settings.json");
    }
  }

  // State file
  const stateSource = path.join(sourceTemplatesDir, "api-dev-state.json");
  const stateDest = path.join(claudeDir, "api-dev-state.json");

  if (!fs.existsSync(stateDest) && fs.existsSync(stateSource)) {
    copyFile(stateSource, stateDest);
    logSuccess("Created api-dev-state.json");
  } else if (fs.existsSync(stateDest)) {
    logInfo("State file preserved");
  }

  // Registry
  const registrySource = path.join(sourceTemplatesDir, "registry.json");
  const registryDest = path.join(claudeDir, "registry.json");

  if (!fs.existsSync(registryDest) && fs.existsSync(registrySource)) {
    copyFile(registrySource, registryDest);
    logSuccess("Created registry.json");
  }

  // Hustle-build defaults (for --auto mode)
  const defaultsSource = path.join(sourceTemplatesDir, "hustle-build-defaults.json");
  const defaultsDest = path.join(claudeDir, "hustle-build-defaults.json");

  if (fs.existsSync(defaultsSource) && !fs.existsSync(defaultsDest)) {
    copyFile(defaultsSource, defaultsDest);
    logSuccess("Created hustle-build-defaults.json");
  }

  // Research cache
  const researchDir = path.join(claudeDir, "research");
  if (!fs.existsSync(researchDir)) {
    fs.mkdirSync(researchDir, { recursive: true });
    const indexSource = path.join(sourceTemplatesDir, "research-index.json");
    if (fs.existsSync(indexSource)) {
      copyFile(indexSource, path.join(researchDir, "index.json"));
    }
    logSuccess("Created research cache");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 6: Install Environment Template
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Setting up environment");
  log(`  ${c.dim}Creating .env.example template for API keys${c.reset}`);

  const templatesDestDir = path.join(targetDir, "templates");
  if (!fs.existsSync(templatesDestDir)) {
    fs.mkdirSync(templatesDestDir, { recursive: true });
  }

  const envSource = path.join(sourceTemplatesDir, ".env.example");
  const envDest = path.join(templatesDestDir, ".env.example");

  if (fs.existsSync(envSource)) {
    copyFile(envSource, envDest, { overwrite: true });
    logSuccess("Created templates/.env.example");
    logInfo("Copy to .env and configure your API keys");
  }

  // Copy showcase template directories (for update-api-showcase.py and update-ui-showcase.py hooks)
  const showcaseDirs = ["api-showcase", "ui-showcase", "shared"];
  for (const dir of showcaseDirs) {
    const srcDir = path.join(sourceTemplatesDir, dir);
    const destDir = path.join(templatesDestDir, dir);
    if (fs.existsSync(srcDir)) {
      const result = copyDir(srcDir, destDir);
      if (result.copied > 0) {
        logSuccess(`Copied ${dir} templates (${result.copied} files)`);
      } else if (result.skipped > 0) {
        logInfo(`${dir} templates already exist (${result.skipped} files preserved)`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 7: Configure MCP Servers
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Configuring MCP servers");
  log(`  ${c.dim}Setting up AI-powered integrations for research and code review${c.reset}`);

  const mcpServers = [
    {
      name: "context7",
      cmd: "npx -y @upstash/context7-mcp",
      description: "Live documentation lookup (npm, APIs, frameworks)",
      required: true,
    },
    {
      name: "github",
      cmd: "npx -y @modelcontextprotocol/server-github",
      description: "GitHub integration (issues, PRs, code search)",
      required: true,
    },
    {
      name: "greptile",
      cmd: "npx -y @anthropics/mcp-greptile",
      description: "AI code review for Phase 11 verification",
      optional: true,
      requiresKey: "GREPTILE_API_KEY",
    },
    {
      name: "brandfetch",
      cmd: "npx -y @anthropics/mcp-brandfetch",
      description: "Auto-fetch brand assets (logos, colors, fonts)",
      optional: true,
      requiresKey: "BRANDFETCH_API_KEY",
    },
  ];

  for (const server of mcpServers) {
    try {
      execSync(`claude mcp get ${server.name} 2>&1`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      logInfo(`${server.name} already configured`);
      log(`    ${c.dim}${server.description}${c.reset}`);
    } catch (e) {
      try {
        execSync(`claude mcp add ${server.name} -- ${server.cmd}`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        });
        logSuccess(`Added ${server.name}`);
        log(`    ${c.dim}${server.description}${c.reset}`);
      } catch (addErr) {
        if (server.optional) {
          logInfo(`${server.name} (optional) - requires ${server.requiresKey}`);
          log(`    ${c.dim}${server.description}${c.reset}`);
        } else {
          logWarn(`Could not add ${server.name} - add manually`);
        }
      }
    }
  }

  log(`\n  ${c.bold}MCP Server Benefits:${c.reset}`);
  log(`  ${c.dim}• Context7: Always get latest docs, no hallucinated APIs${c.reset}`);
  log(`  ${c.dim}• GitHub: Create issues/PRs directly from Claude${c.reset}`);
  log(`  ${c.dim}• Greptile: AI-powered code review catches bugs before merge${c.reset}`);
  log(`  ${c.dim}• Brandfetch: Auto-generate brand guide from company domain${c.reset}`);

  // ─────────────────────────────────────────────────────────────────────────
  // Step 8: Create .env file with API keys (if provided)
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Configuring environment");
  log(`  ${c.dim}Writing API keys and notification settings to .env${c.reset}`);

  const envPath = path.join(targetDir, ".env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  let envUpdated = false;

  if (config.githubToken && !envContent.includes("GITHUB_TOKEN=")) {
    envContent += `\nGITHUB_TOKEN=${config.githubToken}`;
    envUpdated = true;
  }

  if (config.greptileApiKey && !envContent.includes("GREPTILE_API_KEY=")) {
    envContent += `\nGREPTILE_API_KEY=${config.greptileApiKey}`;
    envUpdated = true;
  }

  if (config.brandfetchApiKey && !envContent.includes("BRANDFETCH_API_KEY=")) {
    envContent += `\nBRANDFETCH_API_KEY=${config.brandfetchApiKey}`;
    envUpdated = true;
  }

  if (config.ntfyEnabled) {
    if (!envContent.includes("NTFY_TOPIC=")) {
      envContent += `\nNTFY_TOPIC=${config.ntfyTopic}`;
      envUpdated = true;
    }
    if (!envContent.includes("NTFY_SERVER=")) {
      envContent += `\nNTFY_SERVER=${config.ntfyServer}`;
      envUpdated = true;
    }
  }

  if (envUpdated) {
    fs.writeFileSync(envPath, envContent.trim() + "\n");
    logSuccess("Updated .env with API keys");
  } else {
    logInfo("No API keys to add (configure in .env later)");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 9: Create Brand Guide (if enabled)
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Brand guide");
  log(`  ${c.dim}Creating comprehensive design system documentation${c.reset}`);

  const brandGuidePath = path.join(claudeDir, "BRAND_GUIDE.md");

  if (config.createBrandGuide && !fs.existsSync(brandGuidePath)) {
    const darkModeSection = config.darkMode
      ? `

## Dark Mode

### Dark Theme Colors
- **Background**: #0F172A
- **Surface**: #1E293B
- **Border**: #334155
- **Text**: #F8FAFC
- **Muted**: #94A3B8

### Implementation
\`\`\`css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0F172A;
    --surface: #1E293B;
    --border: #334155;
    --text: #F8FAFC;
    --muted: #94A3B8;
  }
}
\`\`\`
`
      : "";

    // Build brandfetch note if using domain
    const brandfetchNote = config.brandSource === "brandfetch" && config.brandDomain
      ? `\n> **Source**: Auto-fetched from ${config.brandDomain} via Brandfetch API\n> Run \`/hustle-brand-refresh\` to update from latest brand assets`
      : "";

    // Build logo section if logos were fetched
    const logoSection = config.logoUrl
      ? `
### Logo Assets
${config.logoUrl ? `- **Primary Logo**: ${config.logoUrl}` : ""}
${config.iconUrl ? `- **Icon/Symbol**: ${config.iconUrl}` : ""}

> Download and place logos in \`/public/logo.svg\` and \`/public/icon.svg\`
`
      : "";

    const brandGuideContent = `# ${config.brandName} Brand Guide

> Auto-generated by HUSTLE API Dev Tools v3.12.7
> This guide ensures consistent UI across all components and pages.${brandfetchNote}

---

## Brand Identity

### Brand Name
**${config.brandName}**
${logoSection}

### Brand Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | 🔴 | \`${config.primaryColor}\` | CTAs, links, focus states |
| Secondary | 🔵 | \`${config.secondaryColor}\` | Secondary actions, accents |
| Accent | 🟣 | \`${config.accentColor}\` | Highlights, badges, special elements |
| Success | 🟢 | \`${config.successColor}\` | Success states, confirmations |
| Warning | 🟡 | \`${config.warningColor}\` | Warnings, pending states |
| Error | 🔴 | \`${config.errorColor}\` | Errors, destructive actions |

---

## Color Palette

### Primary Colors
\`\`\`css
--primary: ${config.primaryColor};
--primary-light: ${config.primaryColor}20;  /* 20% opacity */
--primary-dark: ${config.primaryColor};
\`\`\`

### Secondary Colors
\`\`\`css
--secondary: ${config.secondaryColor};
--secondary-light: ${config.secondaryColor}20;
--secondary-dark: ${config.secondaryColor};
\`\`\`

### Accent Colors
\`\`\`css
--accent: ${config.accentColor};
--accent-light: ${config.accentColor}20;
--accent-dark: ${config.accentColor};
\`\`\`

### Neutral Colors (Light Theme)
\`\`\`css
--background: #FFFFFF;
--surface: #F9FAFB;
--border: #E5E7EB;
--text: #111827;
--text-muted: #6B7280;
--text-light: #9CA3AF;
\`\`\`

### Semantic Colors
\`\`\`css
--success: ${config.successColor};
--success-light: ${config.successColor}20;
--warning: ${config.warningColor};
--warning-light: ${config.warningColor}20;
--error: ${config.errorColor};
--error-light: ${config.errorColor}20;
--info: #3B82F6;
--info-light: #DBEAFE;
\`\`\`
${darkModeSection}
---

## Typography

### Font Families
\`\`\`css
--font-primary: "${config.fontFamily}", system-ui, -apple-system, sans-serif;
--font-heading: "${config.headingFont}", system-ui, -apple-system, sans-serif;
--font-mono: "${config.monoFont}", "Fira Code", monospace;
\`\`\`

### Font Scale
| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem | Labels, captions |
| sm | 0.875rem (14px) | 1.25rem | Secondary text |
| base | 1rem (16px) | 1.5rem | Body text |
| lg | 1.125rem (18px) | 1.75rem | Lead paragraphs |
| xl | 1.25rem (20px) | 1.75rem | H4 |
| 2xl | 1.5rem (24px) | 2rem | H3 |
| 3xl | 1.875rem (30px) | 2.25rem | H2 |
| 4xl | 2.25rem (36px) | 2.5rem | H1 |

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Headings
- **Bold**: 700 - Strong emphasis

---

## Spacing

### Spacing Scale (Tailwind-compatible)
| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| 1 | 0.25rem | 4px | Tight spacing |
| 2 | 0.5rem | 8px | Default gap |
| 3 | 0.75rem | 12px | - |
| 4 | 1rem | 16px | Section padding |
| 6 | 1.5rem | 24px | Card padding |
| 8 | 2rem | 32px | Section gaps |
| 12 | 3rem | 48px | Large sections |
| 16 | 4rem | 64px | Page sections |

---

## Border Radius

### Radius Scale
\`\`\`css
--radius-none: 0;
--radius-sm: 2px;
--radius-default: ${config.borderRadius};
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;
\`\`\`

### Usage Guidelines
- **Buttons**: Use \`--radius-default\` (${config.borderRadius})
- **Cards**: Use \`--radius-lg\` or \`--radius-xl\`
- **Inputs**: Use \`--radius-default\`
- **Avatars**: Use \`--radius-full\`
- **Modals**: Use \`--radius-xl\`

---

## Shadows

### Shadow Scale
\`\`\`css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
\`\`\`

---

## Component Patterns

### Buttons

#### Primary Button
\`\`\`jsx
<button className="bg-primary text-white px-4 py-2 rounded-[${config.borderRadius}] font-medium
  hover:opacity-90 focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed">
  Primary Action
</button>
\`\`\`

#### Secondary Button
\`\`\`jsx
<button className="bg-surface border border-border text-text px-4 py-2 rounded-[${config.borderRadius}]
  hover:bg-gray-100 focus:ring-2 focus:ring-gray-200">
  Secondary
</button>
\`\`\`

#### Ghost Button
\`\`\`jsx
<button className="text-text px-4 py-2 rounded-[${config.borderRadius}]
  hover:bg-surface focus:ring-2 focus:ring-gray-200">
  Ghost
</button>
\`\`\`

#### Destructive Button
\`\`\`jsx
<button className="bg-error text-white px-4 py-2 rounded-[${config.borderRadius}]
  hover:bg-red-600 focus:ring-2 focus:ring-error">
  Delete
</button>
\`\`\`

### Cards

\`\`\`jsx
<div className="bg-white border border-border rounded-xl p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-text">Card Title</h3>
  <p className="text-muted text-sm mt-2">Card description text.</p>
</div>
\`\`\`

### Form Inputs

\`\`\`jsx
<div>
  <label className="text-sm font-medium text-text mb-1 block">
    Label
  </label>
  <input
    type="text"
    className="w-full border border-border rounded-[${config.borderRadius}] px-3 py-2
      focus:ring-2 focus:ring-primary focus:border-primary
      placeholder:text-muted"
    placeholder="Enter value..."
  />
  <p className="text-error text-sm mt-1">Error message</p>
</div>
\`\`\`

### Badges

\`\`\`jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-primary-light text-primary">
  Badge
</span>
\`\`\`

---

## Accessibility

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### Focus States
All interactive elements must have visible focus states:
\`\`\`css
:focus-visible {
  outline: 2px solid ${config.primaryColor};
  outline-offset: 2px;
}
\`\`\`

### Touch Targets
- Minimum size: 44x44 pixels
- Minimum spacing: 8px between targets

---

## Icons

### Icon Style: ${config.iconStyle.charAt(0).toUpperCase() + config.iconStyle.slice(1)}
${config.iconStyle === "outline" ? "Light, modern icons with stroke-only design. Best for clean, minimal interfaces." : ""}${config.iconStyle === "solid" ? "Bold, filled icons for high impact and strong visual hierarchy." : ""}${config.iconStyle === "duotone" ? "Two-tone icons with primary and secondary colors for distinctive branding." : ""}

### Recommended Icon Libraries
${config.iconStyle === "outline" ? "- **Lucide React** (recommended) - Consistent, stroke-based\n- **Heroicons Outline** - Tailwind-compatible" : ""}${config.iconStyle === "solid" ? "- **Heroicons Solid** (recommended) - Bold, filled\n- **Phosphor Bold** - Flexible weights" : ""}${config.iconStyle === "duotone" ? "- **Phosphor Duotone** (recommended) - Two-tone design\n- **Font Awesome Duotone** - Wide selection" : ""}

### Icon Sizes
| Size | Pixels | Usage |
|------|--------|-------|
| xs | 12px | Inline with small text |
| sm | 16px | Buttons, inline |
| md | 20px | Default |
| lg | 24px | Headers, standalone |
| xl | 32px | Hero sections |

---

## Visual Style

### Image Style: ${config.imageStyle.charAt(0).toUpperCase() + config.imageStyle.slice(1)}
${config.imageStyle === "photography" ? "Real photographs for authentic, relatable content. Use high-quality, diverse imagery." : ""}${config.imageStyle === "illustration" ? "Custom illustrations for unique brand personality. Maintain consistent style across all graphics." : ""}${config.imageStyle === "abstract" ? "Geometric shapes, gradients, and patterns. Modern, tech-forward aesthetic." : ""}${config.imageStyle === "minimal" ? "Simple, clean graphics with minimal detail. Focus on whitespace and clarity." : ""}

### Card Style: ${config.cardStyle.charAt(0).toUpperCase() + config.cardStyle.slice(1)}
\`\`\`jsx
// ${config.cardStyle} card pattern
<div className="${config.cardStyle === "flat" ? "bg-surface" : ""}${config.cardStyle === "bordered" ? "bg-white border border-border" : ""}${config.cardStyle === "elevated" ? "bg-white shadow-md" : ""} rounded-xl p-6">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted text-sm mt-2">Card content</p>
</div>
\`\`\`

---

## Animation

### Animation Level: ${config.animationLevel.charAt(0).toUpperCase() + config.animationLevel.slice(1)}
${config.animationLevel === "none" ? "No animations. Static UI focused purely on function." : ""}${config.animationLevel === "subtle" ? "Micro-interactions only. Fade-ins, button states, minimal movement." : ""}${config.animationLevel === "moderate" ? "Page transitions, hover effects, loading states. Balanced motion." : ""}${config.animationLevel === "expressive" ? "Bold animations, personality-driven motion, delightful interactions." : ""}

### Timing
\`\`\`css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--easing: cubic-bezier(0.4, 0, 0.2, 1);
\`\`\`

${config.animationLevel !== "none" ? `### Common Animations
\`\`\`css
.fade-in { animation: fadeIn var(--duration-normal) var(--easing); }
.slide-up { animation: slideUp var(--duration-normal) var(--easing); }
.scale-in { animation: scaleIn var(--duration-fast) var(--easing); }
\`\`\`` : "### No Animations\nAll animations are disabled. Use CSS \\`transition: none\\` globally."}

---

## Tailwind Config

\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${config.primaryColor}',
        secondary: '${config.secondaryColor}',
        accent: '${config.accentColor}',
        success: '${config.successColor}',
        warning: '${config.warningColor}',
        error: '${config.errorColor}',
      },
      fontFamily: {
        sans: ['${config.fontFamily}', 'system-ui', 'sans-serif'],
        heading: ['${config.headingFont}', 'system-ui', 'sans-serif'],
        mono: ['${config.monoFont}', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '${config.borderRadius}',
      },
    },
  },
}
\`\`\`

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`;
    fs.writeFileSync(brandGuidePath, brandGuideContent);
    logSuccess("Created .claude/BRAND_GUIDE.md");
  } else if (fs.existsSync(brandGuidePath)) {
    logInfo("Brand guide already exists");
  } else {
    logInfo("Skipped brand guide creation");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 10: Optional Tools
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Testing tools");

  // Check prerequisites
  const hasPackageJson = fs.existsSync(path.join(targetDir, "package.json"));
  const hasPnpm = (() => {
    try {
      execSync("pnpm --version", { stdio: ["pipe", "pipe", "pipe"] });
      return true;
    } catch {
      return false;
    }
  })();

  if (!hasPackageJson) {
    log(`  ${c.dim}No package.json found - skipping npm package installations${c.reset}`);
    logInfo("Run 'pnpm init' first, then re-run installer to add testing tools");
  } else if (!hasPnpm) {
    log(`  ${c.dim}pnpm not found - skipping installations${c.reset}`);
    logInfo("Install pnpm: npm install -g pnpm");
  } else {
    log(`  ${c.dim}Installing Playwright, Storybook, and Sandpack${c.reset}`);

    if (config.withStorybook || config.withPlaywright || config.withSandpack) {
      if (config.withSandpack) {
        startSpinner("Installing Sandpack (live code preview)...");
        try {
          execSync("pnpm add @codesandbox/sandpack-react 2>&1", {
            cwd: targetDir,
            stdio: ["pipe", "pipe", "pipe"],
          });
          stopSpinner(true, "Sandpack installed - enables live UI previews");
        } catch (e) {
          stopSpinner(false, "Sandpack failed");
          logInfo("  Run manually: pnpm add @codesandbox/sandpack-react");
        }
      }

      if (config.withStorybook) {
        // Check if Storybook is already initialized
        const hasStorybook = fs.existsSync(path.join(targetDir, ".storybook"));
        if (hasStorybook) {
          logInfo("Storybook already configured");
        } else {
          startSpinner("Initializing Storybook (component development)...");
          try {
            execSync("pnpm dlx storybook@latest init --yes 2>&1", {
              cwd: targetDir,
              stdio: ["pipe", "pipe", "pipe"],
              timeout: 300000,
            });
            stopSpinner(true, "Storybook initialized - run 'pnpm storybook' to start");
          } catch (e) {
            stopSpinner(false, "Storybook failed");
            logInfo("  Run manually: pnpm dlx storybook@latest init");
            logInfo("  Requires: React/Vue/Angular/Svelte project");
          }
        }
      }

      if (config.withPlaywright) {
        // Check if Playwright is already initialized
        const hasPlaywright = fs.existsSync(path.join(targetDir, "playwright.config.ts")) ||
                              fs.existsSync(path.join(targetDir, "playwright.config.js"));
        if (hasPlaywright) {
          logInfo("Playwright already configured");
        } else {
          startSpinner("Initializing Playwright (E2E testing)...");
          try {
            execSync("pnpm create playwright --yes 2>&1", {
              cwd: targetDir,
              stdio: ["pipe", "pipe", "pipe"],
              timeout: 300000,
            });
            stopSpinner(true, "Playwright initialized - run 'pnpm exec playwright test' to start");
          } catch (e) {
            stopSpinner(false, "Playwright failed");
            logInfo("  Run manually: pnpm create playwright");
          }
        }
      }
    } else {
      logInfo("None selected");
      logInfo("Run wizard again with Custom Setup to add testing tools");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────

  const check = `${c.white}✓${c.reset}`;
  const cross = `${c.dim}○${c.reset}`;

  log(`
${c.red}═══════════════════════════════════════════════════════════════${c.reset}
${c.red}${c.bold}                        HUSTLE${c.reset}
${c.bold}                    Installation Complete${c.reset}
${c.red}═══════════════════════════════════════════════════════════════${c.reset}

${c.bold}Core Components:${c.reset}
  ${check} Commands      .claude/commands/     (29 slash commands)
  ${check} Hooks         .claude/hooks/        (enforcement hooks)
  ${check} Subagents     .claude/agents/       (parallel processing)
  ${check} Config        .claude/              (settings, state, registry)

${c.bold}Configuration:${c.reset}
  ${config.githubToken ? check : cross} GITHUB_TOKEN          ${config.githubToken ? "configured" : "not set"}
  ${config.greptileApiKey ? check : cross} GREPTILE_API_KEY      ${config.greptileApiKey ? "configured" : "not set"}
  ${config.brandfetchApiKey ? check : cross} BRANDFETCH_API_KEY    ${config.brandfetchApiKey ? "configured" : "not set"}
  ${config.ntfyEnabled ? check : cross} NTFY Notifications    ${config.ntfyEnabled ? config.ntfyTopic : "disabled"}
  ${config.createBrandGuide ? check : cross} Brand Guide           ${config.createBrandGuide ? (config.brandSource === "brandfetch" ? `from ${config.brandDomain}` : "manual") : "skipped"}

${c.bold}Testing Tools:${c.reset}
  ${config.withPlaywright ? check : cross} Playwright            ${config.withPlaywright ? "installed" : "not installed"}
  ${config.withStorybook ? check : cross} Storybook             ${config.withStorybook ? "installed" : "not installed"}
  ${config.withSandpack ? check : cross} Sandpack              ${config.withSandpack ? "installed" : "not installed"}

${c.bold}Ready to Use:${c.reset}
  ${c.gray}$${c.reset} /hustle-api-create [endpoint]   ${c.dim}# Build API endpoint${c.reset}
  ${c.gray}$${c.reset} /hustle-ui-create [component]   ${c.dim}# Build component${c.reset}
  ${c.gray}$${c.reset} /hustle-ui-create-page [page]   ${c.dim}# Build page${c.reset}
  ${c.gray}$${c.reset} /hustle-combine [apis]          ${c.dim}# Orchestrate APIs${c.reset}

${c.bold}Next Steps:${c.reset}
  ${!config.githubToken ? `${c.white}→ Add GITHUB_TOKEN to .env${c.reset} (https://github.com/settings/tokens)\n  ` : ""}${!config.greptileApiKey ? `${c.white}→ Add GREPTILE_API_KEY to .env${c.reset} (https://app.greptile.com/settings/api)\n  ` : ""}${!config.brandfetchApiKey && config.brandSource === "brandfetch" ? `${c.white}→ Add BRANDFETCH_API_KEY to .env${c.reset} (https://brandfetch.com/developers)\n  ` : ""}${c.white}→ Restart Claude Code${c.reset} to load MCP servers

${c.dim}Documentation: https://github.com/hustle-together/api-dev-tools${c.reset}
`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Settings Merge
// ═══════════════════════════════════════════════════════════════════════════

function mergeSettings(existing, newSettings) {
  const merged = { ...existing };

  if (newSettings.hooks) {
    merged.hooks = merged.hooks || {};

    for (const hookType of Object.keys(newSettings.hooks)) {
      if (!merged.hooks[hookType]) {
        merged.hooks[hookType] = [];
      }

      for (const newHook of newSettings.hooks[hookType]) {
        const hookCommand = newHook.hooks?.[0]?.command || "";
        const exists = merged.hooks[hookType].some((existing) => {
          const existingCommand = existing.hooks?.[0]?.command || "";
          return existingCommand === hookCommand;
        });

        if (!exists) {
          merged.hooks[hookType].push(newHook);
        }
      }
    }
  }

  if (newSettings.permissions) {
    merged.permissions = merged.permissions || {};
    merged.permissions.allow = [
      ...new Set([
        ...(merged.permissions.allow || []),
        ...(newSettings.permissions.allow || []),
      ]),
    ];
    merged.permissions.deny = [
      ...new Set([
        ...(merged.permissions.deny || []),
        ...(newSettings.permissions.deny || []),
      ]),
    ];
  }

  return merged;
}

// Run
main().catch((error) => {
  console.error(`\n${c.red}Installation failed:${c.reset} ${error.message}`);
  process.exit(1);
});
