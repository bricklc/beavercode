param(
    [string]$Ideation,
    [string]$Plan
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-LatestDocPath {
    param(
        [string]$Folder
    )
    $items = Get-ChildItem -Path $Folder -Filter *.md -File |
        Where-Object { $_.Name -ne "README.md" } |
        Sort-Object LastWriteTime -Descending

    if (-not $items) {
        throw "No markdown files found in $Folder"
    }

    return $items[0].FullName
}

if (-not $Ideation) {
    $Ideation = Get-LatestDocPath -Folder "ideation"
}

if (-not $Plan) {
    $Plan = Get-LatestDocPath -Folder "implementation planning"
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is required to run the validator."
    exit 2
}

Write-Host "Validating ideation: $Ideation"
Write-Host "Validating plan: $Plan"

& python "tools/validate_docs.py" --ideation $Ideation --plan $Plan
exit $LASTEXITCODE
