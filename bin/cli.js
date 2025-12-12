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
 * Usage: npx @hustle-together/api-dev-tools --scope=project
 *
 * Optional flags:
 *   --with-storybook   Auto-initialize Storybook for component development
 *   --with-playwright  Auto-initialize Playwright for E2E testing
 *   --with-sandpack    Auto-install Sandpack for live UI previews
 */

// Parse command-line arguments
const args = process.argv.slice(2);
const scope = args.find(arg => arg.startsWith('--scope='))?.split('=')[1] || 'project';
const withStorybook = args.includes('--with-storybook');
const withPlaywright = args.includes('--with-playwright');
const withSandpack = args.includes('--with-sandpack');

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
    { path: path.join(claudeDir, 'registry.json'), name: 'Registry file' },
    { path: path.join(claudeDir, 'performance-budgets.json'), name: 'Performance budgets' },
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
      { path: path.join(hooksDir, 'enforce-documentation.py'), name: 'enforce-documentation.py' },
      { path: path.join(hooksDir, 'update-registry.py'), name: 'update-registry.py' }
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
  // 4b. Install Registry (v3.8.0)
  // ========================================
  const registrySource = path.join(sourceTemplatesDir, 'registry.json');
  const registryDest = path.join(claudeDir, 'registry.json');

  if (fs.existsSync(registrySource)) {
    log('\n📋 Setting up central registry:', 'cyan');

    if (!fs.existsSync(registryDest)) {
      try {
        fs.copyFileSync(registrySource, registryDest);
        log('   ✅ Created registry.json (tracks APIs, components, pages)', 'green');
      } catch (error) {
        log(`   ❌ Failed to create registry: ${error.message}`, 'red');
      }
    } else {
      log('   ℹ️  Registry already exists (preserved)', 'blue');
    }
  }

  // ========================================
  // 4c. Install Brand Guide Template (v3.9.0)
  // ========================================
  const brandGuideSource = path.join(sourceTemplatesDir, 'BRAND_GUIDE.md');
  const brandGuideDest = path.join(claudeDir, 'BRAND_GUIDE.md');

  if (fs.existsSync(brandGuideSource)) {
    log('\n🎨 Setting up brand guide:', 'cyan');

    if (!fs.existsSync(brandGuideDest)) {
      try {
        fs.copyFileSync(brandGuideSource, brandGuideDest);
        log('   ✅ Created BRAND_GUIDE.md (customize for your project branding)', 'green');
      } catch (error) {
        log(`   ❌ Failed to create brand guide: ${error.message}`, 'red');
      }
    } else {
      log('   ℹ️  Brand guide already exists (preserved)', 'blue');
    }
  }

  // ========================================
  // 4d. Install Performance Budgets (v3.9.0)
  // ========================================
  const perfBudgetsSource = path.join(sourceTemplatesDir, 'performance-budgets.json');
  const perfBudgetsDest = path.join(claudeDir, 'performance-budgets.json');

  if (fs.existsSync(perfBudgetsSource)) {
    log('\n📊 Setting up performance budgets:', 'cyan');

    if (!fs.existsSync(perfBudgetsDest)) {
      try {
        fs.copyFileSync(perfBudgetsSource, perfBudgetsDest);
        log('   ✅ Created performance-budgets.json (thresholds for TDD gates)', 'green');
      } catch (error) {
        log(`   ❌ Failed to create performance budgets: ${error.message}`, 'red');
      }
    } else {
      log('   ℹ️  Performance budgets already exist (preserved)', 'blue');
    }
  }

  // ========================================
  // 4e. Install Research Cache Structure (v3.0)
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
  // 4f. Install Showcase Pages (v3.9.2)
  // ========================================
  log('\n🎨 Setting up showcase pages:', 'cyan');

  if (hasNextJs && appDir) {
    const showcaseTemplates = [
      // Shared components first (required by other pages)
      {
        source: 'shared',
        dest: path.join(appDir, 'shared'),
        files: ['HeroHeader.tsx', 'index.ts'],
        name: 'Shared components (HeroHeader)'
      },
      // API Showcase
      {
        source: 'api-showcase',
        dest: path.join(appDir, 'api-showcase'),
        files: ['page.tsx'],
        componentsDir: '_components',
        componentFiles: ['APIShowcase.tsx', 'APICard.tsx', 'APIModal.tsx', 'APITester.tsx'],
        name: 'API Showcase'
      },
      // UI Showcase
      {
        source: 'ui-showcase',
        dest: path.join(appDir, 'ui-showcase'),
        files: ['page.tsx'],
        componentsDir: '_components',
        componentFiles: ['UIShowcase.tsx', 'PreviewCard.tsx', 'PreviewModal.tsx'],
        name: 'UI Showcase'
      },
      // Dev Tools Landing
      {
        source: 'dev-tools',
        dest: path.join(appDir, 'dev-tools'),
        files: ['page.tsx'],
        componentsDir: '_components',
        componentFiles: ['DevToolsLanding.tsx'],
        name: 'Dev Tools Landing'
      }
    ];

    for (const template of showcaseTemplates) {
      const sourceDir = path.join(sourceTemplatesDir, template.source);

      if (!fs.existsSync(sourceDir)) {
        log(`   ⚠️  ${template.name} template not found`, 'yellow');
        continue;
      }

      // Create destination directory
      if (!fs.existsSync(template.dest)) {
        fs.mkdirSync(template.dest, { recursive: true });
      }

      let installedFiles = [];

      // Copy main files (page.tsx, etc.)
      for (const file of template.files) {
        const srcFile = path.join(sourceDir, file);
        const destFile = path.join(template.dest, file);

        if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
          try {
            fs.copyFileSync(srcFile, destFile);
            installedFiles.push(file);
          } catch (error) {
            log(`   ❌ Failed to copy ${file}: ${error.message}`, 'red');
          }
        }
      }

      // Copy _components directory if exists
      if (template.componentsDir && template.componentFiles) {
        const srcComponentsDir = path.join(sourceDir, template.componentsDir);
        const destComponentsDir = path.join(template.dest, template.componentsDir);

        if (fs.existsSync(srcComponentsDir)) {
          if (!fs.existsSync(destComponentsDir)) {
            fs.mkdirSync(destComponentsDir, { recursive: true });
          }

          for (const file of template.componentFiles) {
            const srcFile = path.join(srcComponentsDir, file);
            const destFile = path.join(destComponentsDir, file);

            if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
              try {
                fs.copyFileSync(srcFile, destFile);
                installedFiles.push(`_components/${file}`);
              } catch (error) {
                log(`   ❌ Failed to copy ${file}: ${error.message}`, 'red');
              }
            }
          }
        }
      }

      if (installedFiles.length > 0) {
        log(`   ✅ ${template.name} (${installedFiles.length} files)`, 'green');
      } else {
        log(`   ℹ️  ${template.name} already exists (preserved)`, 'blue');
      }
    }

    log('\n   💡 Showcase pages available at:', 'yellow');
    log('      /dev-tools     - Landing page with all dev tools', 'yellow');
    log('      /api-showcase  - Interactive API testing', 'yellow');
    log('      /ui-showcase   - Live component previews', 'yellow');
  } else {
    log('   ⚠️  Next.js App Router not detected - skipping showcase pages', 'yellow');
  }

  // ========================================
  // 4g. Install Component/Page Templates (v3.9.0)
  // ========================================
  log('\n📦 Setting up component/page templates:', 'cyan');

  const componentPageTemplates = [
    {
      source: 'component',
      dest: path.join(claudeDir, 'templates', 'component'),
      name: 'Component templates'
    },
    {
      source: 'page',
      dest: path.join(claudeDir, 'templates', 'page'),
      name: 'Page templates'
    }
  ];

  for (const template of componentPageTemplates) {
    const sourceDir = path.join(sourceTemplatesDir, template.source);

    if (!fs.existsSync(sourceDir)) {
      log(`   ⚠️  ${template.name} not found`, 'yellow');
      continue;
    }

    if (!fs.existsSync(template.dest)) {
      fs.mkdirSync(template.dest, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);
    let copiedCount = 0;

    for (const file of files) {
      const srcFile = path.join(sourceDir, file);
      const destFile = path.join(template.dest, file);

      if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
        try {
          fs.copyFileSync(srcFile, destFile);
          copiedCount++;
        } catch (error) {
          log(`   ❌ Failed to copy ${file}: ${error.message}`, 'red');
        }
      }
    }

    if (copiedCount > 0) {
      log(`   ✅ ${template.name} (${copiedCount} files)`, 'green');
    } else {
      log(`   ℹ️  ${template.name} already exists (preserved)`, 'blue');
    }
  }

  // ========================================
  // 4h. Install Manifest Generation Scripts
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
  // 7. Install Optional Development Tools
  // ========================================
  if (withStorybook || withPlaywright || withSandpack) {
    log('\n🔧 Installing optional development tools:', 'cyan');

    if (withSandpack) {
      try {
        log('   📦 Installing Sandpack for live component previews...', 'blue');
        execSync('pnpm add @codesandbox/sandpack-react 2>&1', { cwd: targetDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        log('   ✅ Sandpack installed successfully', 'green');
      } catch (error) {
        // Try npm if pnpm fails
        try {
          execSync('npm install @codesandbox/sandpack-react 2>&1', { cwd: targetDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
          log('   ✅ Sandpack installed successfully (via npm)', 'green');
        } catch (npmError) {
          log('   ⚠️  Could not install Sandpack automatically. Run manually:', 'yellow');
          log('      pnpm add @codesandbox/sandpack-react', 'yellow');
        }
      }
    }

    if (withStorybook) {
      try {
        log('   📖 Initializing Storybook (this may take a moment)...', 'blue');
        execSync('npx storybook@latest init --yes 2>&1', { cwd: targetDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 300000 });
        log('   ✅ Storybook initialized successfully', 'green');
        log('   💡 Run with: pnpm storybook', 'yellow');
      } catch (error) {
        log('   ⚠️  Storybook init failed. Run manually:', 'yellow');
        log('      npx storybook@latest init', 'yellow');
      }
    }

    if (withPlaywright) {
      try {
        log('   🎭 Initializing Playwright (this may take a moment)...', 'blue');
        execSync('npm init playwright@latest -- --yes 2>&1', { cwd: targetDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 300000 });
        log('   ✅ Playwright initialized successfully', 'green');
        log('   💡 Run tests with: npx playwright test', 'yellow');
      } catch (error) {
        log('   ⚠️  Playwright init failed. Run manually:', 'yellow');
        log('      npm init playwright@latest', 'yellow');
      }
    }
  }

  // ========================================
  // Success Summary
  // ========================================
  log('\n' + '═'.repeat(60), 'green');
  log('🎉 API Development Tools v3.9.2 installed successfully!', 'green');
  log('═'.repeat(60) + '\n', 'green');

  log('📋 What was installed:', 'bright');
  log('   Commands:  .claude/commands/*.md', 'blue');
  log('   Hooks:     .claude/hooks/*.py (enforcement + user checkpoints)', 'blue');
  log('   Settings:  .claude/settings.json', 'blue');
  log('   State:     .claude/api-dev-state.json', 'blue');
  log('   Registry:  .claude/registry.json (tracks APIs, components, pages)', 'blue');
  log('   Brand:     .claude/BRAND_GUIDE.md (customize for your branding)', 'blue');
  log('   Budgets:   .claude/performance-budgets.json (TDD gate thresholds)', 'blue');
  log('   Research:  .claude/research/ (with freshness tracking)', 'blue');
  log('   Scripts:   scripts/api-dev-tools/*.ts (manifest generation)', 'blue');
  log('   MCP:       context7, github (via claude mcp add)', 'blue');
  log('   Test UI:   /api-test page + /api/test-structure API (if Next.js)', 'blue');

  log('\n🆕 New in v3.9.2:', 'bright');
  log('   • Animated 3D grid hero header on showcase pages', 'cyan');
  log('   • Dev Tools landing page at /dev-tools', 'cyan');
  log('   • Multi-endpoint API selector (e.g., /tts, /voices, /models)', 'cyan');
  log('   • Audio playback for TTS/voice API responses', 'cyan');
  log('   • Enhanced Hustle branding (#BA0C2F)', 'cyan');
  log('   • Dark mode support throughout', 'cyan');

  log('\n📦 v3.9.0 Features (included):', 'bright');
  log('   • /hustle-ui-create command for components and pages', 'cyan');
  log('   • UI Showcase page (grid + modal preview at /ui-showcase)', 'cyan');
  log('   • API Showcase page (interactive testing at /api-showcase)', 'cyan');
  log('   • Brand guide integration (.claude/BRAND_GUIDE.md)', 'cyan');
  log('   • Performance budgets as TDD gates (memory, re-renders, timing)', 'cyan');
  log('   • ShadCN component detection in src/components/ui/', 'cyan');
  log('   • 4-step verification (responsive + brand + tests + memory)', 'cyan');
  log('   • Storybook + Playwright testing templates with thresholds', 'cyan');

  log('\n📦 v3.8.0 Features (included):', 'bright');
  log('   • /hustle-combine command for API orchestration', 'cyan');
  log('   • Central registry (registry.json) tracks all created elements', 'cyan');

  log('\n🔒 User Checkpoint Enforcement:', 'bright');
  log('   • Phase 1: "Which interpretation?" (disambiguation)', 'cyan');
  log('   • Phase 2: "Scope correct?" (scope confirmation)', 'cyan');
  log('   • Phase 3: "Proceed to interview?" (research summary)', 'cyan');
  log('   • Phase 4: "Interview complete?" (all questions answered)', 'cyan');
  log('   • Phase 5: "Approve searches?" (deep research proposal)', 'cyan');
  log('   • Phase 6: "Schema matches interview?" (schema review)', 'cyan');
  log('   • Phase 7: "Ready for testing?" (environment check)', 'cyan');
  log('   • Phase 8: "Test plan looks good?" (test matrix)', 'cyan');
  log('   • Phase 10: "Fix gaps?" (verification decision)', 'cyan');
  log('   • Phase 12: "Documentation complete?" (final checklist)', 'cyan');

  log('\n📚 Available Commands:', 'bright');
  log('  API Development:', 'bright');
  log('  /hustle-api-create [endpoint] - Complete 13-phase API workflow', 'blue');
  log('  /hustle-combine [api|ui]      - Combine existing APIs into orchestration', 'blue');
  log('  /hustle-api-interview [endpoint] - Questions FROM research', 'blue');
  log('  /hustle-api-research [library]   - Adaptive propose-approve research', 'blue');
  log('  /hustle-api-verify [endpoint]    - Manual Phase 10 verification', 'blue');
  log('  /hustle-api-env [endpoint]       - Check API keys and environment', 'blue');
  log('  /hustle-api-status [endpoint]    - Track 13-phase progress', 'blue');
  log('', 'blue');
  log('  UI Development:', 'bright');
  log('  /hustle-ui-create [name]      - Create component or page (13-phase)', 'blue');
  log('                                  • Brand guide integration', 'blue');
  log('                                  • ShadCN component detection', 'blue');
  log('                                  • 4-step verification', 'blue');
  log('                                  • UI Showcase auto-update', 'blue');

  log('\n🚀 Quick Start:', 'bright');
  log('   API: /hustle-api-create my-endpoint', 'blue');
  log('   UI:  /hustle-ui-create Button', 'blue');

  log('\n💡 Check progress anytime:', 'yellow');
  log('   cat .claude/api-dev-state.json | jq \'.phases\'', 'yellow');

  log('\n📖 Documentation:', 'bright');
  log(`   ${path.join(commandsDir, 'README.md')}\n`, 'blue');

  log('\n🎨 Showcase Pages:', 'bright');
  log('   /dev-tools     - Landing page with all dev tools', 'blue');
  log('   /api-showcase  - Interactive API testing', 'blue');
  log('   /ui-showcase   - Live component previews', 'blue');

  log('\n📦 Optional Tools (use --with-* flags to auto-install):', 'yellow');
  log('   --with-sandpack    Live component editing in UI Showcase', 'yellow');
  log('   --with-storybook   Component development environment', 'yellow');
  log('   --with-playwright  E2E testing framework', 'yellow');
  log('\n   Example: npx @hustle-together/api-dev-tools --with-sandpack --with-storybook\n', 'yellow');

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
