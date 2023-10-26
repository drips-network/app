import isTest from './is-test';

const IPFS_GATEWAY_DOMAIN = 'drips.mypinata.cloud';

/**
 * Fetch the given hash from IPFS.
 * @param hash The hash to fetch.
 * @returns The raw `Response` of fetching the given hash from our Pinata
 * gateway.
 */
export async function fetchIpfs(hash: string) {
  if (isTest()) {
    // During E2E tests, the "fake pinata" service runs at localhost:3000.
    return fetch(`http://localhost:3000/ipfs/${hash}`);
  }

  return fetch(`https://${IPFS_GATEWAY_DOMAIN}/ipfs/${hash}`);
}

/**
 * Convert `ipfs://` protocol URIs to a Pinata gateway link. Returns the
 * original URI if it isnʼt an ipfs URI.
 * @param uri The URI to convert.
 * @returns The converted URI, or the original URI if it's not an IPFS URI.
 */
export function convertIpfsUri(uri: string) {
  if (!uri.startsWith('ipfs://')) return uri;

  const hash = uri.replace('ipfs://', '');

  return `https://${IPFS_GATEWAY_DOMAIN}/ipfs/${hash}`;
}
