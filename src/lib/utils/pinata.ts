/**
 * Minimal client for the two Pinata pinning endpoints we use.
 *
 * We used to use `@pinata/sdk` for this, but it ships a webpack bundle with a
 * years-old copy of axios baked in, so vulnerabilities in it can't be patched
 * from our side. The API surface we need is two REST calls, so we just make
 * them ourselves.
 *
 * Server-side only — these take Pinata API credentials.
 */

const BASE_URL = 'https://api.pinata.cloud';

export interface PinataPinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataCredentials {
  apiKey: string;
  secretApiKey: string;
}

function authHeaders({ apiKey, secretApiKey }: PinataCredentials) {
  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secretApiKey,
  };
}

async function parseResponse(res: Response, what: string): Promise<PinataPinResponse> {
  if (!res.ok) {
    throw new Error(`Pinata responded ${res.status} while pinning ${what}: ${await res.text()}`);
  }

  return res.json();
}

export async function pinJSONToIPFS(
  credentials: PinataCredentials,
  content: unknown,
  options?: { cidVersion?: 0 | 1 },
): Promise<PinataPinResponse> {
  const res = await fetch(`${BASE_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      ...authHeaders(credentials),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: content,
      ...(options ? { pinataOptions: options } : {}),
    }),
  });

  return parseResponse(res, 'JSON');
}

export async function pinFileToIPFS(
  credentials: PinataCredentials,
  file: Blob,
  { name }: { name: string },
): Promise<PinataPinResponse> {
  const formData = new FormData();
  formData.append('file', file, name);
  formData.append('pinataMetadata', JSON.stringify({ name }));

  const res = await fetch(`${BASE_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: authHeaders(credentials),
    body: formData,
  });

  return parseResponse(res, 'file');
}
