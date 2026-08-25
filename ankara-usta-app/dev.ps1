$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDirectory = Join-Path $projectRoot ".tools\node-v24.19.0-win-x64"
$npmCommand = Join-Path $nodeDirectory "npm.cmd"

if (-not (Test-Path -LiteralPath $npmCommand)) {
    Write-Error "Projeye özel Node.js kurulumu bulunamadı: $nodeDirectory"
    exit 1
}

$env:Path = "$nodeDirectory;$env:Path"
Set-Location -LiteralPath $projectRoot
& $npmCommand run dev -- --host localhost --port 5175
exit $LASTEXITCODE
