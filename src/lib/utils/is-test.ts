import { env } from '$env/dynamic/public';

export default function isTest(): boolean {
  return env?.PUBLIC_TEST_MODE === 'true';
}
