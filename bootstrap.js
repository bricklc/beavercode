#!/usr/bin/env node

/**
 * Ultrathink Kit Bootstrap
 *
 * Scaffolds the complete ultrathink workflow system into any project.
 *
 * Usage:
 *   npx ultrathink-kit init           # Full setup
 *   npx ultrathink-kit init --minimal # Workflows only, no tools
 *   npx ultrathink-kit update         # Update workflows from kit
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(msg, color = '') {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function copyDir(src, dest, options = {}) {
  const { overwrite = false, filter = () => true } = options;

  if (!fs.existsSync(src)) {
    log(`  Skip: ${src} (not found)`, COLORS.yellow);
    return 0;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  let copied = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (!filter(entry.name, srcPath)) continue;

    if (entry.isDirectory()) {
      copied += copyDir(srcPath, destPath, options);
    } else {
      if (!overwrite && fs.existsSync(destPath)) {
        log(`  Skip: ${destPath} (exists)`, COLORS.yellow);
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
      log(`  Created: ${destPath}`, COLORS.green);
      copied++;
    }
  }

  return copied;
}

function copyFile(src, dest, options = {}) {
  const { overwrite = false, transform = null } = options;

  if (!fs.existsSync(src)) {
    log(`  Skip: ${src} (not found)`, COLORS.yellow);
    return false;
  }

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!overwrite && fs.existsSync(dest)) {
    log(`  Skip: ${dest} (exists)`, COLORS.yellow);
    return false;
  }

  let content = fs.readFileSync(src, 'utf8');
  if (transform) {
    content = transform(content);
  }
  fs.writeFileSync(dest, content);
  log(`  Created: ${dest}`, COLORS.green);
  return true;
}

function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`  Created: ${dir}/`, COLORS.green);
    return true;
  }
  return false;
}

function init(targetDir, options = {}) {
  const { minimal = false, overwrite = false } = options;
  const kitDir = __dirname;

  log('\n╔════════════════════════════════════════════╗', COLORS.cyan);
  log('║         Ultrathink Kit Installer           ║', COLORS.cyan);
  log('╚════════════════════════════════════════════╝\n', COLORS.cyan);

  log(`Target: ${targetDir}`, COLORS.bright);
  log(`Mode: ${minimal ? 'Minimal (workflows only)' : 'Full'}`, COLORS.bright);
  log(`Overwrite: ${overwrite ? 'Yes' : 'No'}\n`, COLORS.bright);

  // 1. Create folder structure
  log('Creating folder structure...', COLORS.cyan);
  const folders = [
    '.agent/workflows',
    'current',
    'research',
    'ideation',
    'implementation planning',
    'testing/screenshots',
    'testing/transcripts',
    'walkthrough',
    'debugging',
  ];

  if (!minimal) {
    folders.push('tools', 'mcp', '.github/workflows');
  }

  folders.forEach(f => createDir(path.join(targetDir, f)));

  // 2. Copy workflows
  log('\nInstalling workflows...', COLORS.cyan);
  copyDir(
    path.join(kitDir, 'workflows'),
    path.join(targetDir, '.agent/workflows'),
    { overwrite }
  );

  // 3. Copy templates for current/
  log('\nCreating current state templates...', COLORS.cyan);
  copyDir(
    path.join(kitDir, 'templates/current'),
    path.join(targetDir, 'current'),
    { overwrite: false } // Never overwrite current state
  );

  if (!minimal) {
    // 4. Copy tools
    log('\nInstalling tools...', COLORS.cyan);
    copyDir(
      path.join(kitDir, 'tools'),
      path.join(targetDir, 'tools'),
      { overwrite }
    );

    // 5. Copy MCP server
    log('\nInstalling MCP server...', COLORS.cyan);
    copyDir(
      path.join(kitDir, 'mcp'),
      path.join(targetDir, 'mcp'),
      { overwrite, filter: (name) => !name.includes('node_modules') }
    );

    // 6. Create .mcp.json (with path placeholder)
    const mcpConfig = {
      mcpServers: {
        browser: {
          command: "node",
          args: ["{{PROJECT_ROOT}}/mcp/browser-server.js"]
        }
      }
    };

    const mcpPath = path.join(targetDir, '.mcp.json.template');
    if (!fs.existsSync(mcpPath) || overwrite) {
      fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
      log(`  Created: .mcp.json.template`, COLORS.green);
      log(`  Note: Rename to .mcp.json and update {{PROJECT_ROOT}}`, COLORS.yellow);
    }

    // 7. Copy CI workflows
    log('\nInstalling CI workflows...', COLORS.cyan);
    copyDir(
      path.join(kitDir, 'templates/github-workflows'),
      path.join(targetDir, '.github/workflows'),
      { overwrite }
    );
  }

  // 8. Create CLAUDE.md template if not exists
  log('\nChecking CLAUDE.md...', COLORS.cyan);
  copyFile(
    path.join(kitDir, 'templates/CLAUDE.md'),
    path.join(targetDir, 'CLAUDE.md'),
    { overwrite: false }
  );

  // Summary
  log('\n╔════════════════════════════════════════════╗', COLORS.green);
  log('║            Setup Complete!                 ║', COLORS.green);
  log('╚════════════════════════════════════════════╝', COLORS.green);

  log('\nNext steps:', COLORS.bright);
  log('  1. Review and customize CLAUDE.md for your project');
  log('  2. Update current/status.md with your initial state');
  if (!minimal) {
    log('  3. Rename .mcp.json.template to .mcp.json');
    log('  4. Update the path in .mcp.json to your project root');
    log('  5. Run: cd mcp && npm install');
    log('  6. Restart Claude Code to load MCP server');
  }
  log('\nAvailable workflows (use as /command in Claude Code):');
  log('  /ultrathink  - Master orchestrator');
  log('  /prioritize  - Score and prioritize tasks');
  log('  /research    - Create research document');
  log('  /ideate      - Create ideation document');
  log('  /plan        - Create implementation plan');
  log('  /test-plan   - Create test plan');
  log('  /visual-test - Run browser visual tests');
  log('  /debug       - Debug issues');
  log('  /walkthrough - Create user walkthrough');
  log('  /status      - Update project status');
  log('  /handoff     - Create handoff notes');
}

function update(targetDir, options = {}) {
  log('\n╔════════════════════════════════════════════╗', COLORS.cyan);
  log('║         Ultrathink Kit Updater             ║', COLORS.cyan);
  log('╚════════════════════════════════════════════╝\n', COLORS.cyan);

  log('Updating workflows (existing files will be overwritten)...', COLORS.yellow);

  copyDir(
    path.join(__dirname, 'workflows'),
    path.join(targetDir, '.agent/workflows'),
    { overwrite: true }
  );

  log('\nWorkflows updated!', COLORS.green);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];
const targetDir = process.cwd();

const flags = {
  minimal: args.includes('--minimal'),
  overwrite: args.includes('--overwrite') || args.includes('-f'),
};

switch (command) {
  case 'init':
    init(targetDir, flags);
    break;
  case 'update':
    update(targetDir, flags);
    break;
  default:
    log('Ultrathink Kit - Documentation-to-Implementation Workflow System\n', COLORS.bright);
    log('Usage:', COLORS.cyan);
    log('  npx ultrathink-kit init           # Full setup with tools & MCP');
    log('  npx ultrathink-kit init --minimal # Workflows only');
    log('  npx ultrathink-kit update         # Update workflows');
    log('  npx ultrathink-kit init -f        # Force overwrite existing');
    break;
}
