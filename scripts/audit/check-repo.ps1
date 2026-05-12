$ErrorActionPreference = "Continue"

Write-Host "`n=== GIT STATUS ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== BRANCH ===" -ForegroundColor Cyan
git branch --show-current

Write-Host "`n=== REMOTE ===" -ForegroundColor Cyan
git remote -v

Write-Host "`n=== NODE CHECK ===" -ForegroundColor Cyan
node --check .\src\server.js

Write-Host "`n=== PACKAGE CHECK ===" -ForegroundColor Cyan
npm run check

Write-Host "`n=== HEALTH CHECK ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 10
  Write-Host $r.Content -ForegroundColor Green
} catch {
  Write-Host "Health not reachable right now." -ForegroundColor Yellow
}