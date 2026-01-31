---
description: Create a research document to inform ideation and implementation
---

# /research - Research Documentation

**Purpose**: Create a research paper to inform design decisions and implementation approaches.

## When to Use

- Investigating new technologies or patterns
- Studying prior art before implementation
- Analyzing existing codebase patterns
- Reviewing external sources for best practices

## Workflow

1. **Define Research Topic**
   - What specific question are we answering?
   - What decisions will this research inform?

2. **Determine File Name**
   - Format: `research/<topic>-<yyyy-mm-dd>.md`
   - Example: `research/event-sourcing-2026-01-26.md`
   - Use descriptive, kebab-case names

3. **Create Research Document**
   - Follow the academic structure from `research/README.md`:
     1. Basic Information (title, date, author)
     2. Research Objective / Problem Statement
     3. Background and Literature Review
     4. Methodology (how you researched)
     5. Key Findings / Results
     6. Discussion and Interpretation
     7. Conclusion
     8. Citations and References (with URLs)
     9. Critical Evaluation

4. **Conduct Research**
   - Use `search_web` for external sources
   - Use `grep_search` to find patterns in codebase
   - Use `read_url_content` for documentation
   - Review existing files in `research/` for related topics

5. **Document Findings**
   - Keep summaries concise and actionable
   - Cite all sources with URLs
   - Include code snippets if relevant
   - Note gaps in knowledge or areas for further research

6. **Link to Related Docs**
   - Reference related ideation files
   - Link to implementation plans if they exist
   - Cross-reference other research papers

## Template

```markdown
# [Research Topic]

**Date**: YYYY-MM-DD
**Researcher**: [Agent/Human]
**Status**: In Progress | Complete

## 1. Basic Information

- **Topic**: [Brief description]
- **Context**: [Why this research is needed]

## 2. Research Objective / Problem Statement

[What question are we trying to answer?]

## 3. Background and Literature Review

[What existing knowledge exists on this topic?]

## 4. Methodology

[How did we conduct this research?]
- Web search for: [keywords]
- Codebase analysis of: [files/patterns]
- Documentation review: [sources]

## 5. Key Findings / Results

[What did we discover?]

### Finding 1: [Title]
- **Source**: [URL or file path]
- **Summary**: [Key takeaway]
- **Relevance**: [How this applies to our work]

## 6. Discussion and Interpretation

[What do these findings mean for our project?]

## 7. Conclusion

[Final recommendations or insights]

## 8. Citations and References

1. [Source Title](URL)
2. [Source Title](URL)

## 9. Critical Evaluation

[What are the limitations of this research?]
[What questions remain unanswered?]
```

## Best Practices

- Start broad, then narrow focus
- Distinguish between facts and opinions
- Note confidence level of findings
- Document dead ends (so we don't repeat them)
- Update research if new information emerges

## Next Steps

After completing research:
- Invoke `/ideate` to design based on findings
- Reference this research doc in ideation
- Update `current/context.md` with key insights
