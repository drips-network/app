#!/bin/sh

if [ -n "$WAVE_PUBLIC_URL" ]; then
  echo "WAVE_PUBLIC_URL is set to '$WAVE_PUBLIC_URL'. Skipping Cloudflare Tunnel startup."
  touch /tmp/tunnel/ready
  while true; do
    touch /tmp/tunnel/ready
    sleep 5
  done
fi

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
  (
    while true; do
      if grep -o 'https://[-a-z0-9.]*\.trycloudflare\.com' /tmp/tunnel/tunnel.log | head -n 1 > /tmp/tunnel/url.tmp && [ -s /tmp/tunnel/url.tmp ]; then
        mv /tmp/tunnel/url.tmp /tmp/tunnel/url.txt
        touch /tmp/tunnel/ready
        echo "URL captured: $(cat /tmp/tunnel/url.txt)"
        # Keep ready file fresh
        while true; do
          sleep 5
          touch /tmp/tunnel/ready
        done
        break
      fi
      sleep 1
    done
  ) &
  wait $PID
else
  echo "TUNNEL_TOKEN provided, starting Named Tunnel..."
  cloudflared tunnel run
fi
