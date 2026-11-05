[CmdletBinding()]
param(
  [int]$PollSeconds = 2,
  [switch]$SkipPermissions
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$orchestrationRoot = Join-Path $projectRoot '.orchestration'
$inbox = Join-Path $orchestrationRoot 'inbox'
$processing = Join-Path $orchestrationRoot 'processing'
$outbox = Join-Path $orchestrationRoot 'outbox'
$failed = Join-Path $orchestrationRoot 'failed'

foreach ($directory in @($inbox, $processing, $outbox, $failed)) {
  New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

$agyCommand = Get-Command agy -ErrorAction Stop
Write-Host "Gemini worker hazır: $inbox"
Write-Host "Model: gemini-3.8-flash-high"

while ($true) {
  $tasks = Get-ChildItem -LiteralPath $inbox -Filter '*.task.md' -File | Sort-Object CreationTime

  foreach ($taskFile in $tasks) {
    $processingFile = Join-Path $processing $taskFile.Name
    $resultFile = Join-Path $outbox ($taskFile.BaseName + '.result.md')
    $failedFile = Join-Path $failed ($taskFile.BaseName + '.error.md')

    try {
      Move-Item -LiteralPath $taskFile.FullName -Destination $processingFile -ErrorAction Stop
      $task = Get-Content -LiteralPath $processingFile -Raw -Encoding UTF8
      if ([string]::IsNullOrWhiteSpace($task)) {
        throw "Task file is empty: $($taskFile.Name)"
      }

      $arguments = @(
        '--print', $task,
        '--model', 'gemini-3.8-flash-high',
        '--mode', 'accept-edits',
        # 0s lets the CLI finish the turn instead of the worker imposing a
        # three-minute cap on repository edits. The supervisor still owns
        # cancellation and records the result or failure file.
        '--print-timeout', '0s'
      )
      if ($SkipPermissions) {
        $arguments += '--dangerously-skip-permissions'
      }

      Write-Host "Çalışıyor: $($taskFile.Name)"
      $startedAt = Get-Date
      $output = (& $agyCommand.Source @arguments 2>&1 | Out-String)
      $exitCode = $LASTEXITCODE
      $finishedAt = Get-Date

      @(
        "# Gemini task sonucu"
        ""
        "- Task: $($taskFile.Name)"
        "- Model: gemini-3.8-flash-high"
        "- Başlangıç: $startedAt"
        "- Bitiş: $finishedAt"
        "- Exit code: $exitCode"
        ""
        "## Çıktı"
        ""
        $output
      ) | Set-Content -LiteralPath $resultFile -Encoding UTF8

      Remove-Item -LiteralPath $processingFile -Force
      Write-Host "Tamamlandı: $($taskFile.Name) (exit $exitCode)"
    } catch {
      @(
        "# Gemini task hatası"
        ""
        "- Task: $($taskFile.Name)"
        "- Tarih: $(Get-Date)"
        ""
        "## Hata"
        ""
        $_.Exception.ToString()
      ) | Set-Content -LiteralPath $failedFile -Encoding UTF8

      if (Test-Path -LiteralPath $processingFile) {
        Remove-Item -LiteralPath $processingFile -Force
      }
      Write-Warning "Başarısız: $($taskFile.Name). Ayrıntı: $failedFile"
    }
  }

  Start-Sleep -Seconds ([Math]::Max(1, $PollSeconds))
}
