param(
    [string]$CondaEnvironment = "skripsi",
    [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendDirectory = Join-Path $ProjectRoot "backend"
$EnvironmentFile = Join-Path $BackendDirectory ".env"
$EnvironmentExample = Join-Path $BackendDirectory ".env.example"
$ValidationScript = Join-Path $PSScriptRoot "validate-backend.py"

# Launcher selalu berpindah ke folder backend agar import `app.*` milik FastAPI benar.
Set-Location -LiteralPath $BackendDirectory

if (-not (Get-Command conda -ErrorAction SilentlyContinue)) {
    throw "Conda tidak ditemukan. Jalankan dari PowerShell/Anaconda Prompt yang mengenali perintah conda."
}

# .env bersifat lokal dan tidak masuk Git. Salinan pertama dibuat otomatis.
if (-not (Test-Path -LiteralPath $EnvironmentFile)) {
    Copy-Item -LiteralPath $EnvironmentExample -Destination $EnvironmentFile
    Write-Host "backend/.env dibuat dari backend/.env.example" -ForegroundColor Yellow
}

# Validasi disimpan sebagai file Python. Conda 26 pada Windows menolak argumen
# `python -c` yang memuat baris baru dan sebelumnya menimbulkan NotImplementedError.
& conda run --no-capture-output -n $CondaEnvironment python $ValidationScript
if ($LASTEXITCODE -ne 0) {
    throw "Path model belum lengkap. Periksa backend/.env dan docs/PANDUAN_KODE_DAN_SKRIPSI.md."
}

if ($ValidateOnly) {
    Write-Host "Environment dan seluruh path model valid." -ForegroundColor Green
    exit 0
}

Write-Host "FastAPI: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger: http://127.0.0.1:8000/docs" -ForegroundColor Cyan

# --reload memudahkan pengembangan; server otomatis memuat ulang saat file Python berubah.
& conda run --no-capture-output -n $CondaEnvironment python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
if ($LASTEXITCODE -ne 0) {
    throw "Backend berhenti dengan exit code $LASTEXITCODE."
}
