#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * API Development Tools Installer
 *
 * Installs slash commands for interview-driven API development into Claude Code.
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log('\n🚀 Installing API Development Tools for Claude Code...\n', 'bright');

  // Get target directory (where user ran the command)
  const targetDir = process.cwd();
  const commandsDir = path.join(targetDir, '.claude', 'commands');

  // Get source commands from this package
  const packageDir = path.dirname(__dirname);
  const sourceCommandsDir = path.join(packageDir, 'commands');

  // Verify source commands exist
  if (!fs.existsSync(sourceCommandsDir)) {
    log('❌ Error: Commands directory not found in package', 'red');
    log(`   Looking for: ${sourceCommandsDir}`, 'red');
    process.exit(1);
  }

  // Create .claude/commands directory if it doesn't exist
  if (!fs.existsSync(commandsDir)) {
    log(`📁 Creating directory: ${commandsDir}`, 'blue');
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  // Copy all command files
  const commandFiles = fs.readdirSync(sourceCommandsDir).filter(file =>
    file.endsWith('.md')
  );

  if (commandFiles.length === 0) {
    log('⚠️  Warning: No command files found to install', 'yellow');
    process.exit(0);
  }

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

  // Success message
  log('\n🎉 API Development Tools installed successfully!\n', 'green');
  log('Available slash commands:', 'bright');
  log('  /api-create [endpoint]    - Complete API development workflow', 'blue');
  log('  /api-interview [endpoint] - Structured interview about endpoint', 'blue');
  log('  /api-research [library]   - Deep research of external APIs/SDKs', 'blue');
  log('  /api-env [endpoint]       - Check API keys and environment', 'blue');
  log('  /api-status [endpoint]    - Track implementation progress', 'blue');

  log('\n📚 Documentation:', 'bright');
  log(`   ${path.join(commandsDir, 'README.md')}`, 'blue');

  log('\n🚀 Quick Start:', 'bright');
  log('   /api-create my-endpoint', 'blue');

  log('\n💡 Tip: Add to package.json for team-wide installation:', 'yellow');
  log('   "scripts": {', 'yellow');
  log('     "postinstall": "npx @mirror-factory/api-dev-tools --scope=project"', 'yellow');
  log('   }\n', 'yellow');
}

// Run installer
try {
  main();
} catch (error) {
  log(`\n❌ Installation failed: ${error.message}`, 'red');
  log(`   ${error.stack}\n`, 'red');
  process.exit(1);
}
