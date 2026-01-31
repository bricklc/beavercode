---
description: Create an ideation document to capture design alternatives and vision
---

# /ideate - Ideation Documentation

**Purpose**: Capture design ideas and alternatives without deleting history.

## When to Use

- Designing a new feature or system
- Exploring alternative approaches
- Documenting trade-offs and decisions
- Capturing brainstorming sessions

## Workflow

1. **Check for Existing Ideation**
   - Search `ideation/` folder for related ideas
   - Review existing alternatives to avoid duplication
   - Note version/instance number for iteration

2. **Determine File Name**
   - Format: `ideation/<idea-name>-<yyyy-mm-dd>-<instance>.md`
   - Example: `ideation/inventory-system-2026-01-26-01.md`
   - Increment instance (01, 02, 03) for iterations

3. **Create Ideation Document**
   - Follow required sections from `ideation/README.md`:
     1. Purpose / Intent
     2. How it works
     3. Review of related literature
     4. List of connected ideas
     5. Dependencies
     6. Program flow scenario (expected outcome)
     7. At-a-glance bullet list of outcomes
     8. Review of results from tests (if applicable)
     9. List of rejected ideas with reasons
     10. List of waitlisted ideas

4. **Document Design Vision**
   - Think like a designer, not just an engineer
   - Describe the "soul" of the feature
   - Reference CLAUDE.md principles if they exist
   - Sketch the architecture before details

5. **Evaluate Alternatives**
   - List at least 2-3 alternative approaches
   - Document trade-offs for each
   - Score using impact/effort matrix
   - Select preferred approach with rationale

6. **Categorize Ideas**
   - **Accepted**: Moving forward with implementation
   - **Rejected**: Not pursuing (document WHY)
   - **Waitlisted**: Good ideas, not urgent (backlog)

## Template

```markdown
# [Idea Name]

**Date**: YYYY-MM-DD
**Version**: 01
**Status**: Draft | Review | Approved | Implemented

## 1. Purpose / Intent

[Why does this exist? What problem does it solve?]

## 2. How It Works

[High-level description of the design]

### Core Concept
[The essential idea in 2-3 sentences]

### Architecture Overview
[Sketch the components and their relationships]

## 3. Review of Related Literature

[Link to research docs, existing patterns, external references]
- Research: `research/[topic]-[date].md`
- External: [URL or source]

## 4. List of Connected Ideas

[What other ideas relate to this?]
- Related ideation: `ideation/[name]-[date]-[instance].md`
- Dependent features: [list]
- Future possibilities: [list]

## 5. Dependencies

[What must exist before we can build this?]
- Technical dependencies: [libraries, APIs, infrastructure]
- Feature dependencies: [other features that must be complete]
- Knowledge dependencies: [research or decisions needed]

## 6. Program Flow Scenario (Expected Outcome)

[Walk through a concrete example]

**Scenario**: [Describe the use case]

1. User does [action]
2. System responds with [behavior]
3. Result is [outcome]

## 7. At-a-Glance Bullet List of Outcomes

[Quick summary of what this delivers]
- ✅ [Capability 1]
- ✅ [Capability 2]
- ✅ [Capability 3]

## 8. Review of Results from Tests

[If this is an iteration, what did we learn from the previous version?]
- Test results: `testing/[feature]-[date]-[run].md`
- Key learnings: [insights]

## 9. List of Rejected Ideas with Reasons

[Document what we're NOT doing and why]

### Rejected: [Approach Name]
- **Reason**: [Why we rejected this]
- **Trade-off**: [What we would have gained/lost]

## 10. List of Waitlisted Ideas

[Good ideas that aren't urgent]

### Waitlisted: [Feature Name]
- **Priority Score**: [Impact × Urgency / Effort]
- **Rationale**: [Why backlog instead of now]
- **Trigger**: [What would make this urgent?]
```

## Scoring Rubric (for waitlisting)

- **Impact** (1-10): How much does this move the needle?
- **Urgency** (1-10): How time-sensitive is this?
- **Effort** (1-10): How complex is the implementation?
- **Score** = (Impact × Urgency) / Effort

**Decision**:
- Score ≥ 7: NOW (proceed to planning)
- Score 4-6: NEXT (next iteration)
- Score 1-3: BACKLOG (waitlist)
- Score < 1: REJECT (document and archive)

## Best Practices

- Never delete old ideas; create new versions instead
- Mark rejected ideas with clear reasoning
- Link to research that informed the design
- Update when implementation reveals new insights
- Keep "soul" and philosophy front-and-center

## Next Steps

After completing ideation:
- If score ≥ 7, invoke `/plan` for implementation planning
- If waitlisted, update `current/todo.md` backlog
- If rejected, note in `current/context.md` for future reference
- After `/plan`, run the validation gate before `/test-plan`
- Capture workflow improvements as ideation docs (e.g., screenshots, env setup)
