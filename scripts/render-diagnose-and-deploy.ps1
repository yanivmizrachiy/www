<#
  render-diagnose-and-deploy.ps1

  מטרה: לאבחן ולהפעיל deploy ל-Render לשירות www, ולוודא ש-/guide עובד חיצונית.

  - מבקש Render API Key מקומית (Read-Host -AsSecureString). לא מדפיס אותו.
  - בודק service, branch, commit ו-deploy אחרון.
  - מפעיל deploy רק אם מבקשים במפורש (-Deploy).
  - מאמת ש-https://<host>/guide מחזיר index.html ושה-JS asset מכיל את טקסט ההדרכה.

  שימוש:
    pwsh ./scripts/render-diagnose-and-deploy.ps1              # אבחון בלבד
    pwsh ./scripts/render-diagnose-and-deploy.ps1 -Deploy      # אבחון + הפעלת deploy
#>

[CmdletBinding()]
param(
  [string]$ServiceId  = "srv-d7t5b93rjlhs73db5m20",
  [string]$ExternalUrl = "https://www-tijc.onrender.com",
  [switch]$Deploy
)

$ErrorActionPreference = "Stop"

# --- מפתח API: מקומי בלבד, לא מודפס ---
$key = $env:RENDER_API_KEY
if ([string]::IsNullOrWhiteSpace($key)) {
  $secure = Read-Host "Render API Key (input hidden)" -AsSecureString
  $key = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}
if ([string]::IsNullOrWhiteSpace($key)) { Write-Host "לא הוזן מפתח. עוצר." -ForegroundColor Yellow; exit 1 }

$headers = @{ Authorization = "Bearer $key"; Accept = "application/json" }
$api = "https://api.render.com/v1"

function Get-Json($url, $method = "GET", $body = $null) {
  $p = @{ Uri = $url; Headers = $headers; Method = $method }
  if ($body) { $p.Body = ($body | ConvertTo-Json -Depth 6); $p.ContentType = "application/json" }
  return Invoke-RestMethod @p
}

Write-Host "== שירות ==" -ForegroundColor Cyan
$svc = Get-Json "$api/services/$ServiceId"
Write-Host ("name:   {0}" -f $svc.name)
Write-Host ("type:   {0}" -f $svc.type)
Write-Host ("branch: {0}" -f $svc.branch)
$det = $svc.serviceDetails
if ($det) {
  Write-Host ("buildCommand: {0}" -f $det.buildCommand)
  Write-Host ("startCommand: {0}" -f $det.startCommand)
}

Write-Host "`n== Deploy אחרון ==" -ForegroundColor Cyan
$deploys = Get-Json "$api/services/$ServiceId/deploys?limit=1"
$last = $deploys[0].deploy
if ($last) {
  Write-Host ("id:      {0}" -f $last.id)
  Write-Host ("status:  {0}" -f $last.status)
  Write-Host ("commit:  {0}  {1}" -f $last.commit.id.Substring(0,7), ($last.commit.message -split "`n")[0])
  Write-Host ("created: {0}" -f $last.createdAt)
}

if ($Deploy) {
  Write-Host "`n== מפעיל deploy חדש ==" -ForegroundColor Cyan
  $newDep = Get-Json "$api/services/$ServiceId/deploys" "POST" @{ clearCache = "do_not_clear" }
  Write-Host ("deploy triggered: {0}  status: {1}" -f $newDep.id, $newDep.status) -ForegroundColor Green
  Write-Host "עקוב ב-dashboard עד live, ואז הרץ שוב בלי -Deploy כדי לאמת /guide."
} else {
  Write-Host "`n(אבחון בלבד. הוסף -Deploy כדי להפעיל deploy.)" -ForegroundColor DarkGray
}

# --- אימות /guide חיצוני דרך ה-JS asset ---
Write-Host "`n== אימות /guide חיצוני ==" -ForegroundColor Cyan
try {
  $guide = Invoke-WebRequest "$ExternalUrl/guide" -UseBasicParsing -TimeoutSec 30
  $isHtml = $guide.Content -match '<div id="root">'
  $m = [regex]::Match($guide.Content, 'assets/index-[A-Za-z0-9_-]+\.js')
  Write-Host ("/guide status: {0}  isIndexHtml: {1}" -f $guide.StatusCode, $isHtml)

  if ($m.Success) {
    $assetUrl = "$ExternalUrl/$($m.Value)"
    $asset = Invoke-WebRequest $assetUrl -UseBasicParsing -TimeoutSec 60
    $hasGuide  = $asset.Content.Contains("המדריך המלא למורים")
    $hasAyelet = $asset.Content.Contains("איילת קריספין")
    Write-Host ("asset: {0}" -f $m.Value)
    Write-Host ("  'המדריך המלא למורים': {0}" -f $hasGuide)
    Write-Host ("  'איילת קריספין':      {0}" -f $hasAyelet)
    if ($isHtml -and $hasGuide -and $hasAyelet) {
      Write-Host "`nGuide deployed: True" -ForegroundColor Green
    } else {
      Write-Host "`nGuide deployed: False (השרת עדיין לא מגיש dist מעודכן — המתן לסיום ה-deploy)" -ForegroundColor Yellow
    }
  } else {
    Write-Host "לא נמצא JS asset ב-/guide — כנראה מוגש dashboard.html ישן. המתן ל-deploy החדש." -ForegroundColor Yellow
    Write-Host "`nGuide deployed: False" -ForegroundColor Yellow
  }
} catch {
  Write-Host ("שגיאת רשת באימות /guide: {0}" -f $_.Exception.Message) -ForegroundColor Yellow
  Write-Host "`nGuide deployed: False" -ForegroundColor Yellow
}
