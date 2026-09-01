#!/bin/bash
# start_tunnel.sh — Starts cloudflared and saves the URL to tunnel_url.json

REPO_DIR="/root/AZS_Volshkiy"
LOG_FILE="/tmp/cf_tunnel.log"

# Kill any existing tunnel processes
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# Start cloudflared in background
cloudflared tunnel --url http://localhost:8080 > "$LOG_FILE" 2>&1 &
CF_PID=$!

# Wait for URL to appear
for i in $(seq 1 15); do
    URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_FILE" 2>/dev/null | head -1)
    if [ -n "$URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$URL" ]; then
    echo "ERROR: Could not get tunnel URL after 15 seconds"
    cat "$LOG_FILE"
    exit 1
fi

echo "Tunnel URL: $URL"

# Save URL to JSON file in repo
echo "{\"api_url\": \"$URL\", \"updated\": \"$(date -Iseconds)\"}" > "$REPO_DIR/tunnel_url.json"

# Push to GitHub Pages
cd "$REPO_DIR"
git add tunnel_url.json
git diff --staged --quiet || (git commit -m "Update tunnel URL: $URL" && git push origin main)

echo "Done! Tunnel is running with PID $CF_PID at $URL"
