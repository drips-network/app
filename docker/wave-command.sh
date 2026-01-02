#!/bin/sh

# If WAVE_PUBLIC_URL is not set, try to find it from Cloudflare Tunnel
if [ -z "$WAVE_PUBLIC_URL" ]; then
  # Note: synchronization is handled by docker-compose healthchecks.
  # If we are here, 'url.txt' should already exist if cloudflared is running.
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
