---
description: Automatically verify test results after test execution
---

# /verify-tests - Test Result Verification

**Purpose**: Automatically check test transcripts and update project status when user says "test is done" or similar.

## When to Use

- When user says: "test is done", "ran the tests", "test complete"
- After any `python run_tests.py` execution
- When checking test results autonomously

## Autonomous Workflow

**CRITICAL**: When user indicates tests are complete OR when you complete code changes, IMMEDIATELY execute this workflow without asking.

### Option A: Run Tests Yourself (Preferred)

When you've just written or modified code, proactively run tests:

```bash
python run_tests.py tests/test_<module>.py
```

This will:
1. Execute the tests
2. Auto-save transcript to `testing/transcripts/`
3. Display results in terminal
4. Then proceed to Step 2 below

### Option B: Check Existing Transcript

If user says they already ran tests, skip to Step 1.

### Step 1: Find Latest Transcript

```bash
# Get the latest transcript file
ls -t testing/transcripts/*.txt | head -1
```

Use Glob to find: `testing/transcripts/*.txt`
- Files are numbered sequentially (01, 02, 03...)
- Highest number = latest test
- Format: `NN-<test_name>-YYYY-MM-DD.txt`

### Step 2: Read Transcript

Use Read tool on the latest transcript file.

### Step 3: Parse Results

Extract from transcript:
- **Total tests**: Look for "N passed" or "N failed"
- **Pass rate**: Calculate passed/total
- **Failures**: Note any FAILED test names
- **Errors**: Check for exceptions or error traces
- **Duration**: Note execution time

### Step 4: Update Todo

Based on results, update `current/todo.md`:

**If all tests passed**:
```markdown
- [x] Run tests: `python run_tests.py tests/test_X.py`
- [x] Verify all tests pass - N/N PASSED (transcript NN)
```

**If tests failed**:
```markdown
- [x] Run tests: `python run_tests.py tests/test_X.py`
- [ ] Fix test failures - N/M FAILED (transcript NN):
  - test_name_1 - <brief reason>
  - test_name_2 - <brief reason>
```

### Step 5: Report to User

**Success format**:
```
Test Results: ALL PASSED ✓

N/N tests passed in Xs - testing/transcripts/NN-<name>-YYYY-MM-DD.txt:line

Coverage breakdown:
- Area 1: X tests
- Area 2: X tests
```

**Failure format**:
```
Test Results: FAILURES DETECTED

N/M tests passed (X% pass rate) - testing/transcripts/NN-<name>-YYYY-MM-DD.txt:line

Failed tests:
- test_name_1:line - <error summary>
- test_name_2:line - <error summary>

Next: Review failures and fix issues
```

### Step 6: Next Action

**If passed**:
- Mark milestone/task complete in todo.md
- Ask: "Ready to proceed to [next milestone]?"

**If failed**:
- Create debugging task in todo.md
- Offer to investigate failures
- DO NOT mark milestone complete

## Example Invocation

```
User: "done, check the transcript"
Agent: [Executes workflow autonomously]
  1. Glob: testing/transcripts/*.txt
  2. Read: testing/transcripts/01-test_understanding_model-2026-01-26.txt
  3. Parse: "31 passed in 0.05s"
  4. Edit: current/todo.md (mark tests complete)
  5. Report: "Test Results: ALL PASSED ✓..."
```

## Triggers

### Autonomous Test Execution
Run tests yourself when:
- You just created new test files
- You modified code covered by tests
- You fixed a bug that had test coverage
- User asks you to "run the tests"
- Milestone/task includes running tests

### Transcript Verification Only
Just check transcripts when:
- User says "test is done", "ran the tests"
- User says "check the transcript"
- User explicitly ran tests themselves
- Tests are already running in background

## Integration

This workflow is invoked AFTER:
- User runs `python run_tests.py <path>`
- Any test execution completes

This workflow is BEFORE:
- Moving to next milestone
- Marking features complete
- Deploying/committing code

## Notes

- **Never skip verification**: Always check transcript, never assume tests passed
- **Be thorough**: Read full transcript, don't just check summary line
- **Context matters**: Link transcript line numbers in reports
- **Update atomically**: Both todo.md AND user report should reflect same status