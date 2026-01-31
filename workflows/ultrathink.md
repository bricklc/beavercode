---
description: Master orchestrator - Complete documentation cycle before implementation (Ultrathink Philosophy)
---

# /ultrathink - Master Documentation-to-Implementation Orchestrator

**Philosophy**: "*We're not here to write code. We're here to make a dent in the universe.*"

This workflow ensures we follow the ultrathink principles:
1. **Think Different** - Question every assumption
2. **Obsess Over Details** - Study the codebase like a masterpiece  
3. **Plan Like Da Vinci** - Architect before implementing
4. **Craft, Don't Code** - Every function should sing
5. **Iterate Relentlessly** - First version is never good enough
6. **Simplify Ruthlessly** - Elegance through subtraction

## Workflow Phases

### Phase 1: Discovery & Context Gathering

1. **Read Current State**
   - Review `current/status.md` to understand active phase
   - Review `current/todo.md` to see prioritized tasks
   - Review `current/context.md` for recent session decisions

2. **Project Initialization Gate (first-time setup only)**
   - Ensure a conda environment is created and activated for the project
   - Ensure the repo is initialized with git before any `/plan` documents are created
   - Ensure a `requirements.txt` (or equivalent) exists for the new environment
   - Record environment name and git status in `current/context.md`

3. **Assess Request Scope**
   - Is this a new feature request?
   - Is this a bug fix or refinement?
   - Is this exploratory research?
   - Classify the work type: **Spike**, **Feature**, **Bug**, **Refactor**, **Research**

### Phase 2: Sequential Thinking & Prioritization

4. **Use Sequential Thinking** (invoke `mcp_sequential-thinking_sequentialthinking`)
   - Break down the problem into thought steps
   - Question assumptions about the approach
   - Generate a hypothesis for the solution
   - Verify the hypothesis against requirements
   - Revise thinking as new insights emerge

5. **Score Against Rubric** (use MoSCoW + Impact Matrix)
   - **Priority Score = (Impact × Urgency) / Effort**
   - Impact (1-10): How much does this move the needle?
   - Urgency (1-10): How time-sensitive is this?
   - Effort (1-10): How complex is the implementation?
   
   **Decision Matrix**:
   - Score ≥ 7: **NOW** - Immediate priority queue
   - Score 4-6: **NEXT** - Next sprint/iteration
   - Score 1-3: **BACKLOG** - Good ideas, not urgent
   - Score < 1: **REJECT** - Document reason and archive

6. **Document Prioritization Decision**
   - Update `current/todo.md` with scoring rationale
   - If backlogged, note in `ideation/` with waitlist marker

### Phase 3: Documentation Cycle (PRE-IMPLEMENTATION)

**CRITICAL**: Do NOT proceed to implementation until all relevant docs are created/updated.

7. **Research Phase** (invoke `/research` if needed)
   - Is there prior art we should study?
   - What patterns exist in the codebase?
   - What external sources inform this work?
   - Create `research/<topic>-<date>.md`

8. **Ideation Phase** (invoke `/ideate`)
   - Document the design vision
   - List alternatives and trade-offs
   - Review related ideas in existing ideation files
   - Mark rejected alternatives with reasons
   - Capture waitlisted ideas for future
   - Create `ideation/<idea-name>-<date>-<instance>.md`

9. **Architecture Planning** (invoke `/plan`)
   - Define scope boundaries (what's IN, what's OUT)
   - List success metrics (how do we know it works?)
   - Identify dependencies (what must exist first?)
   - Document risks & mitigations
   - Break into milestones with verification steps
   - Create `implementation planning/<feature>-<date>.md`

10. **Validation Gate** (required before test planning)
   - Run: `python tools/validate_docs.py --ideation "<ideation-file>" --plan "<plan-file>"`
   - If validation fails, fix the docs and re-run until it passes

11. **Test Planning** (invoke `/test-plan`)
   - Define test cases BEFORE coding
   - Specify preconditions, steps, expected outcomes
   - Plan for edge cases and failure modes
   - Create `testing/<feature>-<date>-01.md`

### Phase 4: Review & Approval Gate

12. **Documentation Review Checkpoint**
    - **STOP**: Have we completed all relevant documentation?
    - **ASK USER**: "I've prepared the following documentation. Should we proceed to implementation, or do you want to review/revise first?"
      - Research: `[link]`
      - Ideation: `[link]`
      - Plan: `[link]`
      - Tests: `[link]`
    
13. **Wait for User Approval**
    - If user requests revisions, loop back to relevant phase
    - If user approves, proceed to implementation

### Phase 5: Implementation (POST-APPROVAL)

14. **Execute Implementation Plan**
    - Follow the milestones from planning doc
    - Reference the ideation for design decisions
    - Keep the plan open as checklist
    - Mark tasks complete as you go

15. **Run Tests**
    - Execute test plan from `testing/` folder
    - Document results in test file
    - If failures occur, invoke `/debug`

16. **Visual Testing** (invoke `/visual-test` if UI changes involved)
    - Update `tools/ui-elements.json` with new elements
    - Create test commands for UI workflows
    - Run: `node tools/browser-actions.js --commands <test>.json`
    - Read captured screenshots
    - Fill `observations.md` with findings
    - If visual issues found, invoke `/debug`

    **When to run visual tests**:
    - Frontend code was modified
    - UI acceptance criteria need verification
    - Visual regression check needed
    - Bug fix affects UI state

17. **Create Walkthrough** (invoke `/walkthrough` if needed)
    - For new features, create user-facing guide
    - Document how to use the new functionality
    - Create `walkthrough/<topic>-<date>-v1.md`

### Phase 6: Close the Loop

18. **Update Current State**
    - Mark completed tasks in `current/todo.md`
    - Update `current/status.md` with new active phase
    - Update `current/context.md` with key decisions and handoff notes

19. **Verification**
    - Does the implementation match the plan?
    - Are all test cases passing?
    - Are visual tests passing (if UI involved)?
    - Is documentation up to date?

20. **Handoff Summary**
    - Provide summary of what was accomplished
    - Link to all created/updated documentation
    - Link to visual test screenshots (if applicable)
    - Note any deferred items or discoveries
    - If success metrics are met, create a git commit documenting completion

## Scoring Rubric Details

### Impact Assessment (1-10)
- **10**: Mission-critical, transforms core user experience
- **7-9**: Major feature, significant UX improvement
- **4-6**: Moderate improvement, nice-to-have feature
- **1-3**: Minor enhancement, convenience feature

### Urgency Assessment (1-10)
- **10**: Blocking production, critical path dependency
- **7-9**: Needed for upcoming milestone/release
- **4-6**: Should have soon, but not blocking
- **1-3**: Someday/maybe, opportunistic work

### Effort Assessment (1-10)
- **10**: Months of work, major architectural change
- **7-9**: Weeks of work, complex integration
- **4-6**: Days of work, medium complexity
- **1-3**: Hours of work, simple change

## Project Management Terms

- **Spike**: Time-boxed research to reduce uncertainty
- **Epic**: Large body of work broken into stories
- **Story**: User-facing feature or capability
- **Task**: Specific technical work item
- **Backlog**: Prioritized list of work items
- **Sprint**: Time-boxed iteration (if applicable)
- **WIP (Work in Progress)**: Currently active work
- **Blocker**: Issue preventing progress
- **Acceptance Criteria**: Definition of done
- **Technical Debt**: Shortcuts that need refinement later

## Principles in Action

- **Think Different**: Always ask "What if we started from zero?"
- **Obsess Over Details**: Read CLAUDE.md files as guiding principles
- **Plan Like Da Vinci**: Sketch architecture before implementation
- **Craft, Don't Code**: Every function name should sing
- **Iterate Relentlessly**: Take screenshots, run tests, refine
- **Simplify Ruthlessly**: Remove complexity without losing power

## Visual Testing Integration

When implementation involves UI changes, use `/visual-test`:

```
Implementation complete
        ↓
[UI changes?] → YES → /visual-test
        ↓                   ↓
        NO              Create commands JSON
        ↓                   ↓
   Continue          Run browser-actions.js
                            ↓
                     Read screenshots
                            ↓
                     Fill observations.md
                            ↓
                     [Visual pass?]
                            ↓
                     YES → Continue
                            ↓
                     NO → /debug
```

**Visual Test Commands Format**:
```json
{
  "url": "http://localhost:3000",
  "actions": [
    { "type": "click", "target": "Button Name" },
    { "type": "waitForText", "target": "Status", "text": "complete" }
  ],
  "captureBeforeAfter": true
}
```

**Element Discovery**: Agent uses human-readable names. Script resolves via:
1. Cheat sheet (`tools/ui-elements.json`)
2. Page scan (text content, aria-label)
3. Direct selector (`#id` or `.class`)

## Notes

- Use sequential thinking for complex problems (score ≥ 7)
- Document rejected ideas so we don't revisit them
- Never delete history; mark as completed or rejected
- Update `current/` folder at session start and end
- Link documentation files together (research → ideation → plan)
- Run visual tests when UI changes are involved
