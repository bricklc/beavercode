# Beavercode

A complete documentation-to-implementation workflow system for Claude Code projects.

## Philosophy

> *"We're not here to write code. We're here to make a dent in the universe."*

Beavercode enforces a disciplined workflow:
1. **Think Different** - Question every assumption
2. **Obsess Over Details** - Study the codebase like a masterpiece
3. **Plan Like Da Vinci** - Architect before implementing
4. **Craft, Don't Code** - Every function should sing
5. **Iterate Relentlessly** - First version is never good enough
6. **Simplify Ruthlessly** - Elegance through subtraction

## Quick Start

```bash
# In your project directory
npx beavercode init

# Or via GitHub
npx github:bricklc/beavercode init

# Minimal install (workflows only, no tools/MCP)
npx beavercode init --minimal

# Update workflows later
npx beavercode update
```

## What Gets Installed

### Full Install (default)
```
your-project/
├── .agent/
│   └── workflows/        # All workflow definitions
│       ├── ultrathink.md
│       ├── prioritize.md
│       ├── research.md
│       ├── ideate.md
│       ├── plan.md
│       ├── test-plan.md
│       ├── visual-test.md
│       ├── debug.md
│       ├── walkthrough.md
│       └── ...
├── current/              # Session state
│   ├── status.md
│   ├── todo.md
│   ├── context.md
│   └── handoff.md
├── research/             # Research documents
├── ideation/             # Design documents
├── implementation planning/
├── testing/
│   ├── screenshots/
│   └── transcripts/
├── walkthrough/
├── debugging/
├── tools/                # Automation tools
│   ├── browser-actions.js
│   ├── telemetry-viewer.js
│   └── ui-elements.template.json
├── mcp/                  # MCP servers
│   ├── browser-server.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── visual-test.yml
├── .mcp.json.template    # MCP config template
└── CLAUDE.md             # Project instructions
```

### Minimal Install
Only `.agent/workflows/` and `current/` folders.

## Post-Install Setup

### 1. Configure CLAUDE.md
Edit `CLAUDE.md` with your project-specific instructions.

### 2. Set Up MCP Server (Full Install)
```bash
# Install MCP dependencies
cd mcp && npm install

# Configure MCP
mv .mcp.json.template .mcp.json
# Edit .mcp.json - update the path to your project root:
# "args": ["/path/to/your/project/mcp/browser-server.js"]

# Restart Claude Code to load MCP
```

### 3. Initialize Session State
Update `current/status.md` with your project's current state.

## Workflows

### Master Orchestrator
```
/ultrathink
```
The main workflow that orchestrates all others. Start here for any significant task.

### Task Management
```
/prioritize    # Score tasks using Impact × Urgency / Effort
/status        # Update project status
/handoff       # Create session handoff notes
```

### Documentation Cycle
```
/research      # Create research document
/ideate        # Create ideation/design document
/plan          # Create implementation plan
/test-plan     # Create test plan
```

### Implementation & Testing
```
/visual-test   # Run browser visual tests
/debug         # Debug issues
/walkthrough   # Create user guide
```

## Visual Testing

Browser automation tools for visual testing included.

### Setup
```bash
npm install playwright
npx playwright install chromium
```

### Create Test Commands
```json
{
  "url": "http://localhost:3000",
  "actions": [
    { "type": "click", "target": "Submit" },
    { "type": "waitForText", "target": "#status", "text": "Success" },
    { "type": "screenshot", "target": "final-state" }
  ],
  "captureBeforeAfter": true,
  "visible": true
}
```

### Run Tests
```bash
node tools/browser-actions.js --commands test-commands.json --visible
```

## MCP Server

Browser MCP server provides these tools to Claude Code:
- `navigate`, `click`, `fill`, `type`, `scroll`, `press`, `screenshot`, `get_elements`

### Telemetry
```bash
node tools/telemetry-viewer.js
```

## CI Integration

GitHub Actions workflow included for visual tests. Screenshots uploaded as artifacts.

## Updating

```bash
npx beavercode update
```

Updates `.agent/workflows/` files only.

## License

MIT
