---
description: Planning and ideation workflow without code execution or testing
---

# /planning-only - Design & Planning Mode

**Purpose**: Orchestrate ideation and planning workflows without executing code or tests.

## Constraints

**Allowed**: Read, Glob, Grep, Write (docs only), Update current/ files
**Blocked**: Edit, NotebookEdit, Bash (except Read-only), Tests, Commits

## Workflow

```
1. /status → Read current state
2. Project initialization check → conda env + git repo + requirements.txt (record in context)
3. /prioritize → Score the idea (proceed if ≥7)
4. /research → Optional if novel/architectural
5. /ideate → Design alternatives and trade-offs
6. /plan → Implementation roadmap with milestones
7. Validation gate → `python tools/validate_docs.py --ideation "<ideation-file>" --plan "<plan-file>"`
8. /test-plan → Test strategy (scenarios, not code)
9. /status → Update with handoff notes
```

## Decision Trees

**Need Research?** Novel approach OR external patterns OR architectural decision
**Need Full Ideation?** Multiple alternatives OR trade-offs OR score ≥7
**Need Detailed Plan?** Multi-file changes OR >3hr work OR complex integration

## Outputs

**Required**: current/status.md, current/todo.md, current/context.md (updated)
**Usually**: ideation/<name>-<date>-<instance>.md, implementation planning/<name>-<date>.md
**Sometimes**: research/<topic>-<date>.md, testing/<name>-<date>-plan.md
**Never**: Code files, test files, config changes

## Quick Reference

**Minimal**: Read current → Score → Plan → Update current
**Standard**: Read current → Score → Ideate → Plan → Update current
**Complex**: Read current → Score → Research → Ideate → Plan → Test Plan → Update current

---

**Philosophy**: Planning is investment, not waste. Think, explore, design first.
