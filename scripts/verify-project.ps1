param(
    [string]$CondaEnvironment = "skripsi"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Set-Location -LiteralPath $ProjectRoot
Write-Host "1/3 ESLint" -ForegroundColor Cyan
& npm run lint
if ($LASTEXITCODE -ne 0) { throw "ESLint gagal." }

Write-Host "2/3 Next.js production build" -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) { throw "Build Next.js gagal." }

Write-Host "3/3 Python compile check" -ForegroundColor Cyan
Set-Location -LiteralPath (Join-Path $ProjectRoot "backend")
& conda run --no-capture-output -n $CondaEnvironment python -m compileall -q .
if ($LASTEXITCODE -ne 0) { throw "Pemeriksaan Python gagal." }

Write-Host "Semua pemeriksaan lulus." -ForegroundColor Green
