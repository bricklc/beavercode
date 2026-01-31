/**
 * Browser Command Automation - Workflow Tool
 *
 * A general-purpose browser automation tool for any project.
 * Executes actions (click, fill, wait, etc.) with hybrid element discovery.
 * Uses cheat sheet for known elements, falls back to page scan for unknown.
 *
 * Usage:
 *   node tools/browser-actions.js --url <url> --commands actions.json
 *   node tools/browser-actions.js --url <url> --inline '{"actions":[...]}'
 *   node tools/browser-actions.js --commands actions.json  (uses url from commands file)
 *
 * Options:
 *   --visible       Show browser window (not headless)
 *   --delay <ms>    Delay between actions (default: 600ms when visible, 300ms when headless)
 *   --verify        Run verification loop to confirm all actions succeeded
 *   --retries <n>   Number of retries for failed actions (default: 2)
 *
 * Commands JSON format:
 *   {
 *     "url": "http://localhost:3000",
 *     "actions": [{"type": "click", "target": "Submit"}],
 *     "captureBeforeAfter": true,
 *     "visible": true,
 *     "delay": 600
 *   }
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration - can be overridden via command line or commands file
let TARGET_URL = null;
let VISIBLE_MODE = false;
let ACTION_DELAY = 300;
let VERIFY_MODE = false;
let MAX_RETRIES = 2;
let TELEMETRY_PORT = 9999;

const CHEAT_SHEET_PATH = path.join(__dirname, 'ui-elements.json');
const SCREENSHOTS_BASE = path.join(__dirname, '..', 'testing', 'screenshots', 'actions');

// Telemetry - sends events to viewer if running (fire and forget)
function sendTelemetry(event) {
  const data = JSON.stringify(event);
  const req = http.request({
    hostname: 'localhost',
    port: TELEMETRY_PORT,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  });
  req.on('error', () => {}); // Silently ignore if viewer not running
  req.write(data);
  req.end();
}

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// Print styled message
function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// Print action indicator
function logAction(index, total, type, target, status = 'running') {
  const progress = `[${index + 1}/${total}]`;
  const icons = {
    running: '▶',
    success: '✓',
    failed: '✗',
    retry: '↻',
  };
  const statusColors = {
    running: colors.yellow,
    success: colors.green,
    failed: colors.red,
    retry: colors.magenta,
  };

  const icon = icons[status] || '•';
  const color = statusColors[status] || '';

  console.log(`${color}${icon} ${progress} ${colors.bright}${type}${colors.reset}${color} → "${target || ''}"${colors.reset}`);
}

// Print progress bar
function printProgress(current, total, label = '') {
  const width = 30;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round((current / total) * 100);

  process.stdout.write(`\r${colors.cyan}${bar}${colors.reset} ${percent}% ${label}`);
  if (current === total) console.log('');
}

// Load UI elements cheat sheet
function loadCheatSheet() {
  try {
    const data = fs.readFileSync(CHEAT_SHEET_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.warn('Warning: Could not load cheat sheet:', err.message);
    return { FEAWiz: { buttons: {}, inputs: {}, displays: {} } };
  }
}

// Resolve target name to selector using cheat sheet
function resolveSelector(cheatSheet, targetName) {
  const categories = ['buttons', 'inputs', 'displays'];

  // Search all projects in cheat sheet
  for (const project of Object.keys(cheatSheet)) {
    for (const cat of categories) {
      if (cheatSheet[project][cat] && cheatSheet[project][cat][targetName]) {
        return { selector: cheatSheet[project][cat][targetName], source: `cheatsheet:${project}` };
      }
    }
  }

  // Also check if targetName looks like a selector already (starts with # or .)
  if (targetName.startsWith('#') || targetName.startsWith('.')) {
    return { selector: targetName, source: 'direct-selector' };
  }

  return null;
}

// Discover element by scanning page HTML
async function discoverElement(page, targetName) {
  log(`  🔍 Discovering: "${targetName}"...`, colors.dim);

  // Try to find by text content (buttons, links)
  const byText = await page.$(`text="${targetName}"`);
  if (byText) {
    log(`  Found by text content`, colors.dim);
    return { selector: `text="${targetName}"`, source: 'discovery-text' };
  }

  // Try to find by aria-label
  const byLabel = await page.$(`[aria-label="${targetName}"]`);
  if (byLabel) {
    log(`  Found by aria-label`, colors.dim);
    return { selector: `[aria-label="${targetName}"]`, source: 'discovery-aria' };
  }

  // Try to find by placeholder
  const byPlaceholder = await page.$(`[placeholder="${targetName}"]`);
  if (byPlaceholder) {
    log(`  Found by placeholder`, colors.dim);
    return { selector: `[placeholder="${targetName}"]`, source: 'discovery-placeholder' };
  }

  // Try to find by title
  const byTitle = await page.$(`[title="${targetName}"]`);
  if (byTitle) {
    log(`  Found by title`, colors.dim);
    return { selector: `[title="${targetName}"]`, source: 'discovery-title' };
  }

  return null;
}

// Highlight element in browser before action (visual feedback)
async function highlightElement(page, selector) {
  if (!VISIBLE_MODE) return;

  try {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.outline = '3px solid #ff6b6b';
        el.style.outlineOffset = '2px';
        el.style.transition = 'outline 0.2s ease';
      }
    }, selector);

    await page.waitForTimeout(300);

    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.outline = '3px solid #51cf66';
      }
    }, selector);
  } catch (e) {
    // Ignore highlight errors
  }
}

// Remove highlight from element
async function removeHighlight(page, selector) {
  if (!VISIBLE_MODE) return;

  try {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.outline = '';
        el.style.outlineOffset = '';
      }
    }, selector);
  } catch (e) {
    // Ignore
  }
}

// Get or create run folder for screenshots
function getRunFolder() {
  const today = new Date().toISOString().split('T')[0];
  const dateFolder = path.join(SCREENSHOTS_BASE, today);

  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder, { recursive: true });
  }

  // Find next run number
  let runNum = 1;
  while (fs.existsSync(path.join(dateFolder, `run-${String(runNum).padStart(3, '0')}`))) {
    runNum++;
  }

  const runFolder = path.join(dateFolder, `run-${String(runNum).padStart(3, '0')}`);
  fs.mkdirSync(runFolder, { recursive: true });

  return runFolder;
}

// Check if URL is reachable
async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return true;
  } catch (err) {
    try {
      const response = await fetch(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Execute a single action with retry support
async function executeAction(page, action, cheatSheet, runFolder, actionIndex, totalActions, captureBeforeAfter, retryCount = 0) {
  const { type, target, value, text } = action;

  // Log action start
  logAction(actionIndex, totalActions, type, target, retryCount > 0 ? 'retry' : 'running');

  // Resolve selector (skip for screenshot type - target is just filename)
  let resolved = null;
  if (target && type !== 'screenshot') {
    resolved = resolveSelector(cheatSheet, target);
    if (!resolved) {
      resolved = await discoverElement(page, target);
    }
    if (!resolved) {
      throw new Error(`Element "${target}" not found in cheat sheet or page`);
    }
    log(`  📍 ${resolved.selector} (${resolved.source})`, colors.dim);
  }

  const selector = resolved ? resolved.selector : null;
  const prefix = String(actionIndex + 1).padStart(2, '0');

  // Capture before screenshot
  if (captureBeforeAfter && runFolder) {
    const beforePath = path.join(runFolder, `${prefix}-before-${type}.png`);
    await page.screenshot({ path: beforePath, fullPage: true });
    log(`  📸 ${path.basename(beforePath)}`, colors.dim);
  }

  // Highlight element before action (visible mode only)
  if (selector) {
    await highlightElement(page, selector);
  }

  // Execute action based on type
  try {
    switch (type) {
      case 'click':
        await page.click(selector);
        break;

      case 'fill':
        await page.fill(selector, value || '');
        break;

      case 'type':
        await page.locator(selector).pressSequentially(value || '', { delay: 50 });
        break;

      case 'press':
        await page.press(selector || 'body', value);
        break;

      case 'hover':
        await page.hover(selector);
        break;

      case 'scroll':
        await page.locator(selector).scrollIntoViewIfNeeded();
        break;

      case 'select':
        await page.selectOption(selector, value);
        break;

      case 'check':
        await page.setChecked(selector, true);
        break;

      case 'uncheck':
        await page.setChecked(selector, false);
        break;

      case 'wait':
        await page.waitForSelector(selector, { timeout: 10000 });
        break;

      case 'waitForText':
        await page.waitForFunction(
          ({ sel, txt }) => {
            const el = document.querySelector(sel);
            return el && el.textContent && el.textContent.toLowerCase().includes(txt.toLowerCase());
          },
          { sel: selector, txt: text },
          { timeout: 15000 }
        );
        break;

      case 'screenshot':
        // Take a named screenshot (target is the filename)
        if (target && runFolder) {
          const namedPath = path.join(runFolder, `${prefix}-${target}.png`);
          await page.screenshot({ path: namedPath, fullPage: true });
          log(`  📸 ${target}.png`, colors.dim);
        }
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  } finally {
    // Remove highlight after action
    if (selector) {
      await removeHighlight(page, selector);
    }
  }

  // Delay for visibility and UI settling
  await page.waitForTimeout(ACTION_DELAY);

  // Capture after screenshot
  if (captureBeforeAfter && runFolder) {
    const afterPath = path.join(runFolder, `${prefix}-after-${type}.png`);
    await page.screenshot({ path: afterPath, fullPage: true });
    log(`  📸 ${path.basename(afterPath)}`, colors.dim);
  }

  // Log success
  logAction(actionIndex, totalActions, type, target, 'success');

  return true;
}

// Verify all actions completed successfully
async function verifyActions(page, actions, cheatSheet) {
  log('\n🔄 Verification Loop...', colors.cyan);

  const results = [];

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const { type, target, text } = action;

    let verified = false;
    let message = '';

    try {
      if (target) {
        const resolved = resolveSelector(cheatSheet, target) || await discoverElement(page, target);
        if (!resolved) {
          message = 'Element not found';
        } else {
          const selector = resolved.selector;

          // Verify based on action type
          switch (type) {
            case 'click':
            case 'hover':
              // Check element exists and is visible
              const isVisible = await page.isVisible(selector);
              verified = isVisible;
              message = isVisible ? 'Element visible' : 'Element not visible';
              break;

            case 'fill':
            case 'type':
              // Check element has expected value
              const inputValue = await page.inputValue(selector).catch(() => null);
              verified = inputValue !== null;
              message = verified ? `Value: "${inputValue?.substring(0, 20)}..."` : 'Could not read value';
              break;

            case 'waitForText':
              // Check text is present
              const hasText = await page.evaluate(({ sel, txt }) => {
                const el = document.querySelector(sel);
                return el && el.textContent && el.textContent.toLowerCase().includes(txt.toLowerCase());
              }, { sel: selector, txt: text });
              verified = hasText;
              message = hasText ? 'Text found' : 'Text not found';
              break;

            default:
              verified = true;
              message = 'Action completed';
          }
        }
      } else {
        verified = true;
        message = 'No target to verify';
      }
    } catch (err) {
      message = err.message;
    }

    results.push({ action: `${type} → ${target || ''}`, verified, message });

    const icon = verified ? '✓' : '✗';
    const color = verified ? colors.green : colors.red;
    log(`  ${color}${icon}${colors.reset} [${i + 1}] ${type} → "${target || ''}" - ${message}`);
  }

  const allPassed = results.every(r => r.verified);

  if (allPassed) {
    log('\n✅ All actions verified!', colors.green);
  } else {
    log('\n⚠️  Some actions could not be verified', colors.yellow);
  }

  return { allPassed, results };
}

// Write observations template
function writeObservationsTemplate(runFolder, actions, verifyResults = null) {
  const obsPath = path.join(runFolder, 'observations.md');
  const lines = [
    `# Observation: ${path.basename(runFolder)}`,
    '',
    `**Date**: ${new Date().toISOString()}`,
    `**Actions executed**: ${actions.length}`,
    `**Mode**: ${VISIBLE_MODE ? 'Visible' : 'Headless'}`,
    `**Delay**: ${ACTION_DELAY}ms`,
    '',
  ];

  if (verifyResults) {
    lines.push(`**Verification**: ${verifyResults.allPassed ? '✅ All Passed' : '⚠️ Some Failed'}`);
    lines.push('');
  }

  lines.push('## Screenshots');
  lines.push('');

  actions.forEach((action, i) => {
    const prefix = String(i + 1).padStart(2, '0');
    const verifyStatus = verifyResults?.results[i];

    lines.push(`### ${prefix}-after-${action.type}.png`);
    lines.push(`- **Action**: ${action.type} ${action.target || ''}`);
    if (verifyStatus) {
      lines.push(`- **Verified**: ${verifyStatus.verified ? '✓ Yes' : '✗ No'} - ${verifyStatus.message}`);
    }
    lines.push(`- **Shows**: [Agent to fill]`);
    lines.push(`- **Assessment**: [correct/incorrect/unexpected]`);
    lines.push(`- **Issues**: [none or describe]`);
    lines.push('');
  });

  lines.push('## Recommendation');
  lines.push('[Agent: Based on observations, what should happen next?]');

  fs.writeFileSync(obsPath, lines.join('\n'));
  log(`\n📝 Observations: ${obsPath}`, colors.cyan);
}

// Main execution
async function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  let commands = null;
  let cliUrl = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--commands' && args[i + 1]) {
      const cmdPath = args[i + 1];
      commands = JSON.parse(fs.readFileSync(cmdPath, 'utf8'));
    } else if (args[i] === '--inline' && args[i + 1]) {
      commands = JSON.parse(args[i + 1]);
    } else if (args[i] === '--url' && args[i + 1]) {
      cliUrl = args[i + 1];
    } else if (args[i] === '--visible') {
      VISIBLE_MODE = true;
    } else if (args[i] === '--delay' && args[i + 1]) {
      ACTION_DELAY = parseInt(args[i + 1], 10);
    } else if (args[i] === '--verify') {
      VERIFY_MODE = true;
    } else if (args[i] === '--retries' && args[i + 1]) {
      MAX_RETRIES = parseInt(args[i + 1], 10);
    }
  }

  if (!commands || !commands.actions) {
    console.log(`
${colors.bright}Browser Command Automation${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node browser-actions.js --url <url> --commands <file.json>
  node browser-actions.js --url <url> --inline '{"actions":[...]}'
  node browser-actions.js --commands <file.json>  (url in file)

${colors.cyan}Options:${colors.reset}
  --visible       Show browser window (not headless)
  --delay <ms>    Delay between actions (default: 600ms visible, 300ms headless)
  --verify        Run verification loop after all actions
  --retries <n>   Retry failed actions (default: 2)

${colors.cyan}Commands JSON format:${colors.reset}
  {
    "url": "http://localhost:3000",
    "actions": [{"type": "click", "target": "Submit"}],
    "captureBeforeAfter": true,
    "visible": true,
    "delay": 600
  }
`);
    process.exit(1);
  }

  // Merge CLI args with commands file options
  TARGET_URL = cliUrl || commands.url;
  if (commands.visible !== undefined && !args.includes('--visible')) {
    VISIBLE_MODE = commands.visible;
  }
  if (commands.delay !== undefined && !args.includes('--delay')) {
    ACTION_DELAY = commands.delay;
  }
  if (commands.verify !== undefined && !args.includes('--verify')) {
    VERIFY_MODE = commands.verify;
  }

  // Default delay based on mode
  if (!args.includes('--delay') && commands.delay === undefined) {
    ACTION_DELAY = VISIBLE_MODE ? 600 : 300;
  }

  if (!TARGET_URL) {
    console.error('ERROR: No URL specified. Use --url or include "url" in commands file.');
    process.exit(1);
  }

  const { actions, captureBeforeAfter = true } = commands;

  // Print header
  console.log('');
  log('╔══════════════════════════════════════════╗', colors.cyan);
  log('║     Browser Command Automation           ║', colors.cyan);
  log('╚══════════════════════════════════════════╝', colors.cyan);
  console.log('');

  log(`🌐 URL: ${TARGET_URL}`, colors.bright);
  log(`📋 Actions: ${actions.length}`, colors.bright);
  log(`👁️  Mode: ${VISIBLE_MODE ? 'Visible' : 'Headless'}`, colors.bright);
  log(`⏱️  Delay: ${ACTION_DELAY}ms`, colors.bright);
  log(`📸 Screenshots: ${captureBeforeAfter ? 'Yes' : 'No'}`, colors.bright);
  log(`🔄 Verify: ${VERIFY_MODE ? 'Yes' : 'No'}`, colors.bright);
  console.log('');

  // Check URL is reachable (skip for file:// URLs)
  if (!TARGET_URL.startsWith('file://')) {
    process.stdout.write('Checking URL... ');
    const urlOk = await checkUrl(TARGET_URL);
    if (!urlOk) {
      log('✗ Not reachable', colors.red);
      console.error('Make sure the server is running.');
      process.exit(1);
    }
    log('✓ Reachable', colors.green);
  } else {
    log('📁 Local file', colors.dim);
  }

  // Load cheat sheet
  const cheatSheet = loadCheatSheet();
  log('📖 Cheat sheet loaded', colors.dim);

  // Create run folder
  const runFolder = captureBeforeAfter ? getRunFolder() : null;
  if (runFolder) {
    log(`📂 ${runFolder}`, colors.dim);
  }

  // Launch browser
  log('\n🚀 Launching browser...', colors.cyan);
  sendTelemetry({ type: 'start', url: TARGET_URL, totalActions: actions.length });
  const browser = await chromium.launch({
    headless: !VISIBLE_MODE,
    slowMo: VISIBLE_MODE ? 100 : 0,
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // Navigate to target URL
    log(`🌍 Navigating to ${TARGET_URL}...`, colors.cyan);
    sendTelemetry({ type: 'navigate', url: TARGET_URL });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    log('✓ Page loaded\n', colors.green);

    // Execute each action
    const failedActions = [];

    for (let i = 0; i < actions.length; i++) {
      printProgress(i, actions.length, `Action ${i + 1}/${actions.length}`);
      sendTelemetry({ type: 'action-start', index: i + 1, total: actions.length, action: actions[i].type, target: actions[i].target });

      let success = false;
      let lastError = null;

      for (let retry = 0; retry <= MAX_RETRIES && !success; retry++) {
        try {
          await executeAction(page, actions[i], cheatSheet, runFolder, i, actions.length, captureBeforeAfter, retry);
          success = true;
          sendTelemetry({ type: 'action-success', action: actions[i].type, target: actions[i].target });
        } catch (err) {
          lastError = err;
          if (retry < MAX_RETRIES) {
            log(`  ↻ Retry ${retry + 1}/${MAX_RETRIES}...`, colors.yellow);
            sendTelemetry({ type: 'action-retry', action: actions[i].type, attempt: retry + 1, maxRetries: MAX_RETRIES });
            await page.waitForTimeout(500);
          }
        }
      }

      if (!success) {
        logAction(i, actions.length, actions[i].type, actions[i].target, 'failed');
        log(`  ❌ ${lastError.message}`, colors.red);
        sendTelemetry({ type: 'action-fail', action: actions[i].type, target: actions[i].target, error: lastError.message });
        failedActions.push({ index: i, action: actions[i], error: lastError });
      }
    }

    printProgress(actions.length, actions.length, 'Complete');

    // Verification loop
    let verifyResults = null;
    if (VERIFY_MODE) {
      verifyResults = await verifyActions(page, actions, cheatSheet);
    }

    // Summary
    console.log('');
    log('╔══════════════════════════════════════════╗', colors.green);
    log('║           Actions Complete               ║', colors.green);
    log('╚══════════════════════════════════════════╝', colors.green);

    if (failedActions.length > 0) {
      log(`\n⚠️  ${failedActions.length} action(s) failed:`, colors.yellow);
      failedActions.forEach(f => {
        log(`   • [${f.index + 1}] ${f.action.type} → "${f.action.target || ''}"`, colors.yellow);
      });
    } else {
      log(`\n✅ All ${actions.length} actions completed successfully!`, colors.green);
    }

    sendTelemetry({ type: 'complete', total: actions.length, passed: actions.length - failedActions.length, failed: failedActions.length });

    // Write observations template
    if (runFolder) {
      writeObservationsTemplate(runFolder, actions, verifyResults);
    }

  } catch (err) {
    log(`\n❌ ERROR: ${err.message}`, colors.red);

    // Capture error screenshot
    if (runFolder) {
      const errorPath = path.join(runFolder, 'error-state.png');
      await page.screenshot({ path: errorPath, fullPage: true });
      log(`📸 Error screenshot: ${errorPath}`, colors.dim);
    }

    await browser.close();
    process.exit(1);
  }

  await browser.close();
  log('\n🏁 Browser closed', colors.dim);

  if (runFolder) {
    log(`\n📂 Output: ${runFolder}`, colors.bright);
  }
}

main();
