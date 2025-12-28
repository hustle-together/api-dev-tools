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
                        ${c.gray}v3.12.5${c.reset}
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
 * @param {boolean} options.secret - Hide input (for passwords/keys)
 * @returns {Promise<string>} - The entered text
 */
async function textInput(question, options = {}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const defaultHint = options.default ? ` ${c.dim}(${options.default})${c.reset}` : "";
    rl.question(`${c.bold}${question}${c.reset}${defaultHint}: `, (answer) => {
      rl.close();
      const result = answer.trim() || options.default || "";
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
// File Copy Utilities
// ═══════════════════════════════════════════════════════════════════════════

function copyDir(src, dest, options = {}) {
  const { filter = () => true, overwrite = false } = options;
  let copied = 0;

  if (!fs.existsSync(src)) return copied;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (!filter(entry.name, srcPath)) continue;

    if (entry.isDirectory()) {
      copied += copyDir(srcPath, destPath, options);
    } else {
      if (!fs.existsSync(destPath) || overwrite) {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
  }

  return copied;
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
    ntfyEnabled: false,
    ntfyTopic: "",
    ntfyServer: "ntfy.sh",
    createBrandGuide: true,
    brandName: path.basename(targetDir),
    primaryColor: "#E11D48",
    secondaryColor: "#1E40AF",
    fontFamily: "Inter",
    borderRadius: "8px",
    darkMode: true,
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
      log(`${c.dim}Required for Phase 11 Code Review (Greptile integration)${c.reset}\n`);
      log(`${c.bold}Get your keys:${c.reset}`);
      log(`  ${c.white}GITHUB_TOKEN${c.reset}     → https://github.com/settings/tokens`);
      log(`                    ${c.dim}(needs 'repo' scope for private repos)${c.reset}`);
      log(`  ${c.white}GREPTILE_API_KEY${c.reset} → https://app.greptile.com/settings/api`);
      log(`                    ${c.dim}(free tier available)${c.reset}\n`);

      const configureKeys = await selectOne("Configure API keys now?", [
        { label: "Yes, enter them now", value: true },
        { label: "No, I'll add to .env later", value: false },
      ]);

      if (configureKeys) {
        config.githubToken = await textInput("GITHUB_TOKEN", {
          default: process.env.GITHUB_TOKEN || "",
        });
        config.greptileApiKey = await textInput("GREPTILE_API_KEY", {
          default: process.env.GREPTILE_API_KEY || "",
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
      log(`${c.bold}The brand guide defines:${c.reset}`);
      log(`  • Color palette (primary, secondary, semantic colors)`);
      log(`  • Typography (fonts, sizes, weights)`);
      log(`  • Spacing and layout rules`);
      log(`  • Component patterns (buttons, cards, forms)`);
      log(`  • Accessibility standards\n`);

      config.createBrandGuide = await confirm("Create brand guide template?", true);

      if (config.createBrandGuide) {
        log(`\n${c.bold}Let's set up your brand basics:${c.reset}\n`);

        config.brandName = await textInput("Brand/Project name", {
          default: path.basename(targetDir),
        });

        config.primaryColor = await textInput("Primary brand color (hex)", {
          default: "#E11D48",
        });

        config.secondaryColor = await textInput("Secondary color (hex)", {
          default: "#1E40AF",
        });

        config.fontFamily = await textInput("Primary font family", {
          default: "Inter",
        });

        config.borderRadius = await selectOne("Border radius style", [
          { label: "Sharp (0px) - Modern, minimal", value: "0" },
          { label: "Subtle (4px) - Slightly rounded", value: "4px" },
          { label: "Rounded (8px) - Friendly, approachable", value: "8px" },
          { label: "Pill (9999px) - Fully rounded buttons", value: "9999px" },
        ]);

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

  const commandsCopied = copyDir(sourceCommandsDir, commandsDir, {
    filter: (name) => name.endsWith(".md"),
  });

  logSuccess(`${commandsCopied} commands installed to .claude/commands/`);

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
  if (fs.existsSync(sourceHooksDir)) {
    const hookFiles = fs
      .readdirSync(sourceHooksDir)
      .filter((f) => f.endsWith(".py"));

    for (const file of hookFiles) {
      const src = path.join(sourceHooksDir, file);
      const dest = path.join(hooksDir, file);

      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        fs.chmodSync(dest, "755");
        hooksCopied++;
      }
    }
  }

  logSuccess(`${hooksCopied} hooks installed to .claude/hooks/`);
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

  const agentsCopied = copyDir(sourceAgentsDir, agentsDir, {
    filter: (name) => name.endsWith(".md"),
  });

  logSuccess(`${agentsCopied} subagents installed to .claude/agents/`);
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

  // ─────────────────────────────────────────────────────────────────────────
  // Step 7: Configure MCP Servers
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Configuring MCP servers");
  log(`  ${c.dim}Setting up Context7, GitHub, and Greptile integrations${c.reset}`);

  const mcpServers = [
    { name: "context7", cmd: "npx -y @upstash/context7-mcp" },
    { name: "github", cmd: "npx -y @modelcontextprotocol/server-github" },
    {
      name: "greptile",
      cmd: "npx -y @anthropics/mcp-greptile",
      optional: true,
    },
  ];

  for (const server of mcpServers) {
    try {
      execSync(`claude mcp get ${server.name} 2>&1`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      logInfo(`${server.name} already configured`);
    } catch (e) {
      try {
        execSync(`claude mcp add ${server.name} -- ${server.cmd}`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        });
        logSuccess(`Added ${server.name}`);
      } catch (addErr) {
        if (server.optional) {
          logInfo(
            `${server.name} (optional) - configure with GREPTILE_API_KEY`,
          );
        } else {
          logWarn(`Could not add ${server.name} - add manually`);
        }
      }
    }
  }

  logInfo("Greptile requires GREPTILE_API_KEY + GITHUB_TOKEN for Phase 14");

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

    const brandGuideContent = `# ${config.brandName} Brand Guide

> Auto-generated by HUSTLE API Dev Tools v3.12.5
> This guide ensures consistent UI across all components and pages.

---

## Brand Identity

### Brand Name
**${config.brandName}**

### Brand Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | 🔴 | \`${config.primaryColor}\` | CTAs, links, focus states |
| Secondary | 🔵 | \`${config.secondaryColor}\` | Secondary actions, accents |
| Success | 🟢 | \`#10B981\` | Success states, confirmations |
| Warning | 🟡 | \`#F59E0B\` | Warnings, pending states |
| Error | 🔴 | \`#EF4444\` | Errors, destructive actions |
| Info | 🔵 | \`#3B82F6\` | Information, tips |

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
--success: #10B981;
--success-light: #D1FAE5;
--warning: #F59E0B;
--warning-light: #FEF3C7;
--error: #EF4444;
--error-light: #FEE2E2;
--info: #3B82F6;
--info-light: #DBEAFE;
\`\`\`
${darkModeSection}
---

## Typography

### Font Families
\`\`\`css
--font-primary: "${config.fontFamily}", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
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

### Recommended Icon Libraries
- **Lucide React** - Consistent, customizable
- **Heroicons** - Tailwind-compatible
- **Phosphor Icons** - Flexible weights

### Icon Sizes
| Size | Pixels | Usage |
|------|--------|-------|
| xs | 12px | Inline with small text |
| sm | 16px | Buttons, inline |
| md | 20px | Default |
| lg | 24px | Headers, standalone |
| xl | 32px | Hero sections |

---

## Animation

### Timing
\`\`\`css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--easing: cubic-bezier(0.4, 0, 0.2, 1);
\`\`\`

### Common Animations
\`\`\`css
.fade-in { animation: fadeIn var(--duration-normal) var(--easing); }
.slide-up { animation: slideUp var(--duration-normal) var(--easing); }
.scale-in { animation: scaleIn var(--duration-fast) var(--easing); }
\`\`\`

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
      },
      fontFamily: {
        sans: ['${config.fontFamily}', 'system-ui', 'sans-serif'],
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
  log(`  ${c.dim}Installing Playwright, Storybook, and Sandpack (this may take a few minutes)${c.reset}`);

  if (config.withStorybook || config.withPlaywright || config.withSandpack) {
    if (config.withSandpack) {
      startSpinner("Installing Sandpack...");
      try {
        execSync("pnpm add @codesandbox/sandpack-react 2>&1", {
          cwd: targetDir,
          stdio: ["pipe", "pipe", "pipe"],
        });
        stopSpinner(true, "Sandpack installed");
      } catch (e) {
        stopSpinner(
          false,
          "Sandpack install failed - run: pnpm add @codesandbox/sandpack-react",
        );
      }
    }

    if (config.withStorybook) {
      startSpinner("Initializing Storybook (this takes a moment)...");
      try {
        execSync("pnpm dlx storybook@latest init --yes 2>&1", {
          cwd: targetDir,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 300000,
        });
        stopSpinner(true, "Storybook initialized");
      } catch (e) {
        stopSpinner(
          false,
          "Storybook init failed - run: pnpm dlx storybook@latest init",
        );
      }
    }

    if (config.withPlaywright) {
      startSpinner("Initializing Playwright (this takes a moment)...");
      try {
        execSync("pnpm create playwright --yes 2>&1", {
          cwd: targetDir,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 300000,
        });
        stopSpinner(true, "Playwright initialized");
      } catch (e) {
        stopSpinner(
          false,
          "Playwright init failed - run: pnpm create playwright",
        );
      }
    }
  } else {
    logInfo("None selected");
    logInfo("Run wizard again with Custom Setup to add testing tools");
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
  ${config.ntfyEnabled ? check : cross} NTFY Notifications    ${config.ntfyEnabled ? config.ntfyTopic : "disabled"}
  ${config.createBrandGuide ? check : cross} Brand Guide           ${config.createBrandGuide ? "created" : "skipped"}

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
  ${!config.githubToken ? `1. ${c.white}Add GITHUB_TOKEN to .env${c.reset}\n  ` : ""}${!config.greptileApiKey ? `2. ${c.white}Add GREPTILE_API_KEY to .env${c.reset}\n  ` : ""}${c.white}Restart Claude Code${c.reset} to load MCP servers

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
