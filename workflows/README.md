# Ultrathink Workflow System

Systematic workflows implementing documentation, prioritization, and craftsmanship.

## Philosophy
*"We're not here to write code. We're here to make a dent in the universe."*

### Six Principles
1. **Think Different**: Question every assumption.
2. **Obsess Over Details**: Study the codebase like a masterpiece.
3. **Plan Like Da Vinci**: Architect before building.
4. **Craft, Don't Code**: Every function should sing.
5. **Iterate Relentlessly**: Refine until it's great.
6. **Simplify Ruthlessly**: Elegance through subtraction.

## Available Workflows

### Master Orchestrator

#### `/ultrathink`
**Documentation-to-implementation Cycle**
Master workflow orchestrating all others. Ensures planning and testing precede coding for new features or refactors.

#### `/planning-only`
**Design & Planning Mode**
Complete planning workflow without code execution or testing. Produces ideation docs, implementation plans, and test strategies ready for handoff.
**Used**: Pre-implementation design sessions, architecture planning, when implementation happens later.

---

### Pre-Implementation Workflows

These workflows create the foundation before writing code:

#### `/prioritize`
**Prioritization & Scoring Rubric**
Uses sequential thinking and Priority = (Impact × Urgency) / Effort to decide what to build now vs backlog.
**Used**: Evaluating new requests or managing backlog.

#### `/research`
**Research Documentation**
Academic-style research (Objective, Lit Review, Methodology, Findings, Evaluation) to inform design.
**Used**: Investigating tech or analyzing patterns.

#### `/ideate`
**Ideation & Vision**
Captures design "soul," alternatives, and trade-offs.
**Used**: Designing features and exploring alternatives.

#### `/plan`
**Implementation Planning**
Converts ideation into scoped, testable milestones.
**Used**: After ideation is approved, before coding.

#### `/test-plan`
**Test Planning**
Defines test cases and acceptance criteria upfront.
**Used**: Before implementing features/integration tests.

---

### Implementation Support Workflows

These workflows support ongoing work:

#### `/status`
**Status Tracking**
Maintains `current/` tracking files (status, todo, context).
**Used**: Session starts, milestones, handoffs, and session ends.

#### `/verify-tests`
**Test Verification (Auto)**
Triggered by test completion phrases. Parses transcripts and updates `todo.md`.
**Used**: After `python run_tests.py` runs autonomously.

**When to use**: After any `python run_tests.py` execution. Runs autonomously - DO NOT ask user for permission.

#### `/debug`
**Bug Tracking**
Structured debugging with root cause analysis and verification.
**Used**: Test failures, bug discovery, or regression tracking.

#### `/walkthrough`
**User Guides**
Step-by-step feature guides and onboarding tutorials.
**Used**: After feature implementation to document usage.

#### `/visual-test`
**Automated Visual Testing**
Browser automation for UI testing with screenshot capture and agent observation.
**Used**: After UI changes, before merging frontend code, during acceptance testing.
**Flow**: Create commands → Run browser actions → Observe screenshots → Report results.

#### `/handoff`
**Baton Pass**
Modular session handoff layered on top of `current/` tracking and existing docs.
**Used**: Session ends, context switches, or multi-agent collaboration.

---

## Workflow Relationships

```
User Request
    ↓
/prioritize (Score & Decide)
    ↓
[Score ≥ 7?] → YES → /ultrathink (Master Orchestrator)
    ↓                      ↓
    NO                 Phase 1: Discovery
    ↓                      ↓
[Add to backlog]      /status (Read current state)
                           ↓
                      Phase 2: Documentation
                           ↓
                      /research (If needed)
                           ↓
                      /ideate (Design & alternatives)
                           ↓
                      /plan (Implementation plan)
                           ↓
                      Validation gate (tools/validate_docs.py)
                           ↓
                      /test-plan (Test cases)
                           ↓
                      Phase 3: Review Gate
                           ↓
                      [User approves?] → YES → Implementation
                           ↓                         ↓
                           NO                   Execute plan
                           ↓                         ↓
                      Revise docs              Run tests
                                                    ↓
                                               /verify-tests (auto)
                                                    ↓
                                               [Tests pass?]
                                                    ↓
                                                   YES → /walkthrough
                                                    ↓
                                                   NO → /debug
                                                    ↓
                                               /status (Update completion)
```

## Scoring Rubric

### Scoring Rubric (1-10)
- **Impact**: Mission-critical (10), Major (7-9), Moderate (4-6), Minor (1-3).
- **Urgency**: Blocker (10), High (7-9), Moderate (4-6), Low (1-3).
- **Effort**: Months (10), Weeks (7-9), Days (4-6), Hours (1-3).

### Priority Score
**Formula**: `(Impact × Urgency) / Effort`

**Decisions**:
- **≥ 10**: NOW - Immediate priority
- **7-9.9**: NOW - High priority
- **4-6.9**: NEXT - Next iteration
- **2-3.9**: BACKLOG - Not urgent
- **< 2**: REJECT / DEFER - Document reason

## Project Management Terms

**Spike**: Time-boxed research. | **Epic**: Large body of work. | **Story**: User capability. | **Task**: Technical item.
**Backlog**: Priority list. | **Sprint**: Iteration. | **WIP**: Active work. | **Blocker**: Blocker condition.
**Acceptance Criteria**: Definition of done. | **Technical Debt**: Debt requiring refinement.

## Documentation Folders

All workflows interact with these documentation folders:

```
project/
├── current/                      # Single source of truth
│   ├── status.md                 # Active phase, tasks, blockers
│   ├── todo.md                   # Priority queue
│   └── context.md                # Session decisions & notes
│
├── research/                     # Research papers
│   ├── README.md
│   └── <topic>-<date>.md
│
├── ideation/                     # Design alternatives
│   ├── README.md
│   └── <idea>-<date>-<instance>.md
│
├── implementation planning/      # Scoped plans
│   ├── README.md
│   └── <feature>-<date>.md
│
├── testing/                      # Test plans & results
│   ├── README.md
│   └── <feature>-<date>-<run>.md
│
├── debugging/                    # Bug tracking
│   ├── README.md
│   └── <bug>-<date>-<instance>.md
│
├── walkthrough/                  # User guides
│   ├── README.md
│   └── <topic>-<date>-<version>.md
│
└── core/                         # Code modules
    └── <module>/
        ├── README.md
        ├── <module>.js
        ├── docs/
        └── tests/
```

## Quick Reference

### Starting a New Feature
```
1. Initialize project → conda env + git repo
2. /prioritize → Score the idea
3. [If score ≥ 7] /ultrathink → Full cycle
4. Run validation gate → tools/validate_docs.py
5. /status → Update current state
```

## Project Initialization

Before any implementation planning:
- Create and activate a conda environment for the project
- Initialize git (if not already initialized)
- Ensure `requirements.txt` exists for the environment
- Record env name + git status in `current/context.md`

### Bug Fixing
```
1. /debug → Document the bug
2. Implement fix
3. /test-plan → Update with regression test
4. /verify-tests → Run tests & check results (auto)
5. /status → Mark complete
```

### Testing Workflow
```
After writing code:
1. python run_tests.py tests/<module>.py (run autonomously)
2. /verify-tests → Auto-reads transcript & updates todo.md
3. [If passed] → Continue to next milestone
4. [If failed] → /debug → Fix → Re-run
```

### Visual Testing Workflow
```
After UI changes:
1. Update tools/ui-elements.json (if new elements)
2. Create test commands JSON
3. /visual-test → Run browser actions
4. Agent reads screenshots
5. Agent fills observations.md
6. [If passed] → Update test plan
7. [If failed] → /debug → Fix → Re-run
```

### Session Management
```
Session Start:
- /status (read current state)

During Session:
- Follow /ultrathink phases
- Update /status as you progress

Session End:
- /status (update completion & handoff)
- /handoff (modular baton pass layered on top of `current/`)
  - Restart loop: next instance begins at /status and re-enters /ultrathink or /planning-only
```

## Annotations

### `// turbo`
Place above a workflow step to auto-run that single command step:
```markdown
1. Review the status

// turbo
2. List project files
```

### `// turbo-all`
Place anywhere in workflow to auto-run ALL command steps:
```markdown
// turbo-all

1. Install dependencies
2. Run build
3. Start server
```

## Best Practices

1. **Read before writing**: Always check `current/` folder first
2. **Never delete history**: Mark as rejected, completed, or waitlisted
3. **Link documents**: Cross-reference research → ideation → plans
4. **Update timestamps**: Track when changes occur
5. **Use sequential thinking**: For complex problems (score ≥ 7)
6. **Document rejections**: Why we're NOT doing something
7. **Verify thoroughly**: Test before marking complete
8. **Handoff clearly**: Update context.md for next session

## Integration with Sequential Thinking

For complex problems, workflows use the `mcp_sequential-thinking_sequentialthinking` tool to:
- Break down problems into clear thought steps
- Question assumptions and explore alternatives
- Revise thinking as new insights emerge
- Generate and verify solution hypotheses
- Reach well-reasoned conclusions

**When to use sequential thinking**:
- Priority score ≥ 7 (complex, high-impact work)
- Architectural decisions
- Trade-off analysis
- Problem investigation
- Risk assessment

## Getting Started

### First Time Setup
1. Create `current/` files (`status.md`, `todo.md`, `context.md`) using `/status` templates.
2. Review `/ultrathink`, `/prioritize`, and `/status`.
3. Start with a request: `/prioritize` → Score → Execute.

### Example Session
1. **Prioritize**: `/prioritize` → Score 11.2 (NOW).
2. **Discovery**: `/status` → Read state.
3. **Docs**: `/research`, `/ideate`, `/plan`, `/test-plan`.
4. **Review**: Present docs → Get approval.
5. **Implementation**: Execute plan → Build → Run tests.
6. **Close**: `/walkthrough` → `/status` (Mark complete).

## Maintenance

- Review workflows quarterly for improvements
- Update templates based on learnings
- Add new workflows as patterns emerge
- Deprecate workflows that aren't useful
- Keep README.md synchronized with changes

---

**Remember**: The goal is craftsmanship, not just code. Take time to think, plan, and document. The code will be better for it.
