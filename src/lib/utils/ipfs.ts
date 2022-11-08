const IPFS_GATEWAY_DOMAIN = 'drips.mypinata.cloud';

/**
 * Fetch the given hash from IPFS.
 * @param hash The hash to fetch.
 * @returns The raw `Response` of fetching the given hash from our Pinata
 * gateway.
 */
export async function fetchIpfs(hash: string) {
  return fetch(`https://${IPFS_GATEWAY_DOMAIN}/ipfs/${hash}`);
}

/**
 * Convert `ipfs://` protocol URIs to a Pinata gateway link. Returns the
 * original URI if it isn't an ipfs URI.
 * @param uri The URI to convert.
 * @returns The converted URI, or the original URI if it's not an IPFS URI.
 */
export function convertIpfsUri(uri: string) {
  if (!uri.startsWith('ipfs://')) return uri;

  const hash = uri.replace('ipfs://', '');

  return `https://${IPFS_GATEWAY_DOMAIN}/ipfs/${hash}`;
}
