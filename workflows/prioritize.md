---
description: Use sequential thinking with scoring rubric to prioritize ideas and tasks
---

# /prioritize - Intelligent Prioritization with Sequential Thinking

**Purpose**: Apply systematic scoring and sequential thinking to prioritize ideas, features, and tasks.

## When to Use

- When evaluating new feature requests
- When deciding what to work on next
- When choosing between alternative approaches
- When managing backlog

## Workflow

### Step 1: Use Sequential Thinking

**Invoke**: `mcp_sequential-thinking_sequentialthinking`

Think through the request systematically:
- What problem are we solving?
- Why does it matter?
- What are the alternatives?
- What are the dependencies?
- What are the risks?
- How does this align with project goals?

**Key questions to explore**:
1. Is this solving a real problem or just a nice-to-have?
2. Can we solve this differently (simpler, faster, cheaper)?
3. What happens if we DON'T do this?
4. What must be true for this to succeed?
5. How does this move the needle on project goals?

### Step 2: Score Against Rubric

Use the **Priority Matrix**: `Score = (Impact × Urgency) / Effort`

#### Impact (1-10): How much does this move the needle?

| Score | Description | Examples |
|-------|-------------|----------|
| 10 | Mission-critical, transforms core UX | Auth system, data pipeline foundations |
| 9 | Major feature, significant UX improvement | Search functionality, real-time updates |
| 8 | Important enhancement, clear user value | Export features, advanced filtering |
| 7 | Valuable addition, improves workflows | Keyboard shortcuts, batch operations |
| 6 | Moderate improvement, nice quality-of-life | UI polish, better error messages |
| 5 | Noticeable but not essential | Additional reporting, minor features |
| 4 | Subtle enhancement | Cosmetic improvements, convenience |
| 3 | Minor improvement | Edge case handling, rare scenarios |
| 2 | Minimal impact | Developer convenience, internal tools |
| 1 | Negligible impact | Code comments, style changes |

#### Urgency (1-10): How time-sensitive is this?

| Score | Description | Examples |
|-------|-------------|----------|
| 10 | Blocking production, critical path | Security vulnerability, data loss bug |
| 9 | Needed for imminent release | Milestone dependency, promised feature |
| 8 | Deadline-driven, high business value | Customer commitment, marketing launch |
| 7 | Should have soon, opportunity cost | Competitive feature, user pain point |
| 6 | Timely but not urgent | Planned improvement, roadmap item |
| 5 | No specific deadline | General enhancement |
| 4 | Can wait for next iteration | Backlog grooming candidate |
| 3 | Opportunistic work | When time permits |
| 2 | Someday/maybe | Nice idea for future |
| 1 | No urgency | Speculative, experimental |

#### Effort (1-10): How complex is the implementation?

| Score | Description | Examples |
|-------|-------------|----------|
| 10 | Months of work, major architecture change | Complete system redesign, new tech stack |
| 9 | Many weeks, complex integration | Multi-module feature, API integration |
| 8 | Several weeks, significant complexity | New subsystem, complex algorithm |
| 7 | 1-2 weeks, moderate complexity | Feature with multiple components |
| 6 | Several days, medium complexity | Standard feature implementation |
| 5 | Few days, familiar patterns | Using existing components |
| 4 | 1-2 days, straightforward | Simple feature, clear approach |
| 3 | Several hours, well-defined | Small enhancement, bug fix |
| 2 | ~1 hour, trivial change | Config change, minor tweak |
| 1 | Minutes, one-line change | Typo fix, constant update |

### Step 3: Calculate Priority Score

**Formula**: `Score = (Impact × Urgency) / Effort`

**Example**:
- Impact: 8 (important feature)
- Urgency: 7 (user pain point)
- Effort: 4 (1-2 days work)
- **Score**: (8 × 7) / 4 = **14.0**

### Step 4: Apply Decision Matrix

| Priority Score | Decision | Action |
|----------------|----------|---------|
| ≥ 10 | **NOW** | Add to `current/todo.md` → Immediate |
| 7-9.9 | **NOW** (with consideration) | Add to Immediate or Next based on capacity |
| 4-6.9 | **NEXT** | Add to `current/todo.md` → Next |
| 2-3.9 | **BACKLOG** | Add to `current/todo.md` → Backlog |
| < 2 | **REJECT** or **DEFER** | Document in ideation as "waitlisted" or "rejected" |

### Step 5: Document the Decision

**For NOW items** (Score ≥ 7):
1. Proceed with `/ultrathink` cycle
2. Update `current/todo.md` → Immediate
3. Document in `ideation/` with score and rationale

**For NEXT items** (Score 4-6.9):
1. Add to `current/todo.md` → Next
2. Create brief ideation note with score
3. Revisit when higher-priority items complete

**For BACKLOG items** (Score 2-3.9):
1. Add to `current/todo.md` → Backlog
2. Document in `ideation/` with "waitlisted" marker
3. Note trigger conditions for reconsideration

**For REJECT/DEFER** (Score < 2):
1. Document in `ideation/` as "rejected" or "deferred"
2. Explain why (score rationale)
3. Note conditions that would change the decision

## Template: Prioritization Decision

```markdown
# Prioritization: [Feature/Idea Name]

**Date**: YYYY-MM-DD

## Request Summary
[What is being requested?]

## Sequential Thinking Analysis

[Output from sequential thinking - key insights]

### Problem Definition
[What problem does this solve?]

### Alternatives Considered
1. [Alternative 1] → [Why not chosen]
2. [Alternative 2] → [Why not chosen]
3. **Selected**: [Chosen approach] → [Why this one]

### Dependencies & Risks
- Dependencies: [What must exist first?]
- Risks: [What could go wrong?]

## Scoring

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | X/10 | [Why this score?] |
| **Urgency** | X/10 | [Why this score?] |
| **Effort** | X/10 | [Why this score?] |
| **Priority** | **X.X** | **(Impact × Urgency) / Effort** |

## Decision

**Status**: NOW | NEXT | BACKLOG | REJECTED

**Rationale**: [Why this decision based on score and context]

**Next Steps**:
- [ ] [Action item 1]
- [ ] [Action item 2]

**Trigger for Reconsideration** (if BACKLOG or REJECTED):
- [What would make this a higher priority?]

## Related Documentation

- Ideation: `ideation/[name]-[date]-[instance].md`
- Todo: `current/todo.md` ([section])
```

## MoSCoW Method (Alternative)

If systematic scoring is too heavy-weight, use MoSCoW:

- **Must Have**: Critical, non-negotiable
- **Should Have**: Important, high priority
- **Could Have**: Nice-to-have, if time permits
- **Won't Have**: Not in this iteration

Map to actions:
- Must Have → NOW (Immediate)
- Should Have → NEXT
- Could Have → BACKLOG
- Won't Have → REJECTED (with reason)

## Best Practices

- **Be honest with scoring** - don't inflate to justify preferences
- **Use sequential thinking for complex decisions** (score ≥ 7)
- **Document rejected ideas** so you don't revisit them
- **Revisit backlog periodically** - priorities change
- **Consider opportunity cost** - what are you NOT doing?
- **Balance quick wins and big bets** - don't only do easy tasks

## Integration with Ultrathink

1. User requests feature
2. **Invoke `/prioritize`** to score it
3. If score ≥ 7, **invoke `/ultrathink`** full cycle
4. If score 4-6.9, add to NEXT queue
5. If score < 4, add to BACKLOG or REJECT
6. Update `current/todo.md` with decision

## Examples

### Example 1: High Priority (Score: 14.0)

**Request**: Add user authentication

- Impact: 9 (mission-critical for multi-user app)
- Urgency: 7 (needed for next milestone)
- Effort: 4.5 (well-understood pattern)
- **Score**: (9 × 7) / 4.5 = **14.0**
- **Decision**: NOW → Invoke `/ultrathink`

### Example 2: Medium Priority (Score: 5.3)

**Request**: Add dark mode theme

- Impact: 6 (nice UX improvement)
- Urgency: 4 (no deadline, user request)
- Effort: 4.5 (moderate CSS work)
- **Score**: (6 × 4) / 4.5 = **5.3**
- **Decision**: NEXT → Add to next iteration

### Example 3: Low Priority (Score: 1.7)

**Request**: Customize button border radius

- Impact: 2 (cosmetic only)
- Urgency: 2 (no user request)
- Effort: 2.5 (simple CSS change)
- **Score**: (2 × 2) / 2.5 = **1.6**
- **Decision**: BACKLOG or REJECT → Document and defer

## Next Steps

After prioritization:
- Update `current/todo.md` with decision
- If NOW, proceed with `/ultrathink`
- If NEXT or BACKLOG, document in ideation
- If REJECTED, note reason in ideation
