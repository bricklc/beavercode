param(
  [string]$Prompt = "check current/status.md and proceed using workflows/ultrathink.md until all success metrics are met",
  [string]$StatusPath = "current/status.md",
  [string]$SuccessPattern = "Success metrics: MET",
  [string[]]$StopHooks = @("STOP_HOOK", "WAIT_FOR_USER", "BLOCKED"),
  [int]$IntervalSeconds = 15,
  [int]$MaxRuns = 3
)

function Write-LoopLog {
  param([string]$Message)
  Write-Host ("[codex-loop] " + $Message)
}

Write-LoopLog "Starting loop: interval=$IntervalSeconds sec, maxRuns=$MaxRuns"
Write-LoopLog "Prompt: $Prompt"
Write-LoopLog "StatusPath: $StatusPath"
Write-LoopLog "SuccessPattern: $SuccessPattern"
Write-LoopLog ("StopHooks: " + ($StopHooks -join ", "))

for ($i = 1; $i -le $MaxRuns; $i++) {
  Write-LoopLog "Run $i..."
  codex exec --full-auto "$Prompt"
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    Write-LoopLog "codex exec failed (exit $exitCode). Backing off..."
    Start-Sleep -Seconds $IntervalSeconds
    continue
  }

  if (Test-Path $StatusPath) {
    $status = Get-Content $StatusPath -Raw

    if ($SuccessPattern -and ($status -match $SuccessPattern)) {
      Write-LoopLog "Success metrics met. Stopping."
      break
    }

    $hitStopHook = $false
    foreach ($hook in $StopHooks) {
      if ($hook -and ($status -match [regex]::Escape($hook))) {
        Write-LoopLog "Stop hook detected ($hook). Looping same prompt."
        $hitStopHook = $true
        break
      }
    }

    if (-not $hitStopHook) {
      Write-LoopLog "No stop hook detected. Continuing."
    }
  } else {
    Write-LoopLog "Status file not found: $StatusPath"
  }

  Start-Sleep -Seconds $IntervalSeconds
}
