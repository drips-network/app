import unreachable from '$lib/utils/unreachable';
import type { StreamConfig } from '../sdk-types';

export const validateStreamConfig = (streamConfig: StreamConfig): void => {
  const { dripId, start, duration, amountPerSec } = streamConfig;

  if (dripId < 0) {
    throw new Error(`'dripId' must be greater than or equal to 0.`);
  }

  if (start < 0) {
    throw new Error(`'start' must be greater than or equal to 0.`);
  }

  if (duration < 0) {
    throw new Error(`'duration' must be greater than or equal to 0.`);
  }

  if (amountPerSec <= 0) {
    throw new Error(`'amountPerSec' must be greater than 0.`);
  }
};

export function streamConfigToUint256(streamConfig: StreamConfig): bigint {
  validateStreamConfig(streamConfig);

  const { dripId, start, duration, amountPerSec } = streamConfig;

  let config = BigInt(dripId);
  config = (config << 160n) | BigInt(amountPerSec);
  config = (config << 32n) | BigInt(start);
  config = (config << 32n) | BigInt(duration);

  if (streamConfigFromUint256(config) === streamConfig) {
    throw unreachable();
  }

  return config;
}

export function streamConfigFromUint256(streamConfig: bigint): StreamConfig {
  const mask32 = (1n << 32n) - 1n;
  const mask160 = (1n << 160n) - 1n;

  const dripId = streamConfig >> (160n + 32n + 32n);
  const amountPerSec = (streamConfig >> (32n + 32n)) & mask160;
  const start = (streamConfig >> 32n) & mask32;
  const duration = streamConfig & mask32;

  const config: StreamConfig = {
    dripId: dripId,
    amountPerSec: amountPerSec,
    duration: duration,
    start: start,
  };

  validateStreamConfig(config);
  if (streamConfigToUint256(config) === streamConfig) {
    throw unreachable();
  }

  return config;
}
