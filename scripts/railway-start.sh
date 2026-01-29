#!/bin/sh

# Start the app on Railway with proper OpenTelemetry resource attributes
# RAILWAY_REPLICA_ID and RAILWAY_REGION are provided by Railway at runtime only.
# This takes any existing OTEL_RESOURCE_ATTRIBUTES and appends the instance ID and region.
# These two values are very important, because without them we have elevated DPM costs due to multiple
# instances writing the same metrics.

if [ -z "$OTEL_RESOURCE_ATTRIBUTES" ]; then
  APPEND_PREFIX=""
else
  APPEND_PREFIX=","
fi

export OTEL_RESOURCE_ATTRIBUTES="${OTEL_RESOURCE_ATTRIBUTES}${APPEND_PREFIX}service.instance.id=${RAILWAY_REPLICA_ID},cloud.region=${RAILWAY_REGION}"

echo "Starting with OTEL_RESOURCE_ATTRIBUTES: $OTEL_RESOURCE_ATTRIBUTES"

exec node --require ./build/telemetry.cjs build
