#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
NEW="$HOME/luz-teddy"
WWW="$HOME/www"
OLD_PUBLIC_URL="https://yanivmizrachiy.github.io/www/luz-teddy/clean.html"

echo "PUBLISH_LUZ_TO_OLD_URL_SAFE_START $STAMP"
echo "NO_DELETE=true"

cd "$NEW"
git fetch origin main
git checkout main
git pull --rebase origin main

cd "$WWW"
git fetch origin main
git checkout main
git pull --rebase origin main

mkdir -p "$WWW/luz-teddy"

# Copy without deleting existing files, to protect the public URL.
(
  cd "$NEW"
  tar --exclude='.git' -cf - .
) | (
  cd "$WWW/luz-teddy"
  tar xf -
)

cat > "$WWW/luz-teddy/SOURCE_OF_TRUTH.md" <<EOM
# מקור אמת ללוז בית הספר

עודכן: $STAMP

מקור האמת החדש:
yanivmizrachiy/luz-teddy

הקישור הציבורי הזה נשאר פעיל:
$OLD_PUBLIC_URL

אין למחוק את התיקייה הזו בלי אישור מפורש.
EOM

cd "$WWW"
git config user.name >/dev/null 2>&1 || git config user.name "yanivmiz77"
git config user.email >/dev/null 2>&1 || git config user.email "yanivmiz77@gmail.com"

git add luz-teddy
if git diff --cached --quiet; then
  echo "NO_CHANGES_TO_PUBLISH"
else
  git commit -m "Publish luz-teddy from canonical repo $STAMP"
  git pull --rebase origin main
  git push origin main
fi

echo "PUBLISH_LUZ_TO_OLD_URL_SAFE_OK"
echo "OldPublicUrl=$OLD_PUBLIC_URL"
EOM
