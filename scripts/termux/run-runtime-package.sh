#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

REPO="https://github.com/yanivmizrachiy/www.git"
RUNTIME_BRANCH="termux-runtime"
PKG_REPO="$HOME/moodle-hub-runtime-package"
APP_DIR="$HOME/moodle-hub-prebuilt-app"
PORT="3000"
LOG_DIR="$HOME/moodle-hub-prebuilt-logs"

echo "=== RUN MOODLE HUB PREBUILT RUNTIME ==="

mkdir -p "$LOG_DIR" "$HOME/bin"
termux-wake-lock 2>/dev/null || true

pkg install -y git nodejs-lts curl jq cloudflared >/dev/null 2>&1 || true

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "ERROR: cloudflared לא זמין ב־Termux."
  exit 2
fi

rm -rf "$PKG_REPO"
git clone --depth 1 --branch "$RUNTIME_BRANCH" "$REPO" "$PKG_REPO"

test -f "$PKG_REPO/moodle-teacher-hub-termux-runtime.tar.gz" || {
  echo "ERROR: runtime package missing. ודא ש־GitHub Action הסתיים בהצלחה."
  exit 3
}

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$PKG_REPO/moodle-teacher-hub-termux-runtime.tar.gz" -C "$APP_DIR"

cd "$APP_DIR"

test -d dist || { echo "ERROR: dist missing"; exit 4; }
test -f src/server.js || { echo "ERROR: src/server.js missing"; exit 5; }

echo "=== Installing production dependencies only ==="
npm install --omit=dev

echo
echo "הקלד/הדבק LTI_SHARED_SECRET מהמ Moodle ואז Enter."
echo "הטקסט יוצג במסך כדי לוודא שההדבקה נקלטה. לא לצלם ולא לשלוח."
while [ -z "${LTI_SHARED_SECRET:-}" ]; do
  printf "LTI_SHARED_SECRET: "
  IFS= read -r LTI_SHARED_SECRET
  LTI_SHARED_SECRET="$(printf '%s' "$LTI_SHARED_SECRET" | tr -d '\r\n')"
done

pkill -f "node src/server.js" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://127.0.0.1:${PORT}" 2>/dev/null || true
sleep 2

TUNNEL_LOG="$LOG_DIR/cloudflared.log"
SERVER_LOG="$LOG_DIR/server.log"
rm -f "$TUNNEL_LOG" "$SERVER_LOG"

echo "=== Starting Cloudflare tunnel ==="
nohup cloudflared tunnel --url "http://127.0.0.1:${PORT}" > "$TUNNEL_LOG" 2>&1 &

PUBLIC_URL=""
for i in $(seq 1 45); do
  sleep 2
  PUBLIC_URL="$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)"
  if [ -n "$PUBLIC_URL" ]; then break; fi
done

if [ -z "$PUBLIC_URL" ]; then
  echo "ERROR: לא נמצאה כתובת Cloudflare"
  tail -120 "$TUNNEL_LOG" || true
  exit 6
fi

echo "PUBLIC_URL=$PUBLIC_URL"

echo "=== Starting Node server ==="
nohup env \
  PORT="$PORT" \
  APP_BASE_URL="$PUBLIC_URL" \
  LTI_CONSUMER_KEY="yaniv-lti-tool" \
  LTI_SHARED_SECRET="$LTI_SHARED_SECRET" \
  COOKIE_SECURE="true" \
  npm run start > "$SERVER_LOG" 2>&1 &

sleep 8

echo "=== Public health ==="
curl -i --max-time 25 "$PUBLIC_URL/health" || {
  echo "PUBLIC_HEALTH_FAILED"
  tail -120 "$SERVER_LOG" || true
  exit 7
}

echo
echo "======================================"
echo "TERMUX_PREBUILT_RUNTIME_READY"
echo "Moodle Tool URL החדש:"
echo "$PUBLIC_URL/api/lti/launch"
echo "======================================"
echo
echo "שים את הכתובת ב־Moodle Tool URL, שמור, ופתח את Moodle Teacher Hub."
echo "שרת: tail -f $SERVER_LOG"
echo "Tunnel: tail -f $TUNNEL_LOG"
