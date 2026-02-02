param(
  [string]$Prompt = "check current/status.md and proceed using workflows/ultrathink.md until all success metrics are met",
  [string]$StatusPath = "current/status.md",
  [string]$SuccessPattern = "Success metrics: MET",
  [string[]]$StopHooks = @("STOP_HOOK", "WAIT_FOR_USER", "BLOCKED"),
  [string[]]$BlockerPatterns = @("no webcam", "installation issue", "hardware"),
  [string]$TelegramConfigPath = "current/secrets/telegram.json",
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
Write-LoopLog ("BlockerPatterns: " + ($BlockerPatterns -join ", "))
Write-LoopLog "TelegramConfigPath: $TelegramConfigPath"

function Send-TelegramMessage {
  param(
    [string]$Message,
    [string]$ConfigPath
  )

  if (-not (Test-Path $ConfigPath)) {
    Write-LoopLog "Telegram config not found at $ConfigPath"
    return
  }

  try {
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
  } catch {
    Write-LoopLog "Telegram config invalid JSON at $ConfigPath"
    return
  }

  $token = $config.token
  $chatId = $config.chatId
  if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($chatId)) {
    Write-LoopLog "Telegram config missing token/chatId"
    return
  }

  $url = "https://api.telegram.org/bot$token/sendMessage"
  $payload = @{
    chat_id = $chatId
    text = $Message
  }

  try {
    Invoke-RestMethod -Method Post -Uri $url -Body $payload | Out-Null
    Write-LoopLog "Telegram alert sent"
  } catch {
    Write-LoopLog "Telegram alert failed: $($_.Exception.Message)"
  }
}

for ($i = 1; $i -le $MaxRuns; $i++) {
  Write-LoopLog "Run $i..."
  $startMessage = @"
Beavercode loop started.
Project: $((Get-Location).Path)
Run: $i of $MaxRuns
Prompt: $Prompt
"@
  Send-TelegramMessage -Message $startMessage -ConfigPath $TelegramConfigPath
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
    $hitBlocker = $false
    $blockerHitValue = ""
    foreach ($hook in $StopHooks) {
      if ($hook -and ($status -match [regex]::Escape($hook))) {
        Write-LoopLog "Stop hook detected ($hook). Looping same prompt."
        $hitStopHook = $true
        break
      }
    }

    foreach ($pattern in $BlockerPatterns) {
      if ($pattern -and ($status -match $pattern)) {
        Write-LoopLog "Blocker pattern detected ($pattern)."
        $hitBlocker = $true
        $blockerHitValue = $pattern
        break
      }
    }

    if ($hitStopHook -or $hitBlocker) {
      $message = @"
Beavercode loop blocked.
Project: $((Get-Location).Path)
Run: $i
Hook: $blockerHitValue
Prompt: $Prompt
"@
      Send-TelegramMessage -Message $message -ConfigPath $TelegramConfigPath
    }

    if (-not $hitStopHook) {
      Write-LoopLog "No stop hook detected. Continuing."
    }
  } else {
    Write-LoopLog "Status file not found: $StatusPath"
  }

  Start-Sleep -Seconds $IntervalSeconds
}
