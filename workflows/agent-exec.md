---
description: Delegate a task to another agent via codex exec with prompt verification
---

# /agent-exec - Delegated Task Execution (codex exec)

**Purpose**: Send a well-scoped, validated task to another agent using `codex exec` with a short, structured prompt that ends in a saved output file.

## Output Location Policy

- Use a dedicated root folder: `agent-output/` (not under `workflows/`)
- Prompt files go in: `agent-output/prompts/`
- Result files go in: `agent-output/results/`

## When to Use

- You want to offload a focused task to another agent
- You need strict prompt structure and preflight verification
- You want deterministic, auditable delegation

## Step 1: Build the Task Spec (Pydantic Style)

Use this schema as your prompt backbone:

```python
class CodexExecTask(BaseModel):
    task_id: str
    target_agent: str
    role: str
    objective: str
    inputs: list[str]
    steps: list[str]
    success_metrics: list[str]
    output_file: str
    constraints: list[str]
    timebox_minutes: int | None = None
    tools_allowed: list[str] = []
    verification_plan: list[str] = []
```

Create a concrete instance in JSON (or YAML) to include in the prompt:

```json
{
  "task_id": "delegate-2026-02-04-01",
  "target_agent": "explorer",
  "role": "Codebase navigator",
  "objective": "Identify where configuration is loaded and document the flow.",
  "inputs": ["README.md", "bootstrap.js"],
  "steps": [
    "Locate configuration entry points",
    "Trace load order from entry to config",
    "Write a concise summary to the output file"
  ],
  "success_metrics": [
    "All entry points listed",
    "Load order described",
    "File paths cited"
  ],
  "output_file": "agent-output/results/01-config-flow.md",
  "constraints": ["No code changes", "Keep it brief", "Use the provided output path"],
  "timebox_minutes": 15,
  "tools_allowed": ["rg", "cat"],
  "verification_plan": ["Cross-check with two files"]
}
```

**Numbering rule**: Use a numbered filename in the output path (e.g., `agent-output/results/01-<topic>.md`) so the main agent can scan results in order.

## Step 2: Wrap the Prompt (Envelope)

```markdown
SYSTEM
You are a specialized agent. Follow the task spec exactly. Do not expand scope.

CONTEXT
<brief context and relevant repo info>

TASK SPEC (Pydantic JSON)
<insert JSON>

OUTPUT FORMAT
- Bullet list
- Include file paths inline
- End with: "CONFIRMED: Saved output to <output_file>"
```

## Step 3: Verification Layer (Preflight)

Run this checklist BEFORE sending the prompt:

**Prompt Verification Checklist**
1. All required fields are present and non-empty
2. Objective is singular and measurable
3. Inputs list only files/paths that exist
4. Steps are short, ordered, and feasible
5. Success metrics are verifiable and bullet-ready
6. Output file path is explicit and valid
7. Constraints prevent scope creep
8. No secrets or credentials included
9. Tools allowed are sufficient and minimal
10. Timebox (if set) is realistic

**Validator Output (must be produced)**

```text
VERIFICATION: PASS
missing_fields: []
invalid_fields: []
scope_risks: []
notes: <short justification>
```

If any check fails, revise the prompt and re-run verification until PASS.

## Step 4: Send via codex exec

1. Save the prompt to a file:
   `agent-output/prompts/<task_id>.md`
2. Ensure output folders exist:

```bash
mkdir agent-output\\prompts agent-output\\results
```
3. Execute by piping the prompt file to stdin (documented `PROMPT` = `-`):

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -
```

### Run in a separate terminal window (required)

Always use a new window so the delegated run is visible and does not block the main session.

Windows (Command Prompt opens a new window):

```bat
start "" cmd /k "type agent-output\\prompts\\<task_id>.md | codex exec -"
```

### codex exec flags (documented)

Use the minimum set needed for the task:

Global flags (apply to `codex exec` when placed after the subcommand):
- `--add-dir <path>`: grant additional write access roots (repeatable)
- `-a, --ask-for-approval <untrusted|on-failure|on-request|never>`: approval policy
- `-C, --cd <path>`: set workspace root before executing the task
- `-c, --config key=value`: inline config override (repeatable)
- `--dangerously-bypass-approvals-and-sandbox, --yolo`: bypass approvals + sandboxing (dangerous)
- `--full-auto`: low-friction preset (`workspace-write` + `on-request`)
- `-i, --image <path[,path...]>`: attach images to the initial prompt (repeatable)
- `-m, --model <name>`: override model (ex: `gpt-5-codex`)
- `--oss`: use local OSS provider (requires Ollama)
- `-p, --profile <name>`: config profile from `~/.codex/config.toml`
- `-s, --sandbox <read-only|workspace-write|danger-full-access>`: sandbox policy
- `--search`: enable live web search (sets `web_search = "live"`)

`codex exec` flags:
- `codex exec` (alias: `codex e`): run non-interactively
- `PROMPT` or `-`: initial instruction text or read from stdin
- `--color <always|never|auto>`: ANSI color control for stdout
- `--json` (or `--experimental-json`): emit newline-delimited JSON events to stdout
- `--output-schema <path>`: JSON Schema for final response validation
- `-o, --output-last-message <path>`: write final assistant message to a file
- `--skip-git-repo-check`: allow running outside a git repo
- `resume [SESSION_ID] [PROMPT|-]`, `resume --last`, `resume --all`: continue a prior exec session

### codex exec examples

Minimal run:

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -C . -
```

Force model + sandbox + approvals:

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -C . -m gpt-5-codex -s workspace-write -a on-request -
```

Write assistant output to a file (stdout only includes the final message; progress goes to stderr):

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -C . -o agent-output/results/<task_id>-result.md -
```

Pipe prompt via stdin:

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -
```

Structured output with JSON events:

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -C . --json -
```

Enforce a response schema:

```bash
Get-Content agent-output/prompts/<task_id>.md | codex exec -C . --output-schema tools/codex-output.schema.json -
```
## Step 5: Post-Execution Validation

After the delegated agent responds:

- Confirm the output file exists at the requested path
- Compare output to success metrics
- Capture any gaps as follow-up tasks
- Store response in `agent-output/results/<task_id>-result.md`

## Failure Modes and Recovery

- **Verification FAIL**: revise task spec and re-validate
- **Scope creep in output**: request a narrowed re-run
- **Missing deliverables**: re-issue with tighter acceptance criteria

## Notes

- Keep delegated tasks small and testable
- Prefer explicit file paths and expected outputs
- Do not include secrets in prompt or context

