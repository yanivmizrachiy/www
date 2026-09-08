$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repoRoot

$expectedBranch = 'fix/guide-consolidated-20260908'
$currentBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) { throw 'git branch failed' }

Write-Host "Guide local verification" -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"
Write-Host "Branch: $currentBranch"
Write-Host 'Mode: verify/build only; no merge, push, or deployment.' -ForegroundColor Yellow

if ($currentBranch -ne $expectedBranch) {
  throw "Wrong branch. Expected '$expectedBranch' but current branch is '$currentBranch'. No files were changed."
}

$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'git status failed' }
if ($dirty.Count -gt 0) {
  Write-Host 'Local changes detected; verification will not pull or reset anything.' -ForegroundColor Yellow
  $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is not available in PATH.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is not available in PATH.' }

Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"

Write-Host "`n=== npm ci ===" -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }

$checks = @(
  'check',
  'typecheck',
  'audit:guide',
  'audit:guide-surface',
  'audit:guide-entry',
  'audit:guide-focus',
  'audit:guide-copy',
  'report:guide-gaps',
  'build',
  'doctor'
)

foreach ($check in $checks) {
  Write-Host "`n=== npm run $check ===" -ForegroundColor Cyan
  npm run $check
  if ($LASTEXITCODE -ne 0) { throw "npm run $check failed with exit code $LASTEXITCODE" }
}

Write-Host "`nGUIDE LOCAL VERIFY: PASS" -ForegroundColor Green
Write-Host 'Dependencies are installed and all canonical Guide checks passed.' -ForegroundColor Green
Write-Host 'No deployment was performed.' -ForegroundColor Yellow
