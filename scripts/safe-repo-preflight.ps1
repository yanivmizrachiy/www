$ErrorActionPreference = "Continue"

$Repo = Split-Path -Parent $PSScriptRoot
Set-Location $Repo

$Report = New-Object System.Collections.Generic.List[string]

function Add-Line([string]$Text) {
  $Report.Add($Text) | Out-Null
  Write-Host $Text
}

function Run-NpmScriptIfExists([string]$Name) {
  if (!(Test-Path "package.json")) {
    Add-Line ("- SKIP npm run {0}: package.json not found" -f $Name)
    return
  }

  try {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    $scripts = @($pkg.scripts.PSObject.Properties.Name)
  } catch {
    Add-Line ("- FAIL read package.json: {0}" -f $_.Exception.Message)
    return
  }

  if ($scripts -notcontains $Name) {
    Add-Line ("- SKIP npm run {0}: script missing" -f $Name)
    return
  }

  Write-Host ("Running npm run {0} ..." -f $Name) -ForegroundColor Yellow
  npm run $Name
  if ($LASTEXITCODE -eq 0) {
    Add-Line ("- PASS npm run {0}" -f $Name)
  } else {
    Add-Line ("- FAIL npm run {0} exit={1}" -f $Name, $LASTEXITCODE)
  }
}

Add-Line "# Safe Repo Preflight"
Add-Line ""
Add-Line ("Date: {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
Add-Line ("Branch: {0}" -f (git branch --show-current))
Add-Line ("Head: {0}" -f (git log -1 --oneline))
Add-Line ""

Add-Line "## Protected-area scans"

$protectedPatterns = @(
  "Teacher Release",
  "teacher_release",
  "PR #127",
  "process.env",
  "PRIVATE KEY",
  "JWT",
  "access_token",
  "service_role"
)

foreach ($pattern in $protectedPatterns) {
  $hits = git grep -n -I -- "$pattern" 2>$null
  $count = 0
  if ($hits) {
    $count = @($hits).Count
  }
  Add-Line ("- Scan '{0}': {1} hits" -f $pattern, $count)
}

Add-Line ""
Add-Line "## Current PR #253 safety check"

if (Get-Command gh -ErrorAction SilentlyContinue) {
  try {
    $pr = gh api "repos/yanivmizrachiy/www/pulls/253" | ConvertFrom-Json
    Add-Line ("- PR253 state: {0}" -f $pr.state)
    Add-Line ("- PR253 draft: {0}" -f $pr.draft)
    Add-Line ("- PR253 additions: {0}" -f $pr.additions)
    Add-Line ("- PR253 deletions: {0}" -f $pr.deletions)
    Add-Line ("- PR253 changed files: {0}" -f $pr.changed_files)

    if ([int]$pr.deletions -gt ([int]$pr.additions * 3)) {
      Add-Line "- PR253 decision: DO NOT MERGE AS IS"
    } else {
      Add-Line "- PR253 decision: REVIEW CAREFULLY"
    }
  } catch {
    Add-Line ("- PR253 check failed: {0}" -f $_.Exception.Message)
  }
} else {
  Add-Line "- SKIP PR253 check: gh not found"
}

Add-Line ""
Add-Line "## Build/check scripts"

$WantedScripts = @(
  "check",
  "build",
  "doctor",
  "typecheck",
  "audit:moodle-automation",
  "audit:automation-capabilities",
  "audit:automation-capability-contract",
  "audit:automation-evidence-log",
  "audit:auto-extraction-source-router",
  "audit:multi-teacher-isolation-evidence",
  "audit:supabase-rls-isolation-readiness"
)

foreach ($script in $WantedScripts) {
  Run-NpmScriptIfExists $script
}

Add-Line ""
Add-Line "## Git status"
Add-Line '```'
Add-Line ((git status --short | Out-String).Trim())
Add-Line '```'

$Report -join "`n"
