---
description: Automated visual testing using browser commands and screenshot observation
---

# /visual-test - Automated Visual Testing

**Purpose**: Run automated browser tests, capture screenshots, and observe results to verify UI behavior.

## When to Use

- After implementing UI changes
- Before merging code that affects frontend
- When verifying bug fixes visually
- During acceptance testing
- When you need visual evidence of UI state

## Workflow

### Phase 1: Setup

1. **Ensure Prerequisites**
   - Node.js installed
   - Playwright browsers installed: `npx playwright install chromium`
   - Target URL accessible (local server running or file path)

2. **Update Cheat Sheet** (if needed)
   - Add new UI elements to `tools/ui-elements.json`
   - Use human-readable names for elements
   ```json
   {
     "MyProject": {
       "buttons": { "Submit": "#submit-btn" },
       "inputs": { "Email": "#email" }
     }
   }
   ```

### Phase 2: Create Test Commands

3. **Define Test Scenario**
   - What user flow are we testing?
   - What actions should occur?
   - What outcome indicates success?

4. **Write Commands File**
   - Create `tools/<test-name>-commands.json`
   ```json
   {
     "url": "http://localhost:3000",
     "actions": [
       { "type": "click", "target": "Load Sample" },
       { "type": "fill", "target": "Email", "value": "test@example.com" },
       { "type": "click", "target": "Submit" },
       { "type": "waitForText", "target": "Status", "text": "success" }
     ],
     "captureBeforeAfter": true
   }
   ```

### Phase 3: Execute Test

5. **Run Browser Actions**
   ```bash
   node tools/browser-actions.js --commands tools/<test-name>-commands.json
   ```

6. **Check Output**
   - Screenshots saved to `testing/screenshots/actions/<date>/run-<nnn>/`
   - Observations template created at `observations.md`

### Phase 4: Observe and Assess

7. **Read Screenshots**
   - Use Read tool on captured PNG files
   - Start with final "after" screenshot
   - Check intermediate states if issues found

8. **Fill Observations**
   - Update `observations.md` with what you see
   - Mark each screenshot: correct / incorrect / unexpected
   - Note any issues

9. **Determine Result**
   - All actions successful + expected visual state = **PASS**
   - Any unexpected state or error = **FAIL**

### Phase 5: Report

10. **Update Test Plan** (if exists)
    - Mark test cases as Pass/Fail
    - Record actual results

11. **Create Defect** (if failed)
    - Document issue in `debugging/<issue>-<date>.md`
    - Include screenshot evidence
    - Link to observations

## Command Reference

### Supported Actions

| Action | Format | Description |
|--------|--------|-------------|
| `click` | `{"type": "click", "target": "Button Name"}` | Click element |
| `fill` | `{"type": "fill", "target": "Input", "value": "text"}` | Enter text |
| `type` | `{"type": "type", "target": "Input", "value": "text"}` | Type slowly |
| `press` | `{"type": "press", "target": "Input", "value": "Enter"}` | Press key |
| `hover` | `{"type": "hover", "target": "Menu"}` | Hover element |
| `scroll` | `{"type": "scroll", "target": "Footer"}` | Scroll to element |
| `select` | `{"type": "select", "target": "Dropdown", "value": "Option"}` | Select option |
| `check` | `{"type": "check", "target": "Checkbox"}` | Check box |
| `wait` | `{"type": "wait", "target": "Loading"}` | Wait for element |
| `waitForText` | `{"type": "waitForText", "target": "Status", "text": "done"}` | Wait for text |

### Target Resolution

Targets are resolved in order:
1. **Cheat sheet**: "Submit" → looks up in `ui-elements.json`
2. **Discovery**: Scans page for text content match
3. **Direct**: "#my-id" or ".my-class" used as-is

## Templates

### Quick Smoke Test
```json
{
  "url": "http://localhost:3000",
  "actions": [
    { "type": "wait", "target": "body" }
  ],
  "captureBeforeAfter": true
}
```

### Form Submission Test
```json
{
  "url": "http://localhost:3000/form",
  "actions": [
    { "type": "fill", "target": "Name", "value": "Test User" },
    { "type": "fill", "target": "Email", "value": "test@example.com" },
    { "type": "click", "target": "Submit" },
    { "type": "waitForText", "target": "Status", "text": "success" }
  ],
  "captureBeforeAfter": true
}
```

### Multi-Step Workflow Test
```json
{
  "url": "http://localhost:3000",
  "actions": [
    { "type": "click", "target": "Step 1" },
    { "type": "waitForText", "target": "Status", "text": "Step 1 complete" },
    { "type": "click", "target": "Step 2" },
    { "type": "waitForText", "target": "Status", "text": "Step 2 complete" },
    { "type": "click", "target": "Finish" },
    { "type": "waitForText", "target": "Status", "text": "Done" }
  ],
  "captureBeforeAfter": true
}
```

## Observation Template

After running tests, fill in `observations.md`:

```markdown
# Observation: run-<nnn>

## Summary
- **Test**: [What was tested]
- **Result**: Pass / Fail
- **Issues**: None / [List issues]

## Screenshots

### 01-after-click.png
- **Shows**: [What you see]
- **Expected**: [What should appear]
- **Assessment**: Correct / Incorrect
- **Issues**: None / [Describe]

## Recommendation
[Next action: proceed / fix issue / investigate]
```

## Best Practices

- **Name actions clearly**: Use human-readable target names
- **Wait for state changes**: Use `waitForText` after async operations
- **Capture evidence**: Keep `captureBeforeAfter: true` for debugging
- **Start simple**: Test one flow at a time
- **Check intermediate states**: Don't just look at final screenshot

## Integration with Other Workflows

- After `/plan`: Create visual tests for acceptance criteria
- After `/test-plan`: Automate manual test cases
- Before `/walkthrough`: Capture screenshots for documentation
- With `/debug`: Capture reproduction steps visually

## Example: Full Visual Test Session

```bash
# 1. Start your server
python backend/server.py &
npx serve frontend -l 3000 &

# 2. Run visual test
node tools/browser-actions.js --commands tools/smoke-test.json

# 3. Agent observes
# [Agent reads screenshots, updates observations.md]

# 4. Report result
# [Agent updates test plan with Pass/Fail]
```

## Troubleshooting

### "Executable doesn't exist" / Playwright not installed
```bash
npx playwright install chromium
```

### "URL not reachable"
- Ensure server is running before starting visual test
- Check port is correct (default: 3000 for frontend, 8000 for backend)
- For local files, use `file:///` prefix

### "Element not found"
1. Check element exists in `tools/ui-elements.json`
2. Or use direct selector: `{"target": "#my-element"}`
3. Verify element is visible on page (not hidden/collapsed)

### Timeouts on waitForText
- Default timeout is 15 seconds
- Check if the expected text actually appears
- Verify selector points to correct element

### Screenshots not captured
- Ensure `captureBeforeAfter: true` in commands
- Check `testing/screenshots/actions/` folder exists
- Verify write permissions

## Related Files

- Script: `tools/browser-actions.js`
- Cheat sheet: `tools/ui-elements.json`
- Screenshots: `testing/screenshots/actions/`
- Walkthrough: `walkthrough/browser-command-automation-v1.md`
