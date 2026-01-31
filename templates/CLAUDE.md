# Project Instructions

## Overview
{{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}

## Workflow
This project uses the **ultrathink workflow system**. Key principles:
1. Documentation before implementation
2. Research → Ideation → Plan → Test Plan → Implementation
3. Update `current/` folder at session start and end

## Commands
Use these slash commands to invoke workflows:
- `/ultrathink` - Master orchestrator (start here)
- `/prioritize` - Score and prioritize tasks
- `/research` - Create research document
- `/ideate` - Create ideation document
- `/plan` - Create implementation plan
- `/test-plan` - Create test plan
- `/visual-test` - Run browser visual tests
- `/debug` - Debug issues
- `/walkthrough` - Create user walkthrough
- `/status` - Update project status
- `/handoff` - Create handoff notes

## Folder Structure
```
.agent/workflows/   # Workflow definitions
current/            # Session state (status, todo, context, handoff)
research/           # Research documents
ideation/           # Design ideation documents
implementation planning/  # Implementation plans
testing/            # Test plans and results
walkthrough/        # User guides
debugging/          # Debug sessions
tools/              # Automation tools
mcp/                # MCP servers
```

## Guidelines
- Always read `current/status.md` at session start
- Update `current/todo.md` with task progress
- Create documentation before writing code
- Use visual tests for UI changes
- End sessions with handoff notes
