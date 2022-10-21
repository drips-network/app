import { browser } from '$app/environment';

/**
 * Fetch a variable from the environment. Client-side, it attempts reading
 * the variable from embedded vite meta vars. Server-side, it attempts to
 * read from `process.env`.
 * @param key The env var key to fetch.
 * @returns The string value of the environment variable.
 * @throw An error if the requested environment variable could not be found.
 */
export default function getEnvVar(key: string): string {
  const val = browser ? import.meta.env[key] : process.env[key];

  if (!val) throw new Error(`Undefined environment variable ${key}`);

  return val;
}
