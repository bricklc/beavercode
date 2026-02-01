#!/usr/bin/env node
"use strict";

const http = require("http");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { spawn } = require("child_process");

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_PORT = 3487;
const DEFAULT_STATUS_PATH = "workflows/status.md";
const DEFAULT_WORKFLOW_PATH = "workflows/ultrathink.md";
const DEFAULT_LOCK_FILE = ".agent-loop.lock";
const DEFAULT_EXIT_FALLBACK_MS = 2000;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      args._.push(item);
      continue;
    }
    const key = item.slice(2);
    const value = argv[i + 1];
    if (value && !value.startsWith("--")) {
      args[key] = value;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function nowIso() {
  return new Date().toISOString();
}

function buildPrompt(statusPath, workflowPath) {
  return `check ${statusPath} and proceed using ${workflowPath} until all success metrics are met`;
}

function getArgOrEnv(args, key, envKey, fallback) {
  if (args[key] !== undefined) return args[key];
  if (process.env[envKey]) return process.env[envKey];
  return fallback;
}

function log(message) {
  process.stdout.write(`[agent-loop] ${message}\n`);
}

const args = parseArgs(process.argv.slice(2));
const cwd = path.resolve(getArgOrEnv(args, "cwd", "AGENT_CWD", process.cwd()));
const command = getArgOrEnv(args, "command", "AGENT_COMMAND", "");
if (!command) {
  process.stderr.write("Missing --command or AGENT_COMMAND.\n");
  process.exit(1);
}

const intervalMs = Number(getArgOrEnv(args, "interval", "AGENT_INTERVAL_MS", DEFAULT_INTERVAL_MS));
const port = Number(getArgOrEnv(args, "port", "AGENT_PORT", DEFAULT_PORT));
const statusPath = getArgOrEnv(args, "status", "AGENT_STATUS_PATH", DEFAULT_STATUS_PATH);
const workflowPath = getArgOrEnv(args, "workflow", "AGENT_WORKFLOW_PATH", DEFAULT_WORKFLOW_PATH);
const lockFile = path.resolve(cwd, getArgOrEnv(args, "lock-file", "AGENT_LOCK_FILE", DEFAULT_LOCK_FILE));
const exitFallbackMs = Number(
  getArgOrEnv(args, "exit-fallback-ms", "AGENT_EXIT_FALLBACK_MS", DEFAULT_EXIT_FALLBACK_MS)
);

const providedToken = getArgOrEnv(args, "token", "AGENT_TOKEN", "");
const token = providedToken || crypto.randomBytes(16).toString("hex");
const callbackPath = "/agent/done";
const callbackUrl = `http://127.0.0.1:${port}${callbackPath}`;
const prompt = getArgOrEnv(args, "prompt", "AGENT_PROMPT", buildPrompt(statusPath, workflowPath));
const runnerPath = path.resolve(__dirname, "agent-runner.js");
const useWrapper = args["no-wrap"] ? false : true;

let running = null;
let timeoutHandle = null;

function isPidAlive(pid) {
  if (!pid || Number.isNaN(Number(pid))) return false;
  try {
    process.kill(Number(pid), 0);
    return true;
  } catch (err) {
    return false;
  }
}

function readLock() {
  try {
    const raw = fs.readFileSync(lockFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeLock(lock) {
  try {
    fs.writeFileSync(lockFile, JSON.stringify(lock, null, 2));
  } catch (err) {
    log(`failed to write lock: ${err.message}`);
  }
}

function clearLock() {
  try {
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  } catch (err) {
    log(`failed to remove lock: ${err.message}`);
  }
}

function clearTimeoutHandle() {
  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
    timeoutHandle = null;
  }
}

function markDone(details) {
  if (!running) return;
  const finishedRun = running;
  running = null;
  clearTimeoutHandle();
  clearLock();
  const reason = details && details.reason ? details.reason : "callback";
  const exitCode = details && typeof details.exitCode === "number" ? details.exitCode : "unknown";
  log(
    `run ${finishedRun.runId} completed via ${reason} (exitCode=${exitCode}) at ${nowIso()}`
  );
}

function scheduleTimeout(runId) {
  if (!Number.isFinite(exitFallbackMs) || exitFallbackMs <= 0) return;
  clearTimeoutHandle();
  timeoutHandle = setTimeout(() => {
    if (!running || running.runId !== runId) return;
    markDone({ reason: "exit-fallback-timeout", exitCode: running.lastExitCode });
  }, exitFallbackMs);
}

function startRun() {
  if (running) return;
  const existingLock = readLock();
  if (existingLock && isPidAlive(existingLock.pid)) {
    log(`lock active for pid ${existingLock.pid}; backing off`);
    return;
  }
  if (existingLock) clearLock();

  const runId = crypto.randomBytes(8).toString("hex");
  const env = {
    ...process.env,
    AGENT_PROMPT: prompt,
    AGENT_STATUS_PATH: statusPath,
    AGENT_WORKFLOW_PATH: workflowPath,
    AGENT_CALLBACK_URL: callbackUrl,
    AGENT_RUN_ID: runId,
    AGENT_TOKEN: token,
  };

  const child = useWrapper
    ? spawn(process.execPath, [
        runnerPath,
        "--command",
        command,
        "--callback-url",
        callbackUrl,
        "--token",
        token,
        "--run-id",
        runId,
        "--prompt",
        prompt,
        "--cwd",
        cwd,
      ], { cwd, stdio: "inherit", env })
    : spawn(command, { cwd, stdio: "inherit", env, shell: true });

  running = {
    runId,
    startAt: Date.now(),
    pid: child.pid,
    lastExitCode: null,
  };
  writeLock({ pid: child.pid, runId, startedAt: nowIso() });

  log(`run ${runId} started (pid=${child.pid}) at ${nowIso()}`);

  child.on("exit", (code, signal) => {
    if (!running || running.runId !== runId) return;
    running.lastExitCode = code;
    if (!useWrapper) {
      markDone({ reason: "exit", exitCode: code, signal });
      return;
    }
    scheduleTimeout(runId);
  });

  child.on("error", (err) => {
    if (!running || running.runId !== runId) return;
    log(`run ${runId} spawn error: ${err.message}`);
    markDone({ reason: "spawn-error", exitCode: 1 });
  });
}

function loopTick() {
  if (running) {
    log(`run ${running.runId} still active; backing off`);
    return;
  }
  startRun();
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, running: !!running, runId: running?.runId || null }));
    return;
  }

  if (req.method === "POST" && req.url === callbackPath) {
    const requestToken = req.headers["x-agent-token"];
    if (requestToken !== token) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "invalid token" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => {
      let payload = {};
      try {
        payload = body ? JSON.parse(body) : {};
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "invalid json" }));
        return;
      }

      if (!running) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, ignored: true }));
        return;
      }

      if (payload.runId && payload.runId !== running.runId) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "runId mismatch" }));
        return;
      }

      markDone({ reason: "callback", exitCode: payload.exitCode });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "not found" }));
});

server.listen(port, "127.0.0.1", () => {
  log(`server listening on http://127.0.0.1:${port}`);
  log(`interval ${intervalMs}ms`);
  log(`prompt: ${prompt}`);
  log(`token: ${token}`);
  loopTick();
  setInterval(loopTick, intervalMs);
});
