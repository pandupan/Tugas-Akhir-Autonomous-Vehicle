$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Next.js harus dijalankan dari root karena package.json dan app/ berada di sini.
Set-Location -LiteralPath $ProjectRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm tidak ditemukan. Instal Node.js atau buka PowerShell yang mengenali npm."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules"))) {
    Write-Host "node_modules belum ada; menjalankan npm install..." -ForegroundColor Yellow
    & npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install gagal dengan exit code $LASTEXITCODE."
    }
}

# Nilai ini dibaca InferenceStudio untuk mengirim frame ke FastAPI.
if (-not $env:NEXT_PUBLIC_INFERENCE_API_URL) {
    $env:NEXT_PUBLIC_INFERENCE_API_URL = "http://127.0.0.1:8000"
}

Write-Host "Next.js: http://localhost:3000" -ForegroundColor Green
Write-Host "Demo: http://localhost:3000/demo" -ForegroundColor Cyan
& npm run dev
if ($LASTEXITCODE -ne 0) {
    throw "Frontend berhenti dengan exit code $LASTEXITCODE."
}
