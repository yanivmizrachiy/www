<#
  admin-readiness-check.ps1

  בדיקת מוכרות בלבד (read-only). לא עושה deploy, לא דורש secrets,
  לא מדפיס ערכי env. בודק:
    - git status נקי
    - /guide external asset מכיל את טקסטי המצגת
    - /admin-hub external asset מכיל את טקסטי מרכז השליטה
    - האם ה-bundle החיצוני נבנה עם env אמיתי או placeholder (בלי להדפיס ערכים)

  שימוש:
    pwsh ./scripts/admin-readiness-check.ps1
#>

[CmdletBinding()]
param(
  [string]$BaseUrl = "https://www-tijc.onrender.com"
)

$ErrorActionPreference = "Stop"

function Get-Bundle([string]$route) {
  $r = Get-Random
  $html = Invoke-WebRequest "$BaseUrl/$route`?nocache=$r" -UseBasicParsing -TimeoutSec 30
  $m = [regex]::Match($html.Content, 'assets/index-[A-Za-z0-9_-]+\.js')
  if (-not $m.Success) { return $null }
  return (Invoke-WebRequest "$BaseUrl/$($m.Value)" -UseBasicParsing -TimeoutSec 60).Content
}

# --- git ---
$gitClean = $false
try { $gitClean = [string]::IsNullOrWhiteSpace((git status --short 2>$null | Out-String)) } catch {}

# --- external bundles (guide + admin share one SPA bundle) ---
$guideOk = $false
$adminOk = $false
$envConfigured = "unknown"

try {
  $bundle = Get-Bundle "guide"
  if ($bundle) {
    $guideStrings = @("המדריך המלא למורים", "איילת קריספין", "העתקת קישור למצגת", "כאן ייכנס צילום אמיתי מתוך Moodle")
    $adminStrings = @("מרכז השליטה של יניב", "בודק הרשאות", "אין הרשאת מנהל", "שליחת קישור התחברות", "תצורת Supabase חסרה ב-Render")

    $guideOk = ($guideStrings | Where-Object { -not $bundle.Contains($_) }).Count -eq 0
    $adminOk = ($adminStrings | Where-Object { -not $bundle.Contains($_) }).Count -eq 0

    # env: placeholder markers => not configured; absent => configured.
    # Never prints URL/key values.
    $hasPlaceholder = $bundle.Contains("placeholder.supabase.co") -or $bundle.Contains("placeholder-key")
    $envConfigured = if ($hasPlaceholder) { "false" } else { "true" }
  }
} catch {
  Write-Host "network error while fetching external bundle: $($_.Exception.Message)"
}

# --- next manual action ---
$next = if (-not $guideOk -or -not $adminOk) {
  "external deploy not current — redeploy from branch, then re-run this check."
} elseif ($envConfigured -ne "true") {
  "set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY on Render and redeploy."
} else {
  "run migration + create Yaniv's Supabase Auth user + insert his auth.users.id into admin_users (see docs/ADMIN_SETUP.md)."
}

Write-Host ""
Write-Host "GIT_CLEAN=$gitClean"
Write-Host "GUIDE_EXTERNAL_OK=$guideOk"
Write-Host "ADMIN_HUB_EXTERNAL_OK=$adminOk"
Write-Host "SUPABASE_ENV_CONFIGURED_ON_RENDER=$envConfigured"
Write-Host "NEXT_MANUAL_ACTION: $next"
