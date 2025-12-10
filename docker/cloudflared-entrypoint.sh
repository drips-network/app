#!/bin/sh

if [ -n "$WAVE_PUBLIC_URL" ]; then
  echo "WAVE_PUBLIC_URL is set to '$WAVE_PUBLIC_URL'. Skipping Cloudflare Tunnel startup."
  exit 0
fi

apt-get update && apt-get install -y curl ca-certificates
curl -L --output /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x /usr/local/bin/cloudflared
mkdir -p /tmp/tunnel
rm -f /tmp/tunnel/url.txt
rm -f /tmp/tunnel/tunnel.log
rm -f /tmp/tunnel/ready

if [ -z "$TUNNEL_TOKEN" ]; then
  echo "No TUNNEL_TOKEN provided, starting Quick Tunnel..."
  # Run cloudflared in background, piping logs to file
  cloudflared tunnel --url http://wave:8000 2>&1 | tee /tmp/tunnel/tunnel.log &
  PID=$!
  # Wait for URL to appear in logs
  echo "Waiting for URL..."
  ( while true; do if grep -o 'https://[-a-z0-9.]*\.trycloudflare\.com' /tmp/tunnel/tunnel.log | head -n 1 > /tmp/tunnel/url.tmp && [ -s /tmp/tunnel/url.tmp ]; then mv /tmp/tunnel/url.tmp /tmp/tunnel/url.txt; touch /tmp/tunnel/ready; echo "URL captured: $(cat /tmp/tunnel/url.txt)"; break; fi; sleep 1; done ) &
  wait $PID
else
  echo "TUNNEL_TOKEN provided, starting Named Tunnel..."
  cloudflared tunnel run
fi
