import type { HttpMethod } from '@sveltejs/kit';
import { z, type ZodSchema } from 'zod';
import { getAllSchema } from './schemas';
import type { Ecosystem } from './schemas';

async function _authenticatedCall<ST extends ZodSchema>(
  method: HttpMethod,
  path: string,
  responseSchema: ST | undefined,
  body?: Record<string, unknown>,
  fetch = window.fetch,
): Promise<z.infer<ST>> {
  const response = await fetch(`/api/ecosystems${path}`, {
    method,
    body: body && JSON.stringify(body),
  });

  if (response.headers.get('Content-Type') === null) {
    if (!response.ok) throw new Error('Server error');
    if (responseSchema) throw new Error('Unexpected empty body');

    return;
  }

  const parsed = await response.json();

  if (!response.ok) throw new Error(parsed.error);

  // console.log(parsed)

  if (!responseSchema) throw new Error('Missing zod schema for response');
  return responseSchema.parse(parsed);
}

// chainId: ChainId;?
export function getAll() {
  return _authenticatedCall('GET', '', getAllSchema, undefined);
}

export function create(ecosystem: Ecosystem) {
  return _authenticatedCall('POST', '', getAllSchema, ecosystem);
}
