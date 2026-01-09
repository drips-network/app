#!/bin/bash
# Auto-enable 'wave' profile if image is accessible

# Default tag to main if not set
WAVE_TAG=${WAVE_TAG:-main}

# if PUBLIC_WAVE_API_URL and PUBLIC_INTERNAL_WAVE_API_URL are set, skip detection
if [ -n "${PUBLIC_WAVE_API_URL:-}" ] && [ -n "${PUBLIC_INTERNAL_WAVE_API_URL:-}" ]; then
  echo "PUBLIC_WAVE_API_URL and PUBLIC_INTERNAL_WAVE_API_URL are set. Skipping Wave service detection."
else
  # Check if we can access the image manifest
  if docker manifest inspect "j537/wave:$WAVE_TAG" > /dev/null 2>&1; then
    echo "🌊 Access to 'j537/wave:$WAVE_TAG' confirmed."

    if [ -z "${COMPOSE_PROFILES:-}" ]; then
      echo "Enabling 'wave' profile."
      export COMPOSE_PROFILES=wave
    elif [[ ",${COMPOSE_PROFILES}," != *",wave,"* ]]; then
      echo "Adding 'wave' to existing profiles."
      export COMPOSE_PROFILES="${COMPOSE_PROFILES},wave"
    fi
  else
    echo "⚠️  No access to 'j537/wave:$WAVE_TAG'. Wave service will not be enabled."
  fi
fi
