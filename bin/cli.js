#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * API Development Tools Installer
 *
 * Installs slash commands AND enforcement hooks for interview-driven API development.
 *
 * Features:
 *   - Slash commands in .claude/commands/
 *   - Python hooks for programmatic enforcement
 *   - Settings configuration for hook registration
 *   - State file template for progress tracking
 *
 * Usage: npx @mirror-factory/api-dev-tools --scope=project
 */

// Parse command-line arguments
const args = process.argv.slice(2);
const scope = args.find(arg => arg.startsWith('--scope='))?.split('=')[1] || 'project';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if Python 3 is available
 */
function checkPython() {
  const pythonCommands = ['python3', 'python'];

  for (const cmd of pythonCommands) {
    try {
      const version = execSync(`${cmd} --version 2>&1`, { encoding: 'utf8' }).trim();
      if (version.includes('Python 3')) {
        return { available: true, command: cmd, version };
      }
    } catch (e) {
      // Command not found, try next
    }
  }

  return { available: false, command: null, version: null };
}

/**
 * Verify installation was successful
 */
function verifyInstallation(claudeDir, hooksDir) {
  const checks = [
    { path: path.join(claudeDir, 'commands'), name: 'Commands directory' },
    { path: path.join(claudeDir, 'settings.json'), name: 'Settings file' },
    { path: path.join(claudeDir, 'api-dev-state.json'), name: 'State file' },
  ];

  // Add hook checks if hooks directory exists
  if (fs.existsSync(hooksDir)) {
    checks.push(
      { path: path.join(hooksDir, 'enforce-research.py'), name: 'enforce-research.py' },
      { path: path.join(hooksDir, 'track-tool-use.py'), name: 'track-tool-use.py' },
      { path: path.join(hooksDir, 'api-workflow-check.py'), name: 'api-workflow-check.py' }
    );
  }

  const failures = [];
  for (const check of checks) {
    if (!fs.existsSync(check.path)) {
      failures.push(check.name);
    }
  }

  return { success: failures.length === 0, failures };
}

function main() {
  log('\n🚀 Installing API Development Tools for Claude Code...\n', 'bright');

  // Check Python availability first
  const python = checkPython();
  if (!python.available) {
    log('⚠️  Warning: Python 3 not found', 'yellow');
    log('   Enforcement hooks require Python 3 to run.', 'yellow');
    log('   Hooks will be installed but may not work until Python 3 is available.', 'yellow');
    log('   Install Python 3: https://www.python.org/downloads/\n', 'yellow');
  } else {
    log(`✅ Found ${python.version}`, 'green');
  }

  // Get target directory (where user ran the command)
  const targetDir = process.cwd();
  const claudeDir = path.join(targetDir, '.claude');
  const commandsDir = path.join(claudeDir, 'commands');
  const hooksDir = path.join(claudeDir, 'hooks');

  // Get source directories from this package
  const packageDir = path.dirname(__dirname);
  const sourceCommandsDir = path.join(packageDir, 'commands');
  const sourceHooksDir = path.join(packageDir, 'hooks');
  const sourceTemplatesDir = path.join(packageDir, 'templates');

  // Verify source commands exist
  if (!fs.existsSync(sourceCommandsDir)) {
    log('❌ Error: Commands directory not found in package', 'red');
    log(`   Looking for: ${sourceCommandsDir}`, 'red');
    process.exit(1);
  }

  // ========================================
  // 1. Install Commands
  // ========================================
  if (!fs.existsSync(commandsDir)) {
    log(`📁 Creating directory: ${commandsDir}`, 'blue');
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  const commandFiles = fs.readdirSync(sourceCommandsDir).filter(file =>
    file.endsWith('.md')
  );

  if (commandFiles.length === 0) {
    log('⚠️  Warning: No command files found to install', 'yellow');
  } else {
    log('📦 Installing commands:', 'blue');
    commandFiles.forEach(file => {
      const source = path.join(sourceCommandsDir, file);
      const dest = path.join(commandsDir, file);

      try {
        fs.copyFileSync(source, dest);
        log(`   ✅ ${file}`, 'green');
      } catch (error) {
        log(`   ❌ Failed to copy ${file}: ${error.message}`, 'red');
      }
    });
  }

  // ========================================
  // 2. Install Hooks (Programmatic Enforcement)
  // ========================================
  if (fs.existsSync(sourceHooksDir)) {
    if (!fs.existsSync(hooksDir)) {
      log(`\n📁 Creating directory: ${hooksDir}`, 'blue');
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookFiles = fs.readdirSync(sourceHooksDir).filter(file =>
      file.endsWith('.py')
    );

    if (hookFiles.length > 0) {
      log('\n🔒 Installing enforcement hooks:', 'cyan');
      hookFiles.forEach(file => {
        const source = path.join(sourceHooksDir, file);
        const dest = path.join(hooksDir, file);

        try {
          fs.copyFileSync(source, dest);
          // Make executable
          fs.chmodSync(dest, '755');
          log(`   ✅ ${file}`, 'green');
        } catch (error) {
          log(`   ❌ Failed to copy ${file}: ${error.message}`, 'red');
        }
      });

      log('\n   Hook purposes:', 'blue');
      log('   • enforce-research.py  - Blocks code writing without research', 'blue');
      log('   • track-tool-use.py    - Logs all research activity', 'blue');
      log('   • api-workflow-check.py - Prevents stopping until complete', 'blue');
    }
  }

  // ========================================
  // 3. Install/Merge Settings (Hook Registration)
  // ========================================
  const settingsSource = path.join(sourceTemplatesDir, 'settings.json');
  const settingsDest = path.join(claudeDir, 'settings.json');

  if (fs.existsSync(settingsSource)) {
    log('\n⚙️  Configuring hook settings:', 'cyan');

    try {
      const newSettings = JSON.parse(fs.readFileSync(settingsSource, 'utf8'));

      if (fs.existsSync(settingsDest)) {
        // Merge with existing settings
        const existingSettings = JSON.parse(fs.readFileSync(settingsDest, 'utf8'));
        const mergedSettings = mergeSettings(existingSettings, newSettings);
        fs.writeFileSync(settingsDest, JSON.stringify(mergedSettings, null, 2));
        log('   ✅ Merged with existing settings.json', 'green');
      } else {
        // Create new settings file
        fs.writeFileSync(settingsDest, JSON.stringify(newSettings, null, 2));
        log('   ✅ Created settings.json with hook configuration', 'green');
      }
    } catch (error) {
      log(`   ❌ Failed to configure settings: ${error.message}`, 'red');
    }
  }

  // ========================================
  // 4. Install State File Template
  // ========================================
  const stateSource = path.join(sourceTemplatesDir, 'api-dev-state.json');
  const stateDest = path.join(claudeDir, 'api-dev-state.json');

  if (fs.existsSync(stateSource)) {
    log('\n📊 Setting up state tracking:', 'cyan');

    if (!fs.existsSync(stateDest)) {
      try {
        fs.copyFileSync(stateSource, stateDest);
        log('   ✅ Created api-dev-state.json template', 'green');
      } catch (error) {
        log(`   ❌ Failed to create state file: ${error.message}`, 'red');
      }
    } else {
      log('   ℹ️  State file already exists (preserved)', 'blue');
    }
  }

  // ========================================
  // 5. Install MCP Servers via CLI (Context7, GitHub)
  // ========================================
  // NOTE: We use `claude mcp add` directly because .mcp.json requires manual approval
  // and doesn't auto-load. Using the CLI ensures servers are immediately available.
  log('\n🔌 Configuring MCP servers:', 'cyan');

  const { execSync } = require('child_process');

  const mcpServers = [
    { name: 'context7', command: 'npx -y @upstash/context7-mcp', description: 'Live documentation from library source code' },
    { name: 'github', command: 'npx -y @modelcontextprotocol/server-github', description: 'GitHub issues, PRs, and repository access' }
  ];

  for (const server of mcpServers) {
    try {
      // Check if server already exists
      const checkResult = execSync(`claude mcp get ${server.name} 2>&1`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      if (checkResult.includes('Connected') || checkResult.includes('Scope:')) {
        log(`   ✓ ${server.name} - already configured`, 'blue');
      }
    } catch (checkError) {
      // Server doesn't exist, add it
      try {
        execSync(`claude mcp add ${server.name} -- ${server.command}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        log(`   ✅ ${server.name} - ${server.description}`, 'green');
      } catch (addError) {
        log(`   ⚠️  ${server.name} - Could not add (run manually: claude mcp add ${server.name} -- ${server.command})`, 'yellow');
      }
    }
  }

  log('\n   ⚠️  GitHub MCP requires GITHUB_PERSONAL_ACCESS_TOKEN in env', 'yellow');
  log('   💡 Restart Claude Code for MCP tools to be available', 'yellow');

  // ========================================
  // Success Summary
  // ========================================
  log('\n' + '═'.repeat(60), 'green');
  log('🎉 API Development Tools installed successfully!', 'green');
  log('═'.repeat(60) + '\n', 'green');

  log('📋 What was installed:', 'bright');
  log('   Commands:  .claude/commands/*.md', 'blue');
  log('   Hooks:     .claude/hooks/*.py', 'blue');
  log('   Settings:  .claude/settings.json', 'blue');
  log('   State:     .claude/api-dev-state.json', 'blue');
  log('   MCP:       context7, github (via claude mcp add)', 'blue');

  log('\n🔒 Enforcement Features:', 'bright');
  log('   • Research MUST happen before code writing', 'cyan');
  log('   • All research activity is logged to state file', 'cyan');
  log('   • Workflow completion is verified before stopping', 'cyan');
  log('   • Progress is tracked and visible in state file', 'cyan');

  log('\n📚 Available Commands:', 'bright');
  log('  /api-create [endpoint]    - Complete API development workflow', 'blue');
  log('  /api-interview [endpoint] - Structured interview about endpoint', 'blue');
  log('  /api-research [library]   - Deep research of external APIs/SDKs', 'blue');
  log('  /api-env [endpoint]       - Check API keys and environment', 'blue');
  log('  /api-status [endpoint]    - Track implementation progress', 'blue');

  log('\n🚀 Quick Start:', 'bright');
  log('   /api-create my-endpoint', 'blue');

  log('\n💡 Check progress anytime:', 'yellow');
  log('   cat .claude/api-dev-state.json | jq \'.phases\'', 'yellow');

  log('\n📖 Documentation:', 'bright');
  log(`   ${path.join(commandsDir, 'README.md')}\n`, 'blue');

  // ========================================
  // 5. Verify Installation
  // ========================================
  const verification = verifyInstallation(claudeDir, hooksDir);
  if (!verification.success) {
    log('⚠️  Installation verification found issues:', 'yellow');
    verification.failures.forEach(f => log(`   • Missing: ${f}`, 'yellow'));
    log('   Some features may not work correctly.\n', 'yellow');
  }
}

/**
 * Merge MCP server configurations
 */
function mergeMcpServers(existing, newMcp) {
  const merged = { ...existing };
  merged.mcpServers = merged.mcpServers || {};

  // Add new MCP servers that don't already exist
  if (newMcp.mcpServers) {
    for (const [name, config] of Object.entries(newMcp.mcpServers)) {
      if (!merged.mcpServers[name]) {
        merged.mcpServers[name] = config;
      }
    }
  }

  return merged;
}

/**
 * Merge two settings objects, combining hooks arrays
 */
function mergeSettings(existing, newSettings) {
  const merged = { ...existing };

  // Merge hooks
  if (newSettings.hooks) {
    merged.hooks = merged.hooks || {};

    for (const hookType of Object.keys(newSettings.hooks)) {
      if (!merged.hooks[hookType]) {
        merged.hooks[hookType] = [];
      }

      // Add new hooks that don't already exist (check by command path)
      for (const newHook of newSettings.hooks[hookType]) {
        const hookCommand = newHook.hooks?.[0]?.command || '';
        const exists = merged.hooks[hookType].some(existing => {
          const existingCommand = existing.hooks?.[0]?.command || '';
          return existingCommand === hookCommand;
        });

        if (!exists) {
          merged.hooks[hookType].push(newHook);
        }
      }
    }
  }

  return merged;
}

// Run installer
try {
  main();
} catch (error) {
  log(`\n❌ Installation failed: ${error.message}`, 'red');
  log(`   ${error.stack}\n`, 'red');
  process.exit(1);
}
