#!/usr/bin/env node
/**
 * Browser MCP Server - Interactive browser automation for Claude Code
 *
 * Provides tools for navigate, screenshot, click, fill, type, scroll, press, get_elements
 * Uses Playwright with a persistent browser instance across calls.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';
import { z } from 'zod';

// Logging helper - must use stderr to avoid corrupting JSON-RPC on stdout
const log = (...args) => console.error('[browser-mcp]', ...args);

// Telemetry - send events to telemetry-viewer.js
const TELEMETRY_PORT = 9999;
async function emitTelemetry(event) {
  try {
    const http = await import('http');
    const data = JSON.stringify(event);
    const req = http.request({
      hostname: 'localhost',
      port: TELEMETRY_PORT,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    });
    req.on('error', () => {}); // Ignore if telemetry viewer not running
    req.write(data);
    req.end();
  } catch (e) { /* ignore */ }
}

// Browser state - lazy initialized, persistent across calls
let browser = null;
let page = null;

async function ensureBrowser() {
  // Check if browser exists and is still connected
  if (browser && !browser.isConnected()) {
    log('Browser disconnected, cleaning up...');
    browser = null;
    page = null;
  }

  // Check if page is still valid
  if (page) {
    try {
      await page.evaluate(() => true);
    } catch (e) {
      log('Page invalid, cleaning up...');
      browser = null;
      page = null;
    }
  }

  if (!browser) {
    log('Launching browser...');
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    log('Browser ready');
  }
  return page;
}

// Element discovery - find element by text, aria-label, placeholder, title, or selector
async function findElement(page, target) {
  // Direct selector (starts with #, ., or contains [)
  if (target.startsWith('#') || target.startsWith('.') || target.includes('[')) {
    const el = await page.$(target);
    if (el) return { selector: target, method: 'direct' };
  }

  // By visible text
  const byText = await page.$(`text="${target}"`);
  if (byText) return { selector: `text="${target}"`, method: 'text' };

  // By aria-label
  const byLabel = await page.$(`[aria-label="${target}"]`);
  if (byLabel) return { selector: `[aria-label="${target}"]`, method: 'aria-label' };

  // By placeholder
  const byPlaceholder = await page.$(`[placeholder="${target}"]`);
  if (byPlaceholder) return { selector: `[placeholder="${target}"]`, method: 'placeholder' };

  // By title
  const byTitle = await page.$(`[title="${target}"]`);
  if (byTitle) return { selector: `[title="${target}"]`, method: 'title' };

  // By name attribute
  const byName = await page.$(`[name="${target}"]`);
  if (byName) return { selector: `[name="${target}"]`, method: 'name' };

  // By id (without #)
  const byId = await page.$(`#${target}`);
  if (byId) return { selector: `#${target}`, method: 'id' };

  return null;
}

// Tool definitions
const tools = [
  {
    name: 'navigate',
    description: 'Navigate to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' }
      },
      required: ['url']
    }
  },
  {
    name: 'screenshot',
    description: 'Capture a screenshot of the current page. Returns base64 PNG image.',
    inputSchema: {
      type: 'object',
      properties: {
        fullPage: { type: 'boolean', description: 'Capture full scrollable page (default: false)' }
      }
    }
  },
  {
    name: 'click',
    description: 'Click an element by text content, aria-label, placeholder, title, or CSS selector',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Element text, aria-label, placeholder, title, or selector' }
      },
      required: ['target']
    }
  },
  {
    name: 'fill',
    description: 'Fill an input field with text (clears existing content)',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Input element text, aria-label, placeholder, or selector' },
        value: { type: 'string', description: 'Text to fill' }
      },
      required: ['target', 'value']
    }
  },
  {
    name: 'type',
    description: 'Type text character by character (useful for inputs that need keystroke events)',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Element to type into' },
        value: { type: 'string', description: 'Text to type' },
        delay: { type: 'number', description: 'Delay between keystrokes in ms (default: 50)' }
      },
      required: ['target', 'value']
    }
  },
  {
    name: 'scroll',
    description: 'Scroll the page or an element into view',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Element to scroll into view (optional - scrolls page if omitted)' },
        direction: { type: 'string', enum: ['up', 'down'], description: 'Scroll direction for page scroll' },
        amount: { type: 'number', description: 'Pixels to scroll (default: 300)' }
      }
    }
  },
  {
    name: 'press',
    description: 'Press a keyboard key (Enter, Tab, Escape, ArrowDown, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Key to press (e.g., Enter, Tab, Escape, ArrowDown)' },
        target: { type: 'string', description: 'Element to focus before pressing (optional)' }
      },
      required: ['key']
    }
  },
  {
    name: 'get_elements',
    description: 'List interactive elements on the page (buttons, links, inputs, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector to filter elements (default: all interactive)' }
      }
    }
  }
];

// Tool handlers
async function handleNavigate({ url }) {
  await emitTelemetry({ type: 'action-start', action: 'navigate', target: url });
  const p = await ensureBrowser();
  log(`Navigating to: ${url}`);
  await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const title = await p.title();
  await emitTelemetry({ type: 'action-success', action: 'navigate', message: title });
  return { content: [{ type: 'text', text: `Navigated to ${url}\nPage title: ${title}` }] };
}

async function handleScreenshot({ fullPage = false }) {
  await emitTelemetry({ type: 'action-start', action: 'screenshot', target: fullPage ? 'fullPage' : 'viewport' });
  const p = await ensureBrowser();
  log('Taking screenshot...');
  const buffer = await p.screenshot({ fullPage });
  const base64 = buffer.toString('base64');
  await emitTelemetry({ type: 'action-success', action: 'screenshot', message: 'captured' });
  return {
    content: [{
      type: 'image',
      data: base64,
      mimeType: 'image/png'
    }]
  };
}

async function handleClick({ target }) {
  await emitTelemetry({ type: 'action-start', action: 'click', target });
  const p = await ensureBrowser();
  const found = await findElement(p, target);
  if (!found) {
    await emitTelemetry({ type: 'action-fail', action: 'click', error: `Element not found: ${target}` });
    return { content: [{ type: 'text', text: `Error: Could not find element "${target}"` }], isError: true };
  }
  await emitTelemetry({ type: 'resolved', selector: found.selector, source: found.method });
  log(`Clicking: ${found.selector} (found by ${found.method})`);
  await p.click(found.selector);
  await emitTelemetry({ type: 'action-success', action: 'click', message: `by ${found.method}` });
  return { content: [{ type: 'text', text: `Clicked "${target}" (found by ${found.method})` }] };
}

async function handleFill({ target, value }) {
  await emitTelemetry({ type: 'action-start', action: 'fill', target });
  const p = await ensureBrowser();
  const found = await findElement(p, target);
  if (!found) {
    await emitTelemetry({ type: 'action-fail', action: 'fill', error: `Element not found: ${target}` });
    return { content: [{ type: 'text', text: `Error: Could not find element "${target}"` }], isError: true };
  }
  log(`Filling: ${found.selector} with "${value.substring(0, 20)}..."`);
  await p.fill(found.selector, value);
  await emitTelemetry({ type: 'action-success', action: 'fill', message: `${value.length} chars` });
  return { content: [{ type: 'text', text: `Filled "${target}" with "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"` }] };
}

async function handleType({ target, value, delay = 50 }) {
  await emitTelemetry({ type: 'action-start', action: 'type', target });
  const p = await ensureBrowser();
  const found = await findElement(p, target);
  if (!found) {
    await emitTelemetry({ type: 'action-fail', action: 'type', error: `Element not found: ${target}` });
    return { content: [{ type: 'text', text: `Error: Could not find element "${target}"` }], isError: true };
  }
  log(`Typing into: ${found.selector}`);
  await p.locator(found.selector).pressSequentially(value, { delay });
  await emitTelemetry({ type: 'action-success', action: 'type', message: `${value.length} chars` });
  return { content: [{ type: 'text', text: `Typed "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}" into "${target}"` }] };
}

async function handleScroll({ target, direction, amount = 300 }) {
  await emitTelemetry({ type: 'action-start', action: 'scroll', target: target || direction || 'down' });
  const p = await ensureBrowser();

  if (target) {
    const found = await findElement(p, target);
    if (!found) {
      await emitTelemetry({ type: 'action-fail', action: 'scroll', error: `Element not found: ${target}` });
      return { content: [{ type: 'text', text: `Error: Could not find element "${target}"` }], isError: true };
    }
    log(`Scrolling element into view: ${found.selector}`);
    await p.locator(found.selector).scrollIntoViewIfNeeded();
    await emitTelemetry({ type: 'action-success', action: 'scroll', message: 'into view' });
    return { content: [{ type: 'text', text: `Scrolled "${target}" into view` }] };
  } else {
    const delta = direction === 'up' ? -amount : amount;
    log(`Scrolling page: ${delta}px`);
    await p.evaluate((d) => window.scrollBy(0, d), delta);
    await emitTelemetry({ type: 'action-success', action: 'scroll', message: `${delta}px` });
    return { content: [{ type: 'text', text: `Scrolled page ${direction || 'down'} ${amount}px` }] };
  }
}

async function handlePress({ key, target }) {
  await emitTelemetry({ type: 'action-start', action: 'press', target: key });
  const p = await ensureBrowser();

  if (target) {
    const found = await findElement(p, target);
    if (!found) {
      await emitTelemetry({ type: 'action-fail', action: 'press', error: `Element not found: ${target}` });
      return { content: [{ type: 'text', text: `Error: Could not find element "${target}"` }], isError: true };
    }
    log(`Pressing ${key} on: ${found.selector}`);
    await p.press(found.selector, key);
  } else {
    log(`Pressing ${key}`);
    await p.keyboard.press(key);
  }
  await emitTelemetry({ type: 'action-success', action: 'press', message: key });
  return { content: [{ type: 'text', text: `Pressed "${key}"${target ? ` on "${target}"` : ''}` }] };
}

async function handleGetElements({ selector }) {
  await emitTelemetry({ type: 'action-start', action: 'get_elements', target: selector || 'interactive' });
  const p = await ensureBrowser();

  // Default selector for interactive elements
  const sel = selector || 'button, a, input, select, textarea, [role="button"], [onclick], [tabindex]';
  log(`Getting elements: ${sel}`);

  const elements = await p.evaluate((s) => {
    const els = document.querySelectorAll(s);
    return Array.from(els).slice(0, 50).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 50) || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        placeholder: el.getAttribute('placeholder') || '',
        id: el.id || '',
        name: el.getAttribute('name') || '',
        type: el.getAttribute('type') || '',
        visible: rect.width > 0 && rect.height > 0,
        position: { x: Math.round(rect.x), y: Math.round(rect.y) }
      };
    });
  }, sel);

  const visibleCount = elements.filter(e => e.visible).length;
  await emitTelemetry({ type: 'action-success', action: 'get_elements', message: `${elements.length} found` });
  return {
    content: [{
      type: 'text',
      text: `Found ${elements.length} elements (${visibleCount} visible):\n\n${JSON.stringify(elements, null, 2)}`
    }]
  };
}

// Main server setup
const server = new Server(
  { name: 'browser', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'navigate':
        return await handleNavigate(args);
      case 'screenshot':
        return await handleScreenshot(args || {});
      case 'click':
        return await handleClick(args);
      case 'fill':
        return await handleFill(args);
      case 'type':
        return await handleType(args);
      case 'scroll':
        return await handleScroll(args || {});
      case 'press':
        return await handlePress(args);
      case 'get_elements':
        return await handleGetElements(args || {});
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    log(`Error in ${name}:`, error.message);
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

// Cleanup on exit
process.on('SIGINT', async () => {
  log('Shutting down...');
  if (browser) await browser.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('Shutting down...');
  if (browser) await browser.close();
  process.exit(0);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Browser MCP server running');
}

main().catch((error) => {
  log('Failed to start server:', error);
  process.exit(1);
});
