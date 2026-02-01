#!/usr/bin/env node
"use strict";

const http = require("http");
const https = require("https");
const { spawn } = require("child_process");

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

function postJson(urlString, token, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const body = JSON.stringify(payload);
    const options = {
      method: "POST",
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "X-Agent-Token": token,
      },
    };

    const client = url.protocol === "https:" ? https : http;
    const req = client.request(options, (res) => {
      res.on("data", () => {});
      res.on("end", () => resolve(res.statusCode));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function replacePlaceholders(command, replacements) {
  let result = command;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.split(key).join(value);
  });
  return result;
}

const args = parseArgs(process.argv.slice(2));
const command = args.command || process.env.AGENT_COMMAND;
const callbackUrl = args["callback-url"] || process.env.AGENT_CALLBACK_URL;
const token = args.token || process.env.AGENT_TOKEN || "";
const runId = args["run-id"] || process.env.AGENT_RUN_ID || "";
const prompt = args.prompt || process.env.AGENT_PROMPT || "";
const cwd = args.cwd || process.env.AGENT_CWD || process.cwd();

if (!command) {
  process.stderr.write("Missing --command or AGENT_COMMAND.\n");
  process.exit(1);
}
if (!callbackUrl) {
  process.stderr.write("Missing --callback-url or AGENT_CALLBACK_URL.\n");
  process.exit(1);
}

const replacements = {
  "{PROMPT}": prompt,
  "{STATUS_PATH}": process.env.AGENT_STATUS_PATH || "",
  "{WORKFLOW_PATH}": process.env.AGENT_WORKFLOW_PATH || "",
};

const finalCommand = replacePlaceholders(command, replacements);

const child = spawn(finalCommand, {
  cwd,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, AGENT_PROMPT: prompt },
});

child.on("exit", async (code, signal) => {
  const payload = {
    runId,
    exitCode: typeof code === "number" ? code : null,
    signal,
    completedAt: new Date().toISOString(),
  };
  try {
    await postJson(callbackUrl, token, payload);
  } catch (err) {
    process.stderr.write(`Callback failed: ${err.message}\n`);
  }
  process.exit(code ?? 1);
});

child.on("error", async (err) => {
  process.stderr.write(`Spawn failed: ${err.message}\n`);
  try {
    await postJson(callbackUrl, token, { runId, exitCode: 1, error: err.message });
  } catch (postErr) {
    process.stderr.write(`Callback failed: ${postErr.message}\n`);
  }
  process.exit(1);
});
