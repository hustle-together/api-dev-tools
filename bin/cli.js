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
    { path: path.join(claudeDir, 'research'), name: 'Research cache directory' },
    { path: path.join(claudeDir, 'research', 'index.json'), name: 'Research index' },
  ];

  // Add hook checks if hooks directory exists (v3.0 has 18 hooks for 100% phase enforcement with user checkpoints)
  if (fs.existsSync(hooksDir)) {
    checks.push(
      // Core utility hooks (5)
      { path: path.join(hooksDir, 'session-startup.py'), name: 'session-startup.py' },
      { path: path.join(hooksDir, 'enforce-external-research.py'), name: 'enforce-external-research.py' },
      { path: path.join(hooksDir, 'track-tool-use.py'), name: 'track-tool-use.py' },
      { path: path.join(hooksDir, 'periodic-reground.py'), name: 'periodic-reground.py' },
      { path: path.join(hooksDir, 'api-workflow-check.py'), name: 'api-workflow-check.py' },
      // Phase enforcement hooks with user checkpoints (12 - one per phase)
      { path: path.join(hooksDir, 'enforce-disambiguation.py'), name: 'enforce-disambiguation.py' },
      { path: path.join(hooksDir, 'enforce-scope.py'), name: 'enforce-scope.py' },
      { path: path.join(hooksDir, 'enforce-research.py'), name: 'enforce-research.py' },
      { path: path.join(hooksDir, 'enforce-interview.py'), name: 'enforce-interview.py' },
      { path: path.join(hooksDir, 'enforce-deep-research.py'), name: 'enforce-deep-research.py' },
      { path: path.join(hooksDir, 'enforce-schema.py'), name: 'enforce-schema.py' },
      { path: path.join(hooksDir, 'enforce-environment.py'), name: 'enforce-environment.py' },
      { path: path.join(hooksDir, 'enforce-tdd-red.py'), name: 'enforce-tdd-red.py' },
      { path: path.join(hooksDir, 'verify-implementation.py'), name: 'verify-implementation.py' },
      { path: path.join(hooksDir, 'verify-after-green.py'), name: 'verify-after-green.py' },
      { path: path.join(hooksDir, 'enforce-verify.py'), name: 'enforce-verify.py' },
      { path: path.join(hooksDir, 'enforce-refactor.py'), name: 'enforce-refactor.py' },
      { path: path.join(hooksDir, 'enforce-documentation.py'), name: 'enforce-documentation.py' }
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
  // 4b. Install Research Cache Structure (v3.0)
  // ========================================
  const researchDir = path.join(claudeDir, 'research');
  const researchIndexSource = path.join(sourceTemplatesDir, 'research-index.json');
  const researchIndexDest = path.join(researchDir, 'index.json');

  log('\n📚 Setting up research cache:', 'cyan');

  if (!fs.existsSync(researchDir)) {
    try {
      fs.mkdirSync(researchDir, { recursive: true });
      log('   ✅ Created .claude/research/ directory', 'green');
    } catch (error) {
      log(`   ❌ Failed to create research directory: ${error.message}`, 'red');
    }
  }

  if (fs.existsSync(researchIndexSource) && !fs.existsSync(researchIndexDest)) {
    try {
      fs.copyFileSync(researchIndexSource, researchIndexDest);
      log('   ✅ Created research/index.json for freshness tracking', 'green');
    } catch (error) {
      log(`   ❌ Failed to create research index: ${error.message}`, 'red');
    }
  } else if (fs.existsSync(researchIndexDest)) {
    log('   ℹ️  Research index already exists (preserved)', 'blue');
  }

  // ========================================
  // 4c. Install Test UI (Parser API + Page)
  // ========================================
  log('\n🧪 Setting up Test UI:', 'cyan');

  const testUiSourceDir = path.join(sourceTemplatesDir, 'api-test');
  const hasNextJs = fs.existsSync(path.join(targetDir, 'next.config.js')) ||
                    fs.existsSync(path.join(targetDir, 'next.config.mjs')) ||
                    fs.existsSync(path.join(targetDir, 'next.config.ts'));

  if (!hasNextJs) {
    log('   ⚠️  Next.js not detected - skipping Test UI installation', 'yellow');
    log('   💡 Test UI requires Next.js App Router', 'yellow');
  } else if (fs.existsSync(testUiSourceDir)) {
    // Detect App Router structure
    const appDir = fs.existsSync(path.join(targetDir, 'src', 'app'))
      ? path.join(targetDir, 'src', 'app')
      : fs.existsSync(path.join(targetDir, 'app'))
        ? path.join(targetDir, 'app')
        : null;

    if (!appDir) {
      log('   ⚠️  App Router not detected - skipping Test UI installation', 'yellow');
      log('   💡 Test UI requires Next.js App Router (app/ or src/app/)', 'yellow');
    } else {
      // Install test-structure API route
      const apiTestStructureDir = path.join(appDir, 'api', 'test-structure');
      const apiTestStructureSource = path.join(testUiSourceDir, 'test-structure', 'route.ts');
      const apiTestStructureDest = path.join(apiTestStructureDir, 'route.ts');

      if (!fs.existsSync(apiTestStructureDir)) {
        fs.mkdirSync(apiTestStructureDir, { recursive: true });
      }

      if (!fs.existsSync(apiTestStructureDest)) {
        try {
          fs.copyFileSync(apiTestStructureSource, apiTestStructureDest);
          log('   ✅ Created /api/test-structure route (parses Vitest files)', 'green');
        } catch (error) {
          log(`   ❌ Failed to create test-structure API: ${error.message}`, 'red');
        }
      } else {
        log('   ℹ️  /api/test-structure already exists (preserved)', 'blue');
      }

      // Install test UI page
      const apiTestPageDir = path.join(appDir, 'api-test');
      const apiTestPageSource = path.join(testUiSourceDir, 'page.tsx');
      const apiTestPageDest = path.join(apiTestPageDir, 'page.tsx');

      if (!fs.existsSync(apiTestPageDir)) {
        fs.mkdirSync(apiTestPageDir, { recursive: true });
      }

      if (!fs.existsSync(apiTestPageDest)) {
        try {
          fs.copyFileSync(apiTestPageSource, apiTestPageDest);
          log('   ✅ Created /api-test page (displays test structure)', 'green');
        } catch (error) {
          log(`   ❌ Failed to create test UI page: ${error.message}`, 'red');
        }
      } else {
        log('   ℹ️  /api-test page already exists (preserved)', 'blue');
      }

      log('   💡 Test UI available at http://localhost:3000/api-test', 'yellow');
    }
  } else {
    log('   ⚠️  Test UI templates not found in package', 'yellow');
  }

  // ========================================
  // 4d. Install Manifest Generation Scripts
  // ========================================
  log('\n📊 Setting up manifest generation scripts:', 'cyan');

  const sourceScriptsDir = path.join(packageDir, 'scripts');
  const targetScriptsDir = path.join(targetDir, 'scripts', 'api-dev-tools');

  if (fs.existsSync(sourceScriptsDir)) {
    if (!fs.existsSync(targetScriptsDir)) {
      fs.mkdirSync(targetScriptsDir, { recursive: true });
    }

    const scriptFiles = fs.readdirSync(sourceScriptsDir).filter(file =>
      file.endsWith('.ts')
    );

    if (scriptFiles.length > 0) {
      scriptFiles.forEach(file => {
        const source = path.join(sourceScriptsDir, file);
        const dest = path.join(targetScriptsDir, file);

        try {
          fs.copyFileSync(source, dest);
          log(`   ✅ ${file}`, 'green');
        } catch (error) {
          log(`   ❌ Failed to copy ${file}: ${error.message}`, 'red');
        }
      });

      log('\n   Script purposes:', 'blue');
      log('   • generate-test-manifest.ts - Parses tests → manifest (NO LLM)', 'blue');
      log('   • extract-parameters.ts     - Extracts Zod params → matrix', 'blue');
      log('   • collect-test-results.ts   - Runs Vitest → results JSON', 'blue');
      log('\n   💡 Scripts run automatically after tests pass (Phase 8 → 9)', 'yellow');
      log('   💡 Manual: npx tsx scripts/api-dev-tools/generate-test-manifest.ts', 'yellow');
    }
  } else {
    log('   ⚠️  Scripts directory not found in package', 'yellow');
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
  // 6. Update CLAUDE.md with workflow documentation
  // ========================================
  const claudeMdSection = path.join(sourceTemplatesDir, 'CLAUDE-SECTION.md');
  const projectClaudeMd = path.join(targetDir, 'CLAUDE.md');

  if (fs.existsSync(claudeMdSection)) {
    log('\n📝 CLAUDE.md workflow documentation:', 'cyan');

    const sectionContent = fs.readFileSync(claudeMdSection, 'utf8');
    const sectionMarker = '## API Development Workflow (v3.0)';

    if (fs.existsSync(projectClaudeMd)) {
      const existingContent = fs.readFileSync(projectClaudeMd, 'utf8');

      if (existingContent.includes(sectionMarker)) {
        // Update existing section
        const beforeSection = existingContent.split(sectionMarker)[0];
        // Find the next ## heading or end of file
        const afterMatch = existingContent.match(/## API Development Workflow[\s\S]*?((?=\n## )|$)/);
        const afterSection = afterMatch ? existingContent.substring(existingContent.indexOf(afterMatch[0]) + afterMatch[0].length) : '';

        fs.writeFileSync(projectClaudeMd, beforeSection + sectionContent + afterSection);
        log('   ✅ Updated API Development Workflow section in CLAUDE.md', 'green');
      } else {
        // Append section
        fs.appendFileSync(projectClaudeMd, '\n\n' + sectionContent);
        log('   ✅ Added API Development Workflow section to CLAUDE.md', 'green');
      }
    } else {
      // Create new CLAUDE.md with section
      fs.writeFileSync(projectClaudeMd, '# Project Instructions\n\n' + sectionContent);
      log('   ✅ Created CLAUDE.md with API Development Workflow section', 'green');
    }
  }

  // ========================================
  // Success Summary
  // ========================================
  log('\n' + '═'.repeat(60), 'green');
  log('🎉 API Development Tools v3.0 installed successfully!', 'green');
  log('═'.repeat(60) + '\n', 'green');

  log('📋 What was installed:', 'bright');
  log('   Commands:  .claude/commands/*.md', 'blue');
  log('   Hooks:     .claude/hooks/*.py (18 hooks for 100% enforcement + user checkpoints)', 'blue');
  log('   Settings:  .claude/settings.json', 'blue');
  log('   State:     .claude/api-dev-state.json', 'blue');
  log('   Research:  .claude/research/ (with freshness tracking)', 'blue');
  log('   Scripts:   scripts/api-dev-tools/*.ts (manifest generation)', 'blue');
  log('   MCP:       context7, github (via claude mcp add)', 'blue');
  log('   Test UI:   /api-test page + /api/test-structure API (if Next.js)', 'blue');

  log('\n🆕 New in v3.0:', 'bright');
  log('   • 12 phases, each with mandatory user checkpoint', 'cyan');
  log('   • AskUserQuestion required at EVERY phase transition', 'cyan');
  log('   • Loop-back support when user wants changes', 'cyan');
  log('   • Adaptive research (propose-approve, not shotgun)', 'cyan');
  log('   • 7-turn re-grounding (prevents context dilution)', 'cyan');
  log('   • Research freshness (7-day cache validity)', 'cyan');

  log('\n🔒 User Checkpoint Enforcement:', 'bright');
  log('   • Phase 0: "Which interpretation?" (disambiguation)', 'cyan');
  log('   • Phase 1: "Scope correct?" (scope confirmation)', 'cyan');
  log('   • Phase 2: "Proceed to interview?" (research summary)', 'cyan');
  log('   • Phase 3: "Interview complete?" (all questions answered)', 'cyan');
  log('   • Phase 4: "Approve searches?" (deep research proposal)', 'cyan');
  log('   • Phase 5: "Schema matches interview?" (schema review)', 'cyan');
  log('   • Phase 6: "Ready for testing?" (environment check)', 'cyan');
  log('   • Phase 7: "Test plan looks good?" (test matrix)', 'cyan');
  log('   • Phase 9: "Fix gaps?" (verification decision)', 'cyan');
  log('   • Phase 11: "Documentation complete?" (final checklist)', 'cyan');

  log('\n📚 Available Commands:', 'bright');
  log('  /api-create [endpoint]    - Complete 12-phase workflow', 'blue');
  log('  /api-interview [endpoint] - Questions FROM research', 'blue');
  log('  /api-research [library]   - Adaptive propose-approve research', 'blue');
  log('  /api-verify [endpoint]    - Manual Phase 9 verification', 'blue');
  log('  /api-env [endpoint]       - Check API keys and environment', 'blue');
  log('  /api-status [endpoint]    - Track 12-phase progress', 'blue');

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
