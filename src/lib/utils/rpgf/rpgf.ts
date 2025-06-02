import { browser } from '$app/environment';
import { get } from 'svelte/store';
import getOptionalEnvVar from '../get-optional-env-var/public';
import stripTrailingSlash from '../strip-trailing-slash';
import { rpgfJwtStore } from './siwe';
import {
  applicationSchema,
  createRoundDtoSchema,
  slugAvailableResponseSchema,
  wrappedRoundAdminSchema,
  wrappedRoundDraftSchema,
  wrappedRoundPublicSchema,
  type Application,
  type ApplicationFormat,
  type ApplicationReviewDto,
  type CreateApplicationDto,
  type CreateRoundDto,
  type PatchRoundDraftDto,
  type PatchRoundDto,
  type WrappedRoundAdmin,
  type WrappedRoundDraft,
  type WrappedRoundPublic,
} from './schemas';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import network from '$lib/stores/wallet/network';

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
    throw error(res.status, `RPGF API call failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res;
}

export async function getDrafts(f = fetch): Promise<WrappedRoundDraft[]> {
  const res = await rpgfServerCall(`/round-drafts?chainId=${network.chainId}`, 'GET', undefined, f);

  const parsed = wrappedRoundDraftSchema.array().parse(await res.json());
  return parsed;
}

export async function getRounds(f = fetch): Promise<(WrappedRoundPublic | WrappedRoundAdmin)[]> {
  const res = await rpgfServerCall(`/rounds?chainId=${network.chainId}`, 'GET', undefined, f);

  const parsed = z
    .union([wrappedRoundPublicSchema, wrappedRoundAdminSchema])
    .array()
    .parse(await res.json());
  return parsed;
}

export async function getDraft(f = fetch, id: string): Promise<WrappedRoundDraft> {
  const res = await rpgfServerCall(`/round-drafts/${id}`, 'GET', undefined, f);

  const parsed = wrappedRoundDraftSchema.parse(await res.json());
  return parsed;
}

export async function updateDraft(
  f = fetch,
  id: string,
  draft: PatchRoundDraftDto,
): Promise<WrappedRoundDraft> {
  // strip empty fields
  const strippedDraft = Object.fromEntries(
    Object.entries(draft).filter((v) => v[1] !== null && v[1] !== undefined && v[1] !== ''),
  );

  const res = await rpgfServerCall(`/round-drafts/${id}`, 'PATCH', strippedDraft, f);

  const parsed = wrappedRoundDraftSchema.parse(await res.json());
  return parsed;
}

export async function publishRound(f = fetch, id: string): Promise<WrappedRoundAdmin> {
  const res = await rpgfServerCall(`/round-drafts/${id}/publish`, 'POST', undefined, f);

  const parsed = wrappedRoundAdminSchema.parse(await res.json());
  return parsed;
}

export async function checkSlugAvailability(f = fetch, slug: string): Promise<boolean> {
  const res = await rpgfServerCall(`/rounds/check-slug/${slug}`, 'GET', undefined, f);

  const { available } = slugAvailableResponseSchema.parse(await res.json());
  return available;
}

export async function getRound(
  f = fetch,
  slug: string,
): Promise<WrappedRoundAdmin | WrappedRoundPublic | null> {
  const res = await rpgfServerCall(`/rounds/${slug}`, 'GET', undefined, f);
  const body = await res.json();

  const adminFieldsParseResult = wrappedRoundAdminSchema.safeParse(body);
  const publicFieldsParseResult = wrappedRoundPublicSchema.safeParse(body);

  return adminFieldsParseResult.data ?? publicFieldsParseResult.data ?? null;
}

export async function getRoundAsAdmin(f = fetch, slug: string): Promise<WrappedRoundAdmin | null> {
  const res = await rpgfServerCall(`/rounds/${slug}/admin`, 'GET', undefined, f);

  const parsed = wrappedRoundAdminSchema.parse(await res.json());
  return parsed;
}

export async function submitApplication(
  f = fetch,
  roundSlug: string,
  application: CreateApplicationDto,
  applicationFormat: ApplicationFormat,
): Promise<Application> {
  const res = await rpgfServerCall(`/rounds/${roundSlug}/applications`, 'PUT', application, f);

  return applicationSchema(applicationFormat).parse(await res.json());
}

export async function getApplications(
  f = fetch,
  roundSlug: string,
  applicationFormat: ApplicationFormat,
): Promise<Application[]> {
  const res = await rpgfServerCall(`/rounds/${roundSlug}/applications/`, 'GET', undefined, f);

  return applicationSchema(applicationFormat)
    .array()
    .parse(await res.json());
}

export async function getApplication(
  f = fetch,
  roundSlug: string,
  applicationFormat: ApplicationFormat,
  applicationId: string,
): Promise<Application> {
  const res = await rpgfServerCall(
    `/rounds/${roundSlug}/applications/${applicationId}`,
    'GET',
    undefined,
    f,
  );

  return applicationSchema(applicationFormat).parse(await res.json());
}

export async function patchRound(f = fetch, roundSlug: string, patchRoundDto: PatchRoundDto) {
  // strip empty fields
  const strippedRound = Object.fromEntries(
    Object.entries(patchRoundDto).filter((v) => v[1] !== null && v[1] !== undefined && v[1] !== ''),
  );

  const res = await rpgfServerCall(`/rounds/${roundSlug}`, 'PATCH', strippedRound, f);

  const parsed = wrappedRoundAdminSchema.parse(await res.json());
  return parsed;
}

export async function submitApplicationReview(
  f = fetch,
  roundSlug: string,
  decisions: ApplicationReviewDto,
): Promise<void> {
  await rpgfServerCall(`/rounds/${roundSlug}/applications/review`, 'POST', decisions, f);
}
