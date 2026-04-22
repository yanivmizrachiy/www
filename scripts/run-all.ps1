$ErrorActionPreference = "Continue"

Write-Host "`n=== START APP ===" -ForegroundColor Cyan
Start-Process powershell -WorkingDirectory $PWD -ArgumentList '-NoExit','-Command','npm run dev'

Start-Sleep -Seconds 3

Write-Host "`n=== OPEN DEV LOGIN ===" -ForegroundColor Cyan
Start-Process "http://127.0.0.1:3000/dev/login"

Write-Host "`n=== HEALTH ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 10
  Write-Host $r.Content -ForegroundColor Green
} catch {
  Write-Host "Health not reachable yet." -ForegroundColor Yellow
}