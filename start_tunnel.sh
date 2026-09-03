#!/bin/bash
# Start cloudflared, capture tunnel URL, push to GitHub on each restart
cd /root/AZS_Volshkiy

# Kill any old cloudflared
pkill -f 'cloudflared tunnel' 2>/dev/null
sleep 1

# Start cloudflared and capture URL from its output
cloudflared tunnel --url http://localhost:8080 --no-autoupdate 2>&1 | while IFS= read -r line; do
  echo "$line"
  if echo "$line" | grep -q 'trycloudflare.com'; then
    TUNNEL_URL=$(echo "$line" | grep -oP 'https://[a-zA-Z0-9._-]+\.trycloudflare\.com')
    if [ -n "$TUNNEL_URL" ]; then
      echo "Tunnel URL captured: $TUNNEL_URL"
      echo "{\"api_url\": \"$TUNNEL_URL\", \"updated\": \"$(date -Iseconds)\"}" > /root/AZS_Volshkiy/tunnel_url.json
      (
        cd /root/AZS_Volshkiy
        git add tunnel_url.json
        git diff --staged --quiet || (git commit -m "Update tunnel URL: $TUNNEL_URL" && git push origin main)
      ) &
    fi
  fi
done
