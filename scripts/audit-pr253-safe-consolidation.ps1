param(
  [string]$RepoName = "yanivmizrachiy/www",
  [int]$PrNumber = 253
)

$ErrorActionPreference = "Continue"
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
  Add-Line "GitHub CLI not found."
  $Report -join "`n"
  exit 2
}

try {
  $pr = gh api "repos/$RepoName/pulls/$PrNumber" | ConvertFrom-Json
  $files = gh api "repos/$RepoName/pulls/$PrNumber/files?per_page=100" | ConvertFrom-Json
} catch {
  Add-Line "## ERROR"
  Add-Line "Failed to fetch PR data: $($_.Exception.Message)"
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

if ($pr.deletions -gt ($pr.additions * 3)) {
  $Risk += 3
  $Warnings.Add("מחיקות גדולות בהרבה מהוספות — חשד להחלפה במקום שילוב.") | Out-Null
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
    $Warnings.Add("קובץ רגיש השתנה: $df") | Out-Null
    if ($hit.deletions -gt 50) {
      $Risk += 2
      $Warnings.Add("מחיקות גדולות בקובץ רגיש: $df (-$($hit.deletions))") | Out-Null
    }
  }
}

$patchText = ""
foreach ($f in $files) {
  if ($f.patch) {
    $patchText += "`n" + $f.patch
  }
}

if ($patchText -match "useLTIContext") {
  $Risk += 2
  $Warnings.Add("נמצא useLTIContext — לוודא שה-hook קיים ב-main ובנתיב נכון.") | Out-Null
}

if ($patchText -match "Moodle Teacher Hub") {
  $Risk += 1
  $Warnings.Add("נמצא Moodle Teacher Hub — לוודא שלא מחליף את שם המוצר המודל החכם.") | Out-Null
}

Add-Line "## Risk score"
Add-Line "$Risk"
Add-Line ""

Add-Line "## Warnings"
if ($Warnings.Count -eq 0) {
  Add-Line "No major warnings found."
} else {
  foreach ($w in $Warnings) {
    Add-Line "- $w"
  }
}

Add-Line ""
Add-Line "## Recommendation"
if ($Risk -ge 6) {
  Add-Line "DO NOT MERGE AS IS."
  Add-Line "להציל רק חלקים בטוחים בתוך PR חדש ונקי מ-main."
} elseif ($Risk -ge 3) {
  Add-Line "REVIEW CAREFULLY BEFORE MERGE."
} else {
  Add-Line "LOWER RISK, STILL REQUIRE CHECKS."
}

$Report -join "`n"
