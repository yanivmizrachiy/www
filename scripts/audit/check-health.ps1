$ErrorActionPreference = "Continue"
Write-Host "Checking /health..." -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing
    Write-Host $r.Content -ForegroundColor Green
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
}