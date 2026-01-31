---
description: Create a fast, reliable baton-pass for next session
---

# /handoff - Baton Pass Workflow

**Purpose**: Make session transfers fast and unambiguous (<5 minutes).

## When to Use

- End of a session
- Before a context switch
- When handing off to another agent or human

## Workflow

1. **State Snapshot**
   - Update `current/status.md` with phase, task, blockers, next up
   - Update `current/todo.md` (Immediate/Next/Backlog)
   - Update `current/context.md` with decisions + discoveries + unfinished thoughts

2. **Evidence Bundle**
   - Store screenshots in `testing/screenshots/<area>/<yyyy-mm-dd>/<run-id>/`
   - Link evidence in test plans or walkthroughs

3. **Quick Repro**
   - Add a “Quick Repro” block to the relevant test plan:
     - Commands run
     - Inputs used
     - Expected outputs

4. **Validation Gate**
   - Run: `python tools/validate_docs.py --ideation "<ideation-file>" --plan "<plan-file>"`
   - Record pass/fail with timestamp in `current/context.md`

5. **Handoff Note**
   - Create or update `current/handoff.md`:
     - Do Now (single action the next instance must start with)
     - What’s blocked
     - What should not change
     - Links to critical docs

6. **Manual Testing Gate (Required)**
   - Check for any manual test steps in `testing/` or `walkthrough/`
   - If manual steps remain, record them in `current/handoff.md` and STOP
   - Do not proceed to commit or further automation until manual steps are confirmed

7. **Git Status Check (Required)**
   - Run `git status --short`
   - Run `git diff --stat` (or `git diff --name-only` if stat is empty)
   - Record any uncommitted changes in `current/handoff.md` with file list and brief summary
   - Treat any unaccounted code changes as a blocker until documented

8. **Commit Etiquette**
   - If success metrics met: commit with summary + doc references
   - If not: no commit; document why in `current/handoff.md`

9. **Restart Loop**
   - After handoff, the next instance MUST restart the full workflow:
     - Begin at `/status`, then follow `/ultrathink` (or `/planning-only` as applicable)
   - Treat the handoff as a fresh session with mandatory gate checks

## Template (handoff.md)

```markdown
# Handoff

Date: YYYY-MM-DD HH:MM
Owner: [Agent/Human]
Session Focus: [short summary]

## Do Now
- [Single most important next action]

## Blockers
- [Blocker or "None"]

## Do Not Change
- [Sensitive files or decisions]

## Critical Links
- Plan: `implementation planning/<file>.md`
- Tests: `testing/<file>.md`
- Walkthrough: `walkthrough/<file>.md`
- Evidence: `testing/screenshots/<path>/`

## Notes
- [Additional context for the next session]
```
