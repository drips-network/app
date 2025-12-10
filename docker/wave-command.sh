#!/bin/sh

# If WAVE_PUBLIC_URL is not set, try to find it from Cloudflare Tunnel
if [ -z "$WAVE_PUBLIC_URL" ]; then
  if [ ! -f /tmp/tunnel/url.txt ]; then
    echo "WAVE_PUBLIC_URL not set and url.txt not found. Installing inotify-tools..."
    if command -v apt-get >/dev/null; then
      apt-get update && apt-get install -y inotify-tools
    elif command -v apk >/dev/null; then
      apk add inotify-tools
    fi

    if command -v inotifywait >/dev/null; then
       echo "Waiting for Cloudflare Tunnel URL event..."
       inotifywait -e moved_to -t 60 --include 'url.txt' /tmp/tunnel
    else
       echo "inotifywait not found. Falling back to sleep loop."
       TIMEOUT=30
       COUNT=0
       while [ ! -f /tmp/tunnel/url.txt ] && [ $COUNT -lt $TIMEOUT ]; do
         sleep 1
         COUNT=$((COUNT+1))
       done
    fi
  fi

  if [ -f /tmp/tunnel/url.txt ]; then
    export WAVE_PUBLIC_URL=$(cat /tmp/tunnel/url.txt)
    echo "Found Tunnel URL: $WAVE_PUBLIC_URL"
  else
    echo "No tunnel URL found. Defaulting to localhost."
    export WAVE_PUBLIC_URL="http://localhost:8000"
  fi
fi

if [ -n "$GITHUB_OAUTH_CALLBACK_URL" ]; then
  # Extract path component from existing URL (remove scheme://host:port)
  CALLBACK_PATH=$(echo "$GITHUB_OAUTH_CALLBACK_URL" | sed -E 's|^[^:]+://[^/]+(/.*)$|\1|')
  export GITHUB_OAUTH_CALLBACK_URL="${WAVE_PUBLIC_URL}${CALLBACK_PATH}"
else
  export GITHUB_OAUTH_CALLBACK_URL="${WAVE_PUBLIC_URL}/api/auth/oauth/github/callback"
fi

echo "Starting Wave with GITHUB_OAUTH_CALLBACK_URL=$GITHUB_OAUTH_CALLBACK_URL"
deno task db:migrate && deno task start
