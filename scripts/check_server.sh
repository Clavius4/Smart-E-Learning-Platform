#!/usr/bin/env bash
set -euo pipefail

# Simple server check script for Smart E-Learning backend
# - Installs deps if missing
# - Starts backend in background
# - Polls /api/health until reachable or timeout

DEFAULT_BACKEND_DIR="smart-elearning-backend"
PORT=${PORT:-5000}
TIMEOUT=${TIMEOUT:-30}
# Backend host to use for health checks. In production set BACKEND_HOST or PRODUCTION_IP
BACKEND_HOST=${BACKEND_HOST:-${PRODUCTION_IP:-127.0.0.1}}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../$DEFAULT_BACKEND_DIR"
LOGFILE="/tmp/smart-elearning-backend-start.log"
HEALTH_FILE="/tmp/smart-elearning-backend-health.json"

echo "Backend dir: $BACKEND_DIR"
echo "Health check host: $BACKEND_HOST (use BACKEND_HOST or PRODUCTION_IP to override)"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "ERROR: Backend directory not found: $BACKEND_DIR"
  exit 2
fi

command -v node >/dev/null 2>&1 || { echo "ERROR: node not found in PATH"; exit 3; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm not found in PATH"; exit 4; }

cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies (this may take a while)..."
  npm install --silent
fi

echo "Starting backend (PORT=$PORT)... logs -> $LOGFILE"
PORT=$PORT NODE_ENV=production node server.js > "$LOGFILE" 2>&1 &
PID=$!
echo "Server PID: $PID"

trap 'echo "Cleaning up..."; kill $PID 2>/dev/null || true; wait $PID 2>/dev/null || true' EXIT

count=0
while [ $count -lt $TIMEOUT ]; do
  if command -v curl >/dev/null 2>&1; then
    if curl -s -f "http://${BACKEND_HOST}:$PORT/api/health" -m 2 -o "$HEALTH_FILE"; then
      echo "OK: Health endpoint reachable"
      if command -v jq >/dev/null 2>&1; then
        jq '.' "$HEALTH_FILE" || true
        db_status=$(jq -r '.services.database // "unknown"' "$HEALTH_FILE" 2>/dev/null || echo "unknown")
        echo "Database status: $db_status"
      else
        cat "$HEALTH_FILE"
        echo "(Install 'jq' for structured JSON checks)"
      fi
      exit 0
    fi
  else
    echo "ERROR: curl not found; please install curl to run health checks"
    exit 6
  fi

  sleep 1
  count=$((count+1))
done

echo "ERROR: Health endpoint not reachable after ${TIMEOUT}s. See logs: $LOGFILE"
echo "---- last 200 lines of log ----"
tail -n 200 "$LOGFILE" || true
exit 5
