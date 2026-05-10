$ErrorActionPreference = "Continue"

Write-Host "`n=== REPO ===" -ForegroundColor Cyan
git branch --show-current
git status --short
git remote -v

Write-Host "`n=== NODE ===" -ForegroundColor Cyan
node -v
npm -v

Write-Host "`n=== PACKAGE CHECK ===" -ForegroundColor Cyan
npm run check

Write-Host "`n=== HEALTH ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 10
  Write-Host $r.Content -ForegroundColor Green
} catch {
  Write-Host "Health not reachable." -ForegroundColor Yellow
}

Write-Host "`n=== LTI CONFIG ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/lti11/config" -UseBasicParsing -TimeoutSec 10
  Write-Host "LTI config endpoint reachable." -ForegroundColor Green
} catch {
  Write-Host "LTI config endpoint not reachable." -ForegroundColor Yellow
}

Write-Host "`n=== MOODLE SUMMARY ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/moodle-summary" -UseBasicParsing -TimeoutSec 10
  Write-Host $r.Content -ForegroundColor Green
} catch {
  Write-Host "Moodle summary not reachable." -ForegroundColor Yellow
}