import { authenticatedCall } from './call';
import { paginatedResponseSchema } from './types/pagination';
import { tagSchema } from './types/waveProgram';
import parseRes from './utils/parse-res';

export async function getTags(
  f = fetch,
  options: { page?: number; pageSize?: number; search?: string } = {},
) {
  const params = new URLSearchParams();

  if (options.page !== undefined) {
    params.append('page', options.page.toString());
  }

  if (options.pageSize !== undefined) {
    params.append('pageSize', options.pageSize.toString());
  }

  if (options.search) {
    params.append('search', options.search);
  }

  return parseRes(
    paginatedResponseSchema(tagSchema),
    await authenticatedCall(f, `/api/tags?${params.toString()}`),
  );
}

export async function createTag(
  f = fetch,
  data: { name: string; color: string; imageUrl?: string | null },
) {
  return parseRes(
    tagSchema,
    await authenticatedCall(f, '/api/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  );
}

export async function updateTag(
  f = fetch,
  tagId: string,
  data: { name?: string; color?: string; imageUrl?: string | null },
) {
  return parseRes(
    tagSchema,
    await authenticatedCall(f, `/api/tags/${tagId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  );
}

export async function deleteTag(f = fetch, tagId: string) {
  await authenticatedCall(f, `/api/tags/${tagId}`, {
    method: 'DELETE',
  });
}

export async function assignTagToRepo(f = fetch, orgRepoId: string, tagId: string) {
  await authenticatedCall(f, `/api/repos/${orgRepoId}/tags/${tagId}`, {
    method: 'PUT',
  });
}

export async function unassignTagFromRepo(f = fetch, orgRepoId: string, tagId: string) {
  await authenticatedCall(f, `/api/repos/${orgRepoId}/tags/${tagId}`, {
    method: 'DELETE',
  });
}
