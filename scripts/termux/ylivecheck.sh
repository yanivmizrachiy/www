#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

LIVE="${LIVE:-https://www-tijc.onrender.com}"

echo "MTH_YLIVECHECK_START"
echo "LIVE=$LIVE"

OK="YES"

for path in /health /api/sync/status /api/persistence/status /api/persistence/validate /api/release/readiness; do
  echo ""
  echo "=== $path ==="
  BODY="$(curl -L -sS --connect-timeout 10 --max-time 25 "$LIVE$path" || true)"
  printf '%s' "$BODY" | head -c 500
  echo ""

  if ! printf '%s' "$BODY" | grep -q '"ok":true'; then
    OK="NO"
    echo "LIVE_PATH_NOT_OK=$path"
  fi
done

if [ "$OK" = "YES" ]; then
  echo "MTH_YLIVECHECK_DONE"
  echo "LIVE_OK=YES"
  echo "TEACHER_RELEASE_READY=NO"
else
  echo "MTH_YLIVECHECK_FAILED"
  echo "LIVE_OK=NO"
  exit 1
fi
