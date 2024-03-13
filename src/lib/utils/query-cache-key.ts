import * as crypto from 'crypto';

/**
 * Generates a cache key for a cached GQL query. Appends a hash of query + variables to the prefix,
 * in order to avoid shit breaking when we deploy a new version that updates a cached query or its variables.
 */
export default function queryCacheKey(query: string, variables: unknown, prefix: string) {
  const hash = crypto
    .createHash('sha256')
    .update(query + String(variables))
    .digest('hex');

  return `${prefix}:${hash}`;
}
