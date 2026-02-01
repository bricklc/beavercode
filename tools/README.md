# Tools

## Workflow Validation Gate

Use the validator to enforce required sections in ideation and implementation plan docs.

### PowerShell (auto-detect latest docs)
```powershell
.\tools\validate_docs.ps1
```

### PowerShell (explicit files)
```powershell
.\tools\validate_docs.ps1 -Ideation "ideation/001-fea-solver-mvp-2026-01-30-01.md" -Plan "implementation planning/001-fea-solver-mvp-2026-01-30.md"
```

### Python (explicit files)
```bash
python tools/validate_docs.py --ideation "ideation/001-fea-solver-mvp-2026-01-30-01.md" --plan "implementation planning/001-fea-solver-mvp-2026-01-30.md"
```

Exit code is non-zero on failure, which should block further workflow steps.
