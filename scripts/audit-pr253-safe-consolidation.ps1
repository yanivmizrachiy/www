param(
  [string]$RepoName = "yanivmizrachiy/www",
  [int]$PrNumber = 253
)

$ErrorActionPreference = "Stop"
$Report = New-Object System.Collections.Generic.List[string]

function Add-Line([string]$Text) {
  $Report.Add($Text) | Out-Null
  Write-Host $Text
}

Add-Line "# PR #$PrNumber Safety Audit"
Add-Line ""
Add-Line "Repo: $RepoName"
Add-Line "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-Line ""

if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
  Add-Line "## ERROR"
  Add-Line "GitHub CLI not found. This audit requires an authenticated gh CLI."
  $Report -join "`n"
  exit 2
}

try {
  $pr = gh api "repos/$RepoName/pulls/$PrNumber" | ConvertFrom-Json
  $files = gh api "repos/$RepoName/pulls/$PrNumber/files?per_page=100" | ConvertFrom-Json
} catch {
  Add-Line "## ERROR"
  Add-Line "Failed to fetch PR data from GitHub: $($_.Exception.Message)"
  $Report -join "`n"
  exit 2
}

Add-Line "## PR"
Add-Line "- Title: $($pr.title)"
Add-Line "- State: $($pr.state)"
Add-Line "- Draft: $($pr.draft)"
Add-Line "- Additions: $($pr.additions)"
Add-Line "- Deletions: $($pr.deletions)"
Add-Line "- Changed files: $($pr.changed_files)"
Add-Line ""

Add-Line "## Changed files"
foreach ($f in $files) {
  Add-Line "- $($f.filename) | +$($f.additions) -$($f.deletions) | $($f.status)"
}
Add-Line ""

$Risk = 0
$Warnings = New-Object System.Collections.Generic.List[string]

if ([int]$pr.deletions -gt ([int]$pr.additions * 3)) {
  $Risk += 3
  $Warnings.Add("Large deletions compared with additions. Possible replacement instead of careful integration.") | Out-Null
}

$dangerFiles = @(
  "src/hooks/useImports.tsx",
  "src/components/AppSidebar.tsx",
  "src/pages/Students.tsx",
  "src/pages/GradebookImport.tsx"
)

foreach ($df in $dangerFiles) {
  $hit = $files | Where-Object { $_.filename -eq $df }
  if ($hit) {
    $Risk += 2
    $Warnings.Add("Sensitive file changed: $df") | Out-Null
    if ([int]$hit.deletions -gt 50) {
      $Risk += 2
      $Warnings.Add("Large deletion in sensitive file: $df (-$($hit.deletions))") | Out-Null
    }
  }
}

$patchText = ""
foreach ($f in $files) {
  if ($null -ne $f.patch) {
    $patchText += "`n" + [string]$f.patch
  }
}

if ($patchText -match "useLTIContext") {
  $Risk += 2
  $Warnings.Add("Found useLTIContext. Verify this hook exists on main and has the correct import path.") | Out-Null
}

if ($patchText -match "Moodle Teacher Hub") {
  $Risk += 1
  $Warnings.Add("Found Moodle Teacher Hub text. Verify it does not replace the Hebrew product name.") | Out-Null
}

if ($patchText -match "useImportsOverview|useImportedStudents|useGradesMatrix|useNrpsRoster") {
  Add-Line "## Important hooks mentioned in patch"
  Add-Line "The patch mentions existing import/NRPS hooks. Review whether they are preserved or removed."
  Add-Line ""
}

Add-Line "## Risk score"
Add-Line "$Risk"
Add-Line ""

Add-Line "## Warnings"
if ($Warnings.Count -eq 0) {
  Add-Line "No major warnings found by automated audit."
} else {
  foreach ($w in $Warnings) {
    Add-Line "- $w"
  }
}

Add-Line ""
Add-Line "## Recommendation"
if ($Risk -ge 6) {
  Add-Line "DO NOT MERGE AS IS."
  Add-Line "Create a clean PR from main and rescue only safe parts."
} elseif ($Risk -ge 3) {
  Add-Line "REVIEW CAREFULLY BEFORE MERGE."
  Add-Line "Sensitive files changed. Require build, typecheck, audits, and manual route checks."
} else {
  Add-Line "LOWER RISK, STILL REQUIRE CHECKS."
  Add-Line "Run the full test suite and review changed files before merge."
}

Add-Line ""
Add-Line "## Protected areas"
Add-Line "- Do not touch PR #127."
Add-Line "- Do not change SQL/RLS/env/secrets."
Add-Line "- Do not set Teacher Release to YES."
Add-Line "- Preserve manual fallback."

$Report -join "`n"
