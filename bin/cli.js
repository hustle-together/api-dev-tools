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
                        ${c.gray}v3.12.4${c.reset}
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
    withSandpack: false,
    githubToken: "",
    greptileApiKey: "",
    ntfyEnabled: false,
    ntfyTopic: "",
    ntfyServer: "ntfy.sh",
    createBrandGuide: true,
    primaryColor: "#E11D48",
    fontFamily: "Inter",
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
      log(`${c.dim}Required for Phase 11 Code Review${c.reset}\n`);

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
      log(`${c.dim}For component and E2E testing${c.reset}\n`);

      const selectedTools = await selectMany("Select testing tools to install", [
        { label: "Playwright (E2E testing)", value: "playwright", checked: true },
        { label: "Storybook (component development)", value: "storybook", checked: true },
        { label: "Sandpack (live code preview)", value: "sandpack", checked: false },
      ]);

      config.withPlaywright = selectedTools.includes("playwright");
      config.withStorybook = selectedTools.includes("storybook");
      config.withSandpack = selectedTools.includes("sandpack");

      // ─────────────────────────────────────────────────────────────────────
      // WIZARD STEP 4: NTFY Notifications
      // ─────────────────────────────────────────────────────────────────────

      log(`\n${c.red}━━━ Notifications ━━━${c.reset}`);
      log(`${c.dim}Get notified when tasks complete${c.reset}\n`);

      config.ntfyEnabled = await confirm("Enable NTFY push notifications?", false);

      if (config.ntfyEnabled) {
        config.ntfyTopic = await textInput("NTFY Topic name", {
          default: path.basename(targetDir) + "-alerts",
        });
        config.ntfyServer = await textInput("NTFY Server URL", {
          default: "ntfy.sh",
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // WIZARD STEP 5: Brand Guide
      // ─────────────────────────────────────────────────────────────────────

      log(`\n${c.red}━━━ Brand Guide ━━━${c.reset}`);
      log(`${c.dim}Design system for UI components${c.reset}\n`);

      config.createBrandGuide = await confirm("Create brand guide template?", true);

      if (config.createBrandGuide) {
        config.primaryColor = await textInput("Primary color (hex)", {
          default: "#E11D48",
        });
        config.fontFamily = await textInput("Font family", {
          default: "Inter",
        });
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

  const brandGuidePath = path.join(claudeDir, "BRAND_GUIDE.md");

  if (config.createBrandGuide && !fs.existsSync(brandGuidePath)) {
    const brandGuideContent = `# Brand Guide

## Colors

### Primary
- **Main**: ${config.primaryColor}
- **Light**: ${config.primaryColor}20
- **Dark**: ${config.primaryColor}

### Neutral
- **Background**: #FFFFFF
- **Surface**: #F9FAFB
- **Border**: #E5E7EB
- **Text**: #111827
- **Muted**: #6B7280

### Semantic
- **Success**: #10B981
- **Warning**: #F59E0B
- **Error**: #EF4444
- **Info**: #3B82F6

## Typography

### Font Family
- **Primary**: "${config.fontFamily}", system-ui, sans-serif
- **Mono**: "JetBrains Mono", monospace

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)

## Spacing

Use Tailwind's default spacing scale:
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)

## Border Radius

- **sm**: 0.125rem (2px)
- **DEFAULT**: 0.25rem (4px)
- **md**: 0.375rem (6px)
- **lg**: 0.5rem (8px)
- **xl**: 0.75rem (12px)
- **full**: 9999px

## Shadows

- **sm**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **DEFAULT**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **md**: 0 4px 6px rgba(0, 0, 0, 0.1)
- **lg**: 0 10px 15px rgba(0, 0, 0, 0.1)

## Component Patterns

### Buttons
- Primary: bg-primary text-white rounded-lg px-4 py-2
- Secondary: bg-surface border text-text rounded-lg px-4 py-2
- Ghost: hover:bg-surface text-text rounded-lg px-4 py-2

### Cards
- Container: bg-white border rounded-xl p-6 shadow-sm
- Header: text-lg font-semibold text-text
- Content: text-muted text-sm

### Forms
- Input: border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary
- Label: text-sm font-medium text-text mb-1
- Error: text-error text-sm mt-1
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
