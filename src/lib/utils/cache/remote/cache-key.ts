import * as crypto from 'crypto';

export default function cacheKey(data: string, prefix: string) {
  const hash = crypto.createHash('sha256').update(data).digest('hex');

  return `${prefix}:${hash}`;
}
