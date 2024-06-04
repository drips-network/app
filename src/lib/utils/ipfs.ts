import { PUBLIC_PINATA_GATEWAY_URL } from '$env/static/public';

/**
 * Fetch the given hash from IPFS.
 * @param hash The hash to fetch.
 * @returns The raw `Response` of fetching the given hash from our Pinata
 * gateway.
 */
export async function fetchIpfs(hash: string, f = fetch) {
  return f(`${PUBLIC_PINATA_GATEWAY_URL}/ipfs/${hash}`);
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

  return `${PUBLIC_PINATA_GATEWAY_URL}/ipfs/${hash}`;
}

/**
 * Pin the given data to IPFS.
 * @param data The data to pin.
 * @returns The hash of the pinned data.
 */
export async function pin(data: Record<string, unknown>, f = fetch) {
  const res = await f('/api/ipfs/pin', {
    method: 'POST',
    body: JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  });

  if (!res.ok) {
    throw new Error(`Pinning account metadata failed: ${await res.text()}`);
  }

  return res.text();
}
