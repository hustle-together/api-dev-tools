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

${c.bold}              API Development Tools for Claude Code${c.reset}
${c.dim}        Interview-driven, research-first API development${c.reset}
                        ${c.gray}v1.0.0${c.reset}
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
  const withStorybook = args.includes("--with-storybook");
  const withPlaywright = args.includes("--with-playwright");
  const withSandpack = args.includes("--with-sandpack");
  const silent = args.includes("--silent") || args.includes("-s");

  // Show banner
  if (!silent) {
    console.clear();
    log(BANNER);
  }

  // Directory setup
  const targetDir = process.cwd();
  const packageDir = path.dirname(__dirname);
  const claudeDir = path.join(targetDir, ".claude");
  const hooksDir = path.join(targetDir, "hooks");

  const totalSteps = 8;
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

  logSuccess(`${hooksCopied} hooks installed to hooks/`);
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
        logWarn(`Could not add ${server.name} - add manually`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 8: Optional Tools
  // ─────────────────────────────────────────────────────────────────────────

  logStep(++currentStep, totalSteps, "Optional tools");

  if (withStorybook || withPlaywright || withSandpack) {
    if (withSandpack) {
      startSpinner("Installing Sandpack...");
      try {
        execSync("npm install @codesandbox/sandpack-react 2>&1", {
          cwd: targetDir,
          stdio: ["pipe", "pipe", "pipe"],
        });
        stopSpinner(true, "Sandpack installed");
      } catch (e) {
        stopSpinner(
          false,
          "Sandpack install failed - run: npm install @codesandbox/sandpack-react",
        );
      }
    }

    if (withStorybook) {
      startSpinner("Initializing Storybook (this takes a moment)...");
      try {
        execSync("npx storybook@latest init --yes 2>&1", {
          cwd: targetDir,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 300000,
        });
        stopSpinner(true, "Storybook initialized");
      } catch (e) {
        stopSpinner(
          false,
          "Storybook init failed - run: npx storybook@latest init",
        );
      }
    }

    if (withPlaywright) {
      startSpinner("Initializing Playwright (this takes a moment)...");
      try {
        execSync("npm init playwright@latest -- --yes 2>&1", {
          cwd: targetDir,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 300000,
        });
        stopSpinner(true, "Playwright initialized");
      } catch (e) {
        stopSpinner(
          false,
          "Playwright init failed - run: npm init playwright@latest",
        );
      }
    }
  } else {
    logInfo("None selected");
    logInfo(
      "Add later with: --with-storybook --with-playwright --with-sandpack",
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────

  log(`
${c.red}═══════════════════════════════════════════════════════════════${c.reset}
${c.bold}                    Installation Complete${c.reset}
${c.red}═══════════════════════════════════════════════════════════════${c.reset}

${c.bold}Installed:${c.reset}
  ● Commands      .claude/commands/     (slash commands)
  ● Hooks         hooks/                (enforcement)
  ● Subagents     .claude/agents/       (parallel processing)
  ● Config        .claude/              (settings, state, registry)
  ● Templates     templates/            (.env.example)

${c.bold}Quick Start:${c.reset}
  ${c.gray}$${c.reset} /api-create my-endpoint      ${c.dim}# Build API endpoint${c.reset}
  ${c.gray}$${c.reset} /hustle-ui-create Button     ${c.dim}# Build component${c.reset}
  ${c.gray}$${c.reset} /hustle-ui-create-page Home  ${c.dim}# Build page${c.reset}
  ${c.gray}$${c.reset} /hustle-combine api          ${c.dim}# Orchestrate APIs${c.reset}

${c.bold}Next Steps:${c.reset}
  1. ${c.white}cp templates/.env.example .env${c.reset}
  2. ${c.white}Configure your API keys in .env${c.reset}
  3. ${c.white}/ntfy-setup${c.reset} for push notifications (optional)
  4. ${c.white}Restart Claude Code${c.reset} for MCP tools

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
