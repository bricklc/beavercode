---
description: Create a debugging document to track bugs, fixes, and verification
---

# /debug - Debugging Documentation

**Purpose**: Track bugs, fixes, and verification history systematically.

## When to Use

- When a test case fails
- When a bug is discovered
- When tracking regression fixes
- When documenting error investigations

## Workflow

1. **Identify the Bug**
   - What is the observed behavior?
   - What was the expected behavior?
   - Can it be reproduced consistently?

2. **Determine File Name**
   - Format: `debugging/<bug-name>-<yyyy-mm-dd>-<instance>.md`
   - Example: `debugging/cmd-unicode-path-2026-01-26-01.md`
   - Use descriptive names that indicate the issue

3. **Create Debug Document**
   - Follow template from `debugging/README.md`:
     - YAML frontmatter (bug_id, timestamp, severity, status, etc.)
     - Description
     - Reproducible steps
     - Expected vs Actual behavior
     - Fix (solution, code, alternatives)
     - References
     - Verification

4. **Classify the Bug**
   - **Severity**: Critical | High | Medium | Low
   - **Category**: Logic | UI | Performance | Security | Data
   - **Platform**: Windows | Linux | Mac | Browser | All

5. **Document the Fix**
   - What was the root cause?
   - What solution was implemented?
   - What alternatives were considered?
   - What tests verify the fix?

## Template

```markdown
---
bug_id: "BUG-YYYY-MM-DD-NN"
timestamp: "YYYY-MM-DD HH:MM:SS"
category: "Logic | UI | Performance | Security | Data | Integration"
sub_category: "[More specific classification]"
platform: "Windows | Linux | Mac | Browser | All"
os_version: "[Specific version if relevant]"
severity: "Critical | High | Medium | Low"
status: "open | investigating | fixed | verified | closed"
owner: "[Agent/Developer name]"
---

# Bug: [Descriptive Bug Title]

## Description

[Clear, concise description of the bug]

**Impact**: [Who/what is affected by this bug?]

**Frequency**: [How often does this occur? Always | Sometimes | Rare]

**First Observed**: [When was this first noticed?]

## Reproducible Steps

1. [Step-by-step instructions to reproduce]
2. [Be specific - include exact commands, inputs, clicks]
3. [Include environment setup if relevant]

**Reproducibility**: 100% | ~75% | ~50% | Intermittent

## Expected Behavior

[What should happen in the ideal scenario?]

- [Expected outcome 1]
- [Expected outcome 2]

## Actual Behavior

[What actually happens?]

- [Actual outcome 1]
- [Actual outcome 2]

**Error Message** (if applicable):
```
[Paste exact error message or stack trace]
```

**Screenshots** (if applicable):
- [Attach or describe visual evidence]

## Root Cause Analysis

[After investigation - what is the underlying cause?]

**Hypothesis 1**: [Initial theory]
- Investigation: [What you tested]
- Result: [Confirmed | Rejected]

**Root Cause**: [Final determination]
- **File**: `path/to/problematic/file.js`
- **Line**: [Line number if applicable]
- **Issue**: [Specific code or logic problem]

## Fix

### Solution
[Describe the fix that was implemented]

**Approach**: [Why this solution was chosen]

**Changes Made**:
- File: `path/to/file.js`
  - Changed: [Description of change]
  - Rationale: [Why this fixes the issue]

### Command (if any)
```bash
# Commands used to fix or work around the issue
command-here
```

### Code Snippet (if any)
```javascript
// Before (buggy code)
function buggyFunction() {
  // problematic logic
}

// After (fixed code)
function fixedFunction() {
  // corrected logic
}
```

### Alternative Solutions

**Alternative 1**: [Another approach considered]
- **Pros**: [Advantages]
- **Cons**: [Disadvantages]
- **Why Not Chosen**: [Reasoning]

## References

[Links to related documentation, discussions, or resources]

- Test Case: `testing/[feature]-[date]-[run].md` (TC-XX)
- Implementation Plan: `implementation planning/[feature]-[date].md`
- Related Bug: `debugging/[related-bug]-[date]-[instance].md`
- External Reference: [URL to similar issue or documentation]

## Verification

**Testing**:
- [ ] Run test case TC-XX from `testing/[feature]-[date]-[run].md`
- [ ] Verify expected behavior is restored
- [ ] Check for regressions in related functionality

**Verification Log**:

### Verification 1 - YYYY-MM-DD HH:MM
- **Tester**: [Name]
- **Environment**: [OS, version, etc.]
- **Result**: Pass | Fail | Partial
- **Notes**: [Observations]

### Verification 2 - YYYY-MM-DD HH:MM
- **Tester**: [Name]
- **Environment**: [OS, version, etc.]
- **Result**: Pass | Fail | Partial
- **Notes**: [Regression test or re-verification]

## Post-Fix Actions

- [ ] Update test plan to include regression test
- [ ] Document lessons learned
- [ ] Check for similar issues in codebase
- [ ] Update implementation plan if design change needed

## Lessons Learned

[What did we learn from this bug?]

- [Insight 1]
- [Insight 2]
- [Process improvement suggestion]
```

## Severity Levels

### Critical
- System crash or data loss
- Security vulnerability
- Production blocker
- **Response**: Immediate fix required

### High
- Major feature broken
- Severe UX degradation
- Workaround exists but difficult
- **Response**: Fix in current sprint

### Medium
- Minor feature broken
- UX inconvenience
- Easy workaround available
- **Response**: Fix in next sprint

### Low
- Cosmetic issue
- Edge case
- Minimal impact
- **Response**: Backlog

## Best Practices

- Reproduce before documenting
- Include exact error messages
- Document root cause, not just symptoms
- Verify fix thoroughly
- Add regression tests
- Update related documentation

## Next Steps

After documenting bug:
- Implement the fix
- Update test plan with regression test
- Verify fix with original reporter
- Update `current/status.md` if blocker is resolved
- Close bug only after verification
