---
description: Update current status and context tracking files
---

# /status - Status Management

**Purpose**: Update `current/` folder to maintain single source of truth for active work.

## When to Use

- At the start of a work session
- After completing a significant milestone
- Before context switch or handoff
- At the end of a work session

## Workflow

1. **Determine What to Update**
   - `status.md`: For phase/task/blocker changes
   - `todo.md`: For task prioritization changes
   - `context.md`: For session notes and decisions

2. **Read Current State First**
   - Review existing `current/status.md`
   - Review existing `current/todo.md`
   - Review existing `current/context.md`

3. **Update Relevant Files**
   - Update timestamps
   - Mark completed items
   - Add new items
   - Note blockers or changes

## Status.md Updates

**When to update**:
- Phase change (research → ideation → planning → implementation)
- New task started
- Blocker encountered or resolved
- Milestone completed

**What to update**:
```markdown
## Current Status

Last Updated: YYYY-MM-DD HH:MM
Updated By: [agent or session ID]

Active Phase: [Research | Ideation | Planning | Testing | Implementation]
Current Module: [module or feature name]
Current Task: [specific task description]
Blockers: [any blockers or "None"]
Recent Completions: [list of recently completed items]
Next Up: [what's coming next]
```

## Todo.md Updates

**When to update**:
- New task added
- Task completed
- Priority changed
- Task moved to backlog

**What to update**:
```markdown
## Priority Queue

Immediate:
- [ ] Task description → file/path
- [ ] Another urgent task → file/path

Next:
- [ ] Upcoming task → file/path

Backlog:
- [ ] Future task (Score: X.X) → file/path

Completed (keep history):
- [x] Completed task → file/path (YYYY-MM-DD)
```

## Context.md Updates

**When to update**:
- Key decision made
- Important discovery
- Unfinished thought to capture
- Session handoff

**What to update**:
```markdown
## Session Context

Date: YYYY-MM-DD
Session Focus: [main objective of this session]

Key Decisions:
- [Decision] → [rationale]
- [Another decision] → [reason]

Important Discoveries:
- [Finding that impacts the project]
- [Insight about architecture or approach]

Unfinished Thoughts:
- [Idea to revisit later]
- [Question to investigate]

Handoff Notes:
- [What the next session should know]
- [Where to pick up]
```

## Quick Commands

### Update Status Only
```markdown
Update current/status.md:
- Active Phase: [new phase]
- Current Task: [new task]
- Blockers: [any blockers or "None"]
```

### Mark Task Complete
```markdown
Update current/todo.md:
- Move "[task]" from "Immediate" to "Completed"
- Add completion date
- Update next immediate task
```

### Add Context Note
```markdown
Update current/context.md:
- Add to Key Decisions: [decision] → [rationale]
OR
- Add to Important Discoveries: [finding]
OR
- Add to Handoff Notes: [note]
```

## Best Practices

- **Always update timestamp** when making changes
- **Never delete history** - move to "Completed" instead
- **Be specific** - vague notes aren't helpful later
- **Link to docs** - reference files created/updated
- **Update regularly** - don't let status get stale

## Session Start Routine

When starting a new session:

1. **Read** `current/status.md` to understand where we are
2. **Read** `current/todo.md` to see priorities
3. **Read** `current/context.md` to get recent decisions
4. **Ask user** if priorities have changed
5. **Update** `status.md` with session start time and focus

## Session End Routine

When ending a session:

1. **Update** `status.md`:
   - Mark current progress
   - Note any blocker
   - List recent completions

2. **Update** `todo.md`:
   - Mark completed tasks
   - Adjust priorities if needed

3. **Update** `context.md`:
   - Document key decisions made
   - Note important discoveries
   - Add handoff notes for next session
   - Capture unfinished thoughts

4. **Link** to documentation created:
   - Research files
   - Ideation files
   - Plans, tests, walkthroughs, debug docs

## Integration with Other Workflows

- After `/research`, update status.md: Active Phase = "Ideation"
- After `/ideate`, update todo.md with priority score
- After `/plan`, update status.md: Active Phase = "Implementation"
- After `/test-plan`, update status.md: note test plan created
- After `/debug`, update context.md with findings
- After `/walkthrough`, mark feature complete in todo.md

## Example Flow

```markdown
# Start of session
Read current/status.md → Active Phase: "Planning"
Read current/todo.md → Immediate: Implement auth module
Read current/context.md → Decision to use JWT

# During session
Complete implementation plan
Update status.md: Active Phase = "Implementation"

Create ideation document
Update context.md: Key Decision = "Using bcrypt for hashing"

# End of session
Update status.md:
  - Recent Completions: Auth module implementation plan
  - Blockers: None
  - Next Up: Implement auth routes

Update todo.md:
  - [x] Create auth implementation plan → implementation planning/auth-2026-01-26.md
  - [ ] Implement auth routes → core/auth/routes.js (moved to Immediate)

Update context.md:
  - Handoff Notes: Ready to implement, all dependencies identified
```

## Next Steps

After updating status:
- Proceed with the current task
- If blocker exists, work to resolve it
- If phase complete, move to next phase in ultrathink cycle
