---
description: Create an implementation plan from ideation with scope, metrics, and milestones
---

# /plan - Implementation Planning

**Purpose**: Convert ideation into scoped, testable, executable plans.

## When to Use

- After ideation is approved
- When design is clear and scored as NOW priority
- Before writing any implementation code

## Workflow

1. **Review Prerequisites**
   - Ideation document exists and is approved
   - Research is complete (if needed)
   - Priority score ≥ 7 (or user override)
   - Conda environment created for the project
   - Git repo initialized before creating the plan
   - `requirements.txt` exists for environment reproducibility

2. **Determine File Name**
   - Format: `implementation planning/<feature-or-module>-<yyyy-mm-dd>.md`
   - Example: `implementation planning/orders-pipeline-2026-01-26.md`

3. **Create Implementation Plan**
   - Follow structure from `implementation planning/README.md`:
     - Scope
     - Success metrics
     - Dependencies
     - Risks and mitigations
     - Milestones
     - Task checklist
     - Verification steps

4. **Define Scope Boundaries**
   - **IN SCOPE**: What we WILL build in this iteration
   - **OUT OF SCOPE**: What we explicitly WON'T build (yet)
   - Use scope to prevent feature creep

5. **Break Down into Milestones**
   - Each milestone should be testable
   - Each milestone should deliver value
   - Sequence milestones logically

6. **Create Task Checklist**
   - Granular, actionable tasks
   - Each task ~1-4 hours of work
   - Link tasks to files/modules

7. **Validation Gate (Required)**
   - Run: `python tools/validate_docs.py --ideation "<ideation-file>" --plan "<plan-file>"`
   - Fix missing or empty sections before proceeding to `/test-plan`

## Template

```markdown
# Implementation Plan: [Feature Name]

**Date**: YYYY-MM-DD
**Status**: Draft | In Progress | Complete
**Related Docs**:
- Ideation: `ideation/[name]-[date]-[instance].md`
- Research: `research/[topic]-[date].md`

## Scope

### In Scope
- ✅ [Specific capability we WILL build]
- ✅ [Another capability]

### Out of Scope
- ❌ [Feature we explicitly WON'T build yet]
- ❌ [Future enhancement]

**Rationale**: [Why these boundaries?]

## Success Metrics

[How do we know this is done and working?]

### Acceptance Criteria
1. [Specific, testable criterion]
2. [Another criterion]

### Performance Targets
- [Metric]: [Target value]
- [Metric]: [Target value]

### Definition of Done
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed/verified

## Dependencies

### Technical Dependencies
- [Library/API]: [Version and why needed]
- [Infrastructure]: [What must be in place]

### Feature Dependencies
- [Feature]: [Must be complete before we start]
- [Module]: [Must be available during implementation]

### Knowledge Dependencies
- [Research]: [Information we need before proceeding]
- [Decision]: [Choice that must be made first]

## Risks and Mitigations

### Risk 1: [Description]
- **Likelihood**: High | Medium | Low
- **Impact**: High | Medium | Low
- **Mitigation**: [How we'll address this]

### Risk 2: [Description]
- **Likelihood**: High | Medium | Low
- **Impact**: High | Medium | Low
- **Mitigation**: [How we'll address this]

## Milestones

### Milestone 1: [Name]
**Target**: [Date or sprint]
**Deliverable**: [What gets built]
**Verification**: [How we'll test it]

**Tasks**:
- [ ] Task 1 → `path/to/file.js`
- [ ] Task 2 → `path/to/file.js`

### Milestone 2: [Name]
**Target**: [Date or sprint]
**Deliverable**: [What gets built]
**Verification**: [How we'll test it]

**Tasks**:
- [ ] Task 1 → `path/to/file.js`
- [ ] Task 2 → `path/to/file.js`

## Task Checklist

[Comprehensive list of all tasks, organized by module or phase]

### Phase 1: [Setup/Foundation]
- [ ] Task 1 → `file/path` (Est: 2h)
- [ ] Task 2 → `file/path` (Est: 1h)

### Phase 2: [Core Implementation]
- [ ] Task 1 → `file/path` (Est: 4h)
- [ ] Task 2 → `file/path` (Est: 3h)

### Phase 3: [Integration & Polish]
- [ ] Task 1 → `file/path` (Est: 2h)
- [ ] Task 2 → `file/path` (Est: 1h)

## Verification Steps

[How to verify the implementation works]

1. **Unit Tests**
   - [ ] Test file: `tests/[module].test.js`
   - [ ] Coverage target: 80%+

2. **Integration Tests**
   - [ ] Test scenario: [Description]
   - [ ] Expected outcome: [Result]

3. **Manual Verification**
   - [ ] Step 1: [Action]
   - [ ] Step 2: [Action]
   - [ ] Expected: [Outcome]

4. **Performance Verification**
   - [ ] Metric: [Target]
   - [ ] Tool: [How to measure]

## Implementation Notes

[Space for capturing decisions and discoveries during implementation]

### Key Decisions
- [Decision] → [Rationale]

### Discoveries
- [Finding] → [Impact on plan]

### Deviations from Plan
- [Change] → [Why we deviated]

## Handoff

[When implementation is complete]

- **Completed**: YYYY-MM-DD
- **Test Report**: `testing/[feature]-[date]-[run].md`
- **Walkthrough**: `walkthrough/[topic]-[date]-v1.md`
- **Next Steps**: [What comes next?]
```

## Best Practices

- Keep scope tight and focused
- Make success metrics measurable
- Identify risks early
- Break work into small, testable milestones
- Update plan as you discover new information
- Link back to ideation for design context

## Next Steps

After creating implementation plan:
- Run the validation gate and ensure it passes
- If not already done, invoke `/test-plan` to define tests
- Review plan with user before implementation
- Use plan as checklist during implementation
- Update `current/status.md` with active milestone
- Mark tasks complete in real-time
