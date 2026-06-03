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
    Add-Line "- SKIP npm run $Name: package.json not found"
    return
  }

  try {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    $scripts = @($pkg.scripts.PSObject.Properties.Name)
  } catch {
    Add-Line "- FAIL read package.json: $($_.Exception.Message)"
    return
  }

  if ($scripts -notcontains $Name) {
    Add-Line "- SKIP npm run $Name: script missing"
    return
  }

  Write-Host "Running npm run $Name ..." -ForegroundColor Yellow
  npm run $Name
  if ($LASTEXITCODE -eq 0) {
    Add-Line "- PASS npm run $Name"
  } else {
    Add-Line "- FAIL npm run $Name exit=$LASTEXITCODE"
  }
}

Add-Line "# Safe Repo Preflight"
Add-Line ""
Add-Line "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-Line "Branch: $(git branch --show-current)"
Add-Line "Head: $(git log -1 --oneline)"
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
  Add-Line "- Scan '$pattern': $count hits"
}

Add-Line ""
Add-Line "## Current PR #253 safety check"

if (Get-Command gh -ErrorAction SilentlyContinue) {
  try {
    $pr = gh api "repos/yanivmizrachiy/www/pulls/253" | ConvertFrom-Json
    Add-Line "- PR253 state: $($pr.state)"
    Add-Line "- PR253 draft: $($pr.draft)"
    Add-Line "- PR253 additions: $($pr.additions)"
    Add-Line "- PR253 deletions: $($pr.deletions)"
    Add-Line "- PR253 changed files: $($pr.changed_files)"

    if ([int]$pr.deletions -gt ([int]$pr.additions * 3)) {
      Add-Line "- PR253 decision: DO NOT MERGE AS IS"
    } else {
      Add-Line "- PR253 decision: REVIEW CAREFULLY"
    }
  } catch {
    Add-Line "- PR253 check failed: $($_.Exception.Message)"
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
