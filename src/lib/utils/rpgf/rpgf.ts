import { browser } from '$app/environment';
import { get } from 'svelte/store';
import getOptionalEnvVar from '../get-optional-env-var/public';
import stripTrailingSlash from '../strip-trailing-slash';
import { rpgfJwtStore } from './siwe';
import {
  createRoundDtoSchema,
  roundAdminFieldsSchema,
  roundDraftWrapperDto,
  roundPublicFieldsSchema,
  slugAvailableResponseSchema,
  type CreateRoundDto,
  type RoundDraft,
} from './schemas';

const rpgfApiUrl = getOptionalEnvVar(
  'PUBLIC_DRIPS_RPGF_URL',
  true,
  'RPGF functionality doesnt work.',
);
const rpgfInternalApiUrl = getOptionalEnvVar(
  'PUBLIC_INTERNAL_DRIPS_RPGF_URL',
  true,
  'RPGF functionality doesnt work.',
);

export function isCompleteDraft(roundOrDraft: Partial<CreateRoundDto>) {
  return createRoundDtoSchema.safeParse(roundOrDraft).success;
}

export async function rpgfServerCall(
  path: string,
  method: string = 'GET',
  body: unknown = null,
  f = fetch,
) {
  if (!rpgfApiUrl || !rpgfInternalApiUrl) {
    throw new Error('Required environment variables are not set');
  }

  const baseUrl = stripTrailingSlash(browser ? rpgfApiUrl : rpgfInternalApiUrl);

  const jwt = get(rpgfJwtStore);

  const res = await f(`${baseUrl}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include',
      Authorization: jwt ? `Bearer ${jwt}` : '',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    rpgfJwtStore.set(null);
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`RPGF API call failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res;
}

export async function getDrafts(f = fetch) {
  const res = await rpgfServerCall('/round-drafts', 'GET', undefined, f);

  const parsed = roundDraftWrapperDto.array().parse(await res.json());
  return parsed;
}

export async function getRounds(f = fetch) {
  const res = await rpgfServerCall('/rounds', 'GET', undefined, f);

  const parsed = roundPublicFieldsSchema.array().parse(await res.json());
  return parsed;
}

export async function getDraft(f = fetch, id: string) {
  const res = await rpgfServerCall(`/round-drafts/${id}`, 'GET', undefined, f);

  if (res.status === 200) {
    const parsed = roundDraftWrapperDto.parse(await res.json());
    return parsed;
  }

  return null;
}

export async function updateDraft(f = fetch, id: string, draft: RoundDraft) {
  // strip empty fields
  const strippedDraft = Object.fromEntries(
    Object.entries(draft).filter((v) => v[1] !== null && v[1] !== undefined && v[1] !== ''),
  );

  const res = await rpgfServerCall(`/round-drafts/${id}`, 'PATCH', strippedDraft, f);

  const parsed = roundDraftWrapperDto.parse(await res.json());
  return parsed;
}

export async function publishRound(f = fetch, id: string) {
  const res = await rpgfServerCall(`/round-drafts/${id}/publish`, 'POST', undefined, f);

  const parsed = roundAdminFieldsSchema.parse(await res.json());
  return parsed;
}

export async function checkSlugAvailability(f = fetch, slug: string) {
  const res = await rpgfServerCall(`/rounds/check-slug/${slug}`, 'GET', undefined, f);

  const { available } = slugAvailableResponseSchema.parse(await res.json());
  return available;
}

export async function getRound(f = fetch, slug: string) {
  const res = await rpgfServerCall(`/rounds/${slug}`, 'GET', undefined, f);

  const parsed = roundPublicFieldsSchema.parse(await res.json());
  return parsed;
}

export async function getRoundAsAdmin(f = fetch, slug: string) {
  const res = await rpgfServerCall(`/rounds/${slug}/admin`, 'GET', undefined, f);

  const parsed = roundAdminFieldsSchema.parse(await res.json());
  return parsed;
}
