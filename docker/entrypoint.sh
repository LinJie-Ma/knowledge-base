#!/bin/sh
set -e

# Seed the database
echo "[entrypoint] Running seed..."
cd /app/server
npx tsx src/seed.ts 2>&1 || echo "[entrypoint] Seed skipped or failed"

# Start Express backend in background
echo "[entrypoint] Starting Express on port 3000..."
npx tsx src/index.ts &
EXPRESS_PID=$!

# Wait for Express to be ready
sleep 2

# Start Nginx in foreground
echo "[entrypoint] Starting Nginx on port 80..."
nginx -g "daemon off;"
