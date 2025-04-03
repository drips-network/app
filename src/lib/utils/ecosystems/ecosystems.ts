import type { HttpMethod } from '@sveltejs/kit';
import { z, type ZodSchema } from 'zod';
import {
  getAllResponseSchema,
  getResponseSchema,
  createResponseSchema,
  deployResponseSchema,
} from './schemas';
import type { Deploy, Ecosystem } from './schemas';

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

  if (!response.ok) {
    throw new Error(parsed.error);
  }

  if (!responseSchema) throw new Error('Missing zod schema for response');
  return responseSchema.parse(parsed);
}

// chainId: ChainId;?
export function getAll() {
  return _authenticatedCall('GET', '', getAllResponseSchema, undefined);
}

export function get(id: string, fetch: typeof global.fetch) {
  return _authenticatedCall('GET', `/${id}`, getResponseSchema, undefined, fetch);
}

export function create(ecosystem: Ecosystem) {
  return _authenticatedCall('POST', '', createResponseSchema, ecosystem);
}

export function deploy(id: string, deployData: Deploy, fetch: typeof global.fetch) {
  return _authenticatedCall('POST', `/${id}/deploy`, deployResponseSchema, deployData, fetch);
}
