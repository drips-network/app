import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isAllowedMultiSearchBody, isAllowedPath } from './validate-search-request';

vi.mock('$lib/utils/get-optional-env-var/private.js', () => ({
  default: (name: string) =>
    ({ MEILISEARCH_HOST: 'http://meili.test/', MEILISEARCH_API_KEY: 'secret' })[name],
}));

const { POST } = await import('./+server');

const validBody = {
  federation: {},
  queries: [
    { indexUid: 'projects', q: 'foo', federationOptions: { weight: 1.1 } },
    { indexUid: 'drip_lists', q: 'foo' },
  ],
};

function callPost(path: string, body: string) {
  const url = new URL(`http://localhost${path}`);
  const request = new Request(url, { method: 'POST', body });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return POST({ request, url } as any);
}

async function statusOf(promise: Response | Promise<Response>) {
  try {
    return (await promise).status;
  } catch (e) {
    return (e as { status: number }).status;
  }
}

describe('isAllowedPath', () => {
  it('allows only multi-search', () => {
    expect(isAllowedPath('/api/search/multi-search')).toBe(true);

    for (const path of [
      '/api/search/keys',
      '/api/search/indexes/projects/search',
      '/api/search/indexes/projects/documents',
      '/api/search/multi-search/',
      '/api/search/multi-search/../keys',
      '/api/search/multi%2Dsearch',
      '/api/search/swap-indexes',
      '/api/search/dumps',
    ]) {
      expect(isAllowedPath(path)).toBe(false);
    }
  });
});

describe('isAllowedMultiSearchBody', () => {
  it('accepts the body sent by the search bar', () => {
    expect(isAllowedMultiSearchBody(validBody)).toBe(true);
  });

  it('rejects queries against other indexes', () => {
    expect(isAllowedMultiSearchBody({ queries: [{ indexUid: 'secret_index', q: 'foo' }] })).toBe(
      false,
    );
    expect(
      isAllowedMultiSearchBody({
        queries: [{ indexUid: 'projects' }, { indexUid: 'secret_index' }],
      }),
    ).toBe(false);
  });

  it('rejects facetsByIndex for other indexes', () => {
    expect(
      isAllowedMultiSearchBody({
        ...validBody,
        federation: { facetsByIndex: { secret_index: ['name'] } },
      }),
    ).toBe(false);
  });

  it('rejects remote federation', () => {
    expect(
      isAllowedMultiSearchBody({
        queries: [{ indexUid: 'projects', federationOptions: { remote: 'other' } }],
      }),
    ).toBe(false);
  });

  it('rejects malformed bodies', () => {
    for (const body of [null, [], {}, { queries: [] }, { queries: [{}] }, { ...validBody, x: 1 }]) {
      expect(isAllowedMultiSearchBody(body)).toBe(false);
    }
  });
});

describe('POST /api/search/[...path]', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(new Response('{"hits":[]}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('proxies multi-search requests', async () => {
    const res = await callPost('/api/search/multi-search', JSON.stringify(validBody));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('{"hits":[]}');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://meili.test/multi-search',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(validBody) }),
    );
  });

  it('returns 404 for other paths without contacting Meilisearch', async () => {
    expect(await statusOf(callPost('/api/search/keys', '{}'))).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    expect(await statusOf(callPost('/api/search/multi-search', 'not json'))).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for queries against other indexes', async () => {
    const body = JSON.stringify({ queries: [{ indexUid: 'secret_index', q: '' }] });

    expect(await statusOf(callPost('/api/search/multi-search', body))).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
