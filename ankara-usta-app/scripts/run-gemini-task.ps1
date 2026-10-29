[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$TaskFile
)

$ErrorActionPreference = 'Stop'

$agyCommand = Get-Command agy -ErrorAction Stop
$resolvedTaskFile = Resolve-Path -LiteralPath $TaskFile -ErrorAction Stop
$task = Get-Content -LiteralPath $resolvedTaskFile -Raw -Encoding UTF8

if ([string]::IsNullOrWhiteSpace($task)) {
  throw "Task file is empty: $resolvedTaskFile"
}

& $agyCommand.Source `
  --print $task `
  --model gemini-3.8-flash-high `
  --mode accept-edits `
  --print-timeout 0

exit $LASTEXITCODE
