---
description: Create a walkthrough guide for features or workflows
---

# /walkthrough - Walkthrough Documentation

**Purpose**: Create step-by-step guides for workflows, features, or onboarding.

## When to Use

- After implementing a new feature (user guide)
- When documenting a workflow (how-to)
- For onboarding new team members
- When creating tutorials

## Workflow

1. **Identify the Audience**
   - Who will use this guide?
   - What is their assumed knowledge level?
   - What outcome do they want to achieve?

2. **Determine File Name**
   - Format: `walkthrough/<topic>-<yyyy-mm-dd>-<version>.md`
   - Example: `walkthrough/inventory-workflow-2026-01-26-v1.md`
   - Increment version for updates

3. **Create Walkthrough Document**
   - Follow template from `walkthrough/README.md`:
     - Goal
     - Audience
     - Preconditions
     - Steps
     - Expected Outcome
     - References

4. **Write Clear Steps**
   - Use numbered lists
   - Include screenshots or code snippets
   - Explain WHY, not just WHAT
   - Add troubleshooting tips

5. **Test the Walkthrough**
   - Follow your own instructions
   - Verify expected outcome is achievable
   - Refine based on feedback

## Template

```markdown
# Walkthrough: [Topic Name]

**Date**: YYYY-MM-DD
**Version**: v1
**Status**: Draft | Active | Deprecated
**Related Docs**:
- Implementation: `implementation planning/[feature]-[date].md`
- Test Results: `testing/[feature]-[date]-[run].md`

## Goal

[What will the user achieve by following this guide?]

**Use Case**: [When would someone use this?]

## Audience

[Who is this guide for?]
- **Skill Level**: Beginner | Intermediate | Advanced
- **Prerequisites**: [Required knowledge or skills]

## Preconditions

[What must be in place before starting?]

**Environment Setup**:
- [ ] [Software/tool installed]
- [ ] [Configuration completed]
- [ ] [Access/permissions granted]

**Starting Point**:
- [Where the user should be at the beginning]
- [What files/data should exist]

## Steps

### Step 1: [Action Title]

**What**: [Brief description of what this step does]

**Why**: [Why this step is necessary]

**How**:
1. [Detailed instruction]
2. [Next action]

**Example**:
```bash
# Command or code example
command-here
```

**Expected Result**: [What should happen after this step]

**Troubleshooting**:
- **Issue**: [Common problem]
  - **Solution**: [How to fix it]

---

### Step 2: [Action Title]

**What**: [Description]

**Why**: [Rationale]

**How**:
1. [Instruction]
2. [Action]

**Example**:
```javascript
// Code snippet if applicable
const example = "value";
```

**Expected Result**: [Outcome]

---

### Step 3: [Action Title]

[Continue with additional steps...]

## Expected Outcome

[What is the final result when all steps are complete?]

**Success Indicators**:
- ✅ [Observable outcome 1]
- ✅ [Observable outcome 2]

**Verification**:
- [How to confirm success]
- [What to check]

## Common Issues

### Issue 1: [Problem Description]
**Symptoms**: [What the user sees]
**Cause**: [Why this happens]
**Solution**: [How to fix]

### Issue 2: [Problem Description]
**Symptoms**: [Observable behavior]
**Cause**: [Root cause]
**Solution**: [Resolution steps]

## Advanced Usage

[Optional: More advanced techniques or variations]

### Variation 1: [Alternative Approach]
[When and how to use this variation]

## References

[Links to related documentation and resources]

- **Code**: `path/to/relevant/file.js`
- **Related Walkthrough**: `walkthrough/[other-guide]-[date]-v1.md`
- **API Docs**: [URL or file path]
- **External Tutorial**: [URL]

## Changelog

[Track changes to this walkthrough]

### v1 - YYYY-MM-DD
- Initial creation
- Documented steps 1-5

### v2 - YYYY-MM-DD (if updated)
- Added troubleshooting for [issue]
- Updated step 3 for [reason]
```

## Best Practices

- Write for your audience's skill level
- Use active voice ("Click the button" not "The button is clicked")
- Include visual aids when helpful
- Test with a fresh perspective
- Update when features change
- Keep language clear and concise

## Walkthrough Types

### Feature Guide
- How to use a specific feature
- Focus on user actions and outcomes
- Include screenshots or demos

### Workflow Guide
- How to complete a process end-to-end
- Focus on integration of multiple features
- Include decision points and alternatives

### Onboarding Guide
- How to get started from scratch
- Focus on fundamentals and first steps
- Include environment setup

### Tutorial
- How to build something step-by-step
- Focus on learning and understanding
- Include explanations of concepts

## Next Steps

After creating walkthrough:
- Share with intended audience for feedback
- Update if implementation changes
- Link from main README or documentation index
- Mark as "Active" when finalized
- Deprecate old versions when superseded
