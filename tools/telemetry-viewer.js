#!/usr/bin/env node
/**
 * Telemetry Viewer - Displays browser-actions events in real-time
 * Run this in a separate terminal before starting browser tests
 *
 * Usage: node tools/telemetry-viewer.js [--port 9999]
 */

const http = require('http');

const PORT = parseInt(process.argv.find((_, i, arr) => arr[i - 1] === '--port') || '9999');

// ANSI colors
const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

function formatEvent(event) {
  const time = new Date().toLocaleTimeString();
  const timeStr = `${c.dim}[${time}]${c.reset}`;

  switch (event.type) {
    case 'start':
      return `\n${c.cyan}${'='.repeat(50)}${c.reset}\n` +
             `${timeStr} ${c.bold}${c.cyan}SESSION START${c.reset}\n` +
             `${c.dim}URL:${c.reset} ${event.url}\n` +
             `${c.dim}Actions:${c.reset} ${event.totalActions}\n` +
             `${c.cyan}${'='.repeat(50)}${c.reset}`;

    case 'navigate':
      return `${timeStr} ${c.blue}NAVIGATE${c.reset} ${event.url}`;

    case 'action-start':
      const icon = { click: '👆', fill: '⌨️', screenshot: '📸', wait: '⏳', waitForText: '🔍' }[event.action] || '▶';
      return `${timeStr} ${c.yellow}[${event.index}/${event.total}]${c.reset} ${icon} ${c.bold}${event.action}${c.reset} → ${event.target || ''}`;

    case 'action-success':
      return `${timeStr} ${c.green}  ✓ ${event.action}${c.reset} ${event.message || ''}`;

    case 'action-fail':
      return `${timeStr} ${c.red}  ✗ ${event.action}${c.reset} ${event.error}`;

    case 'action-retry':
      return `${timeStr} ${c.magenta}  ↻ Retry ${event.attempt}/${event.maxRetries}${c.reset}`;

    case 'screenshot':
      return `${timeStr} ${c.dim}  📸 ${event.filename}${c.reset}`;

    case 'discover':
      return `${timeStr} ${c.dim}  🔍 Discovering "${event.target}"...${c.reset}`;

    case 'resolved':
      return `${timeStr} ${c.dim}  📍 ${event.selector} (${event.source})${c.reset}`;

    case 'complete':
      const bar = event.passed === event.total ? c.green : c.yellow;
      return `\n${c.cyan}${'='.repeat(50)}${c.reset}\n` +
             `${timeStr} ${c.bold}SESSION COMPLETE${c.reset}\n` +
             `${bar}Result: ${event.passed}/${event.total} passed${c.reset}\n` +
             `${c.cyan}${'='.repeat(50)}${c.reset}\n`;

    default:
      return `${timeStr} ${c.dim}${JSON.stringify(event)}${c.reset}`;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        console.log(formatEvent(event));
      } catch (e) {
        console.log(`${c.dim}[raw]${c.reset} ${body}`);
      }
      res.writeHead(200);
      res.end('ok');
    });
  } else {
    res.writeHead(200);
    res.end('Telemetry viewer running');
  }
});

server.listen(PORT, () => {
  console.log(`${c.cyan}╔══════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.cyan}║     Telemetry Viewer                     ║${c.reset}`);
  console.log(`${c.cyan}╚══════════════════════════════════════════╝${c.reset}`);
  console.log(`${c.dim}Listening on port ${PORT}...${c.reset}`);
  console.log(`${c.dim}Waiting for browser-actions events...${c.reset}\n`);
});
