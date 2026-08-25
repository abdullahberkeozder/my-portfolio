$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsDirectory = Join-Path $projectRoot ".tools"
$cacheDirectory = Join-Path $projectRoot ".npm-cache"
$localNode = Get-ChildItem -LiteralPath $toolsDirectory -Directory -Filter "node-v*-win-x64" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1

if ($localNode) {
    $env:Path = "$($localNode.FullName);$env:Path"
}

$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    Write-Error "npm bulunamadı. Node.js 22.13.0 veya daha yeni bir sürüm kurun."
    exit 1
}

$nodeVersion = [version]((& node -p "process.versions.node").Trim())
if ($nodeVersion -lt [version]"22.13.0") {
    Write-Error "Node.js 22.13.0 veya daha yeni bir sürüm gerekli. Mevcut sürüm: $nodeVersion"
    exit 1
}

Set-Location -LiteralPath $projectRoot
& $npmCommand.Source ci --cache $cacheDirectory
exit $LASTEXITCODE
