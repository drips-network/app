import { error } from '@sveltejs/kit';

export default async function ensureOk(responsePromise: Promise<Response>): Promise<Response> {
  const intermediateResponse = await responsePromise;
  if (!intermediateResponse.ok) {
    const text = await intermediateResponse.text();
    throw error(intermediateResponse.status, {
      message: `Fetch response was not ok: ${intermediateResponse.url} ${text}`,
    });
  }

  return responsePromise;
}

export function fetchOk(fetcher: typeof window.fetch) {
  return (...args: Parameters<typeof fetcher>) => {
    return ensureOk(fetcher(...args));
  };
}
