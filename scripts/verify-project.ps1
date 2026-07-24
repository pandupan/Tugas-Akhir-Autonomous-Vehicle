param(
    [string]$CondaEnvironment = "skripsi"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BehaviorCheckScript = Join-Path $PSScriptRoot "check-backend-behavior.py"

Set-Location -LiteralPath $ProjectRoot
Write-Host "1/4 ESLint" -ForegroundColor Cyan
& npm run lint
if ($LASTEXITCODE -ne 0) { throw "ESLint gagal." }

Write-Host "2/4 Next.js production build" -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) { throw "Build Next.js gagal." }

Write-Host "3/4 Python compile check" -ForegroundColor Cyan
Set-Location -LiteralPath (Join-Path $ProjectRoot "backend")
& conda run --no-capture-output -n $CondaEnvironment python -m compileall -q .
if ($LASTEXITCODE -ne 0) { throw "Pemeriksaan Python gagal." }

Write-Host "4/4 Backend behavior check" -ForegroundColor Cyan
& conda run --no-capture-output -n $CondaEnvironment python $BehaviorCheckScript
if ($LASTEXITCODE -ne 0) { throw "Pemeriksaan perilaku backend gagal." }

Write-Host "Semua pemeriksaan lulus." -ForegroundColor Green
