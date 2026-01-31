---
description: Create a test plan before implementation
---

# /test-plan - Test Planning

**Purpose**: Define test cases BEFORE implementation to ensure testability and quality.

## When to Use

- Before implementing a new feature
- When planning integration tests
- When defining acceptance criteria
- After identifying a bug (regression test planning)

## Workflow

1. **Review Implementation Plan**
   - Validation gate must pass before test planning
   - What are the acceptance criteria?
   - What are the success metrics?
   - What are the edge cases?

2. **Determine File Name**
   - Format: `testing/<area-or-feature>-<yyyy-mm-dd>-<run>.md`
   - Example: `testing/orders-pipeline-2026-01-26-01.md`
   - Increment run number for subsequent test executions

3. **Create Test Plan**
   - Follow template from `testing/README.md`:
     - Test Summary (scope, environment, overall status)
     - Test Cases (preconditions, steps, expected, actual, status)
     - Defects Found
     - Follow-ups

4. **Define Test Cases**
   - **Happy Path**: Normal, expected usage
   - **Edge Cases**: Boundary conditions
   - **Error Cases**: Invalid inputs, failures
   - **Integration**: Cross-module interactions

5. **Make Tests Executable**
   - Each test case should be repeatable
   - Document exact steps to reproduce
   - Specify expected outcomes precisely

## Template

```markdown
# Test Plan: [Feature/Area Name]

**Date**: YYYY-MM-DD
**Run**: 01
**Tester**: [Agent/Human]
**Related Docs**:
- Implementation Plan: `implementation planning/[feature]-[date].md`
- Ideation: `ideation/[name]-[date]-[instance].md`

## Test Summary

### Scope
[What are we testing in this run?]
- Feature: [Name]
- Modules: [List of modules/files]
- Test focus: [Unit | Integration | E2E | Performance]

### Environment
- OS: [Windows/Linux/Mac]
- Node version: [if applicable]
- Dependencies: [Relevant versions]
- Test framework: [Jest/Mocha/Manual]

### Overall Status
- **Status**: Not Started | In Progress | Pass | Fail | Partial
- **Pass Rate**: 0/10 (0%)
- **Blockers**: [Any critical issues preventing testing]

## Test Cases

### TC-01: [Test Case Name - Happy Path]

**Objective**: [What are we verifying?]

**Preconditions**:
- [Setup required before test]
- [Initial state needed]

**Test Steps**:
1. [Action to perform]
2. [Next action]
3. [Final action]

**Expected Result**:
- [Specific, measurable outcome]
- [Another expected behavior]

**Actual Result**:
- [What actually happened - fill during execution]

**Status**: ⏳ Not Run | ✅ Pass | ❌ Fail | ⚠️ Partial

**Notes**: [Any observations or context]

---

### TC-02: [Test Case Name - Edge Case]

**Objective**: [What edge case are we testing?]

**Preconditions**:
- [Setup required]

**Test Steps**:
1. [Action]
2. [Action]

**Expected Result**:
- [Outcome]

**Actual Result**:
- [To be filled]

**Status**: ⏳ Not Run

---

### TC-03: [Test Case Name - Error Handling]

**Objective**: [What error scenario are we testing?]

**Preconditions**:
- [Setup]

**Test Steps**:
1. [Trigger error condition]
2. [Observe behavior]

**Expected Result**:
- [Graceful error handling]
- [Proper error message]

**Actual Result**:
- [To be filled]

**Status**: ⏳ Not Run

---

### TC-04: [Integration Test]

**Objective**: [How do components work together?]

**Preconditions**:
- [Multiple modules set up]

**Test Steps**:
1. [Cross-module interaction]
2. [Data flow verification]

**Expected Result**:
- [End-to-end outcome]

**Actual Result**:
- [To be filled]

**Status**: ⏳ Not Run

## Defects Found

[Update this section during test execution]

### Defect-01: [Bug Title]
- **Severity**: Critical | High | Medium | Low
- **Test Case**: TC-XX
- **Description**: [What went wrong]
- **Steps to Reproduce**: [Minimal repro steps]
- **Debug File**: `debugging/[bug-name]-[date]-01.md`

## Performance Metrics

[If performance testing is in scope]

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response time | < 100ms | TBD | ⏳ |
| Memory usage | < 50MB | TBD | ⏳ |
| Throughput | > 1000 req/s | TBD | ⏳ |

## Follow-ups

[Actions needed after testing]

### Immediate
- [ ] Fix defect-01 → `debugging/[bug]-[date].md`
- [ ] Re-run TC-XX after fix

### Next Test Run
- [ ] Add regression test for [scenario]
- [ ] Expand coverage for [area]

### Future Enhancements
- [ ] Automate TC-XX
- [ ] Add performance benchmarks

## Test Execution Log

[Chronological record of test runs]

### Run 01 - YYYY-MM-DD HH:MM
- **Status**: In Progress
- **Tests Run**: 0/10
- **Notes**: Initial test plan creation

### Run 02 - YYYY-MM-DD HH:MM
- **Status**: [To be filled]
- **Tests Run**: [Count]
- **Notes**: [Observations]
```

## Test Case Types

### Unit Tests
- Test individual functions/methods
- Mock dependencies
- Fast execution

### Integration Tests
- Test module interactions
- Real dependencies (or realistic mocks)
- Verify data flow

### End-to-End Tests
- Test complete user workflows
- Full system integration
- Closest to production behavior

### Regression Tests
- Verify bugs stay fixed
- Run after code changes
- Prevent re-introduction of defects

## Best Practices

- Write tests before implementation (TDD mindset)
- Make tests deterministic (no flaky tests)
- Test one thing per test case
- Use descriptive test names
- Document why a test exists
- Keep tests maintainable

## Next Steps

After creating test plan:
- Review with implementation plan to ensure coverage
- Use test cases as acceptance criteria
- Execute tests during/after implementation
- If tests fail, invoke `/debug` to document bugs
- Update test file with actual results
- Link test results in implementation plan
