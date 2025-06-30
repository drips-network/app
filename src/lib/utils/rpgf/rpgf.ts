import { browser } from '$app/environment';
import { get } from 'svelte/store';
import getOptionalEnvVar from '../get-optional-env-var/public';
import stripTrailingSlash from '../strip-trailing-slash';
import { rpgfJwtStore } from './siwe';
import {
  applicationSchema,
  createRoundDtoSchema,
  slugAvailableResponseSchema,
  wrappedBallotSchema,
  wrappedRoundAdminSchema,
  wrappedRoundDraftSchema,
  wrappedRoundPublicSchema,
  type Application,
  type ApplicationFormat,
  type ApplicationReviewDto,
  type Ballot,
  type CreateApplicationDto,
  type CreateRoundDraftDto,
  type CreateRoundDto,
  type PatchRoundDraftDto,
  type PatchRoundDto,
  type WrappedBallot,
  type WrappedRoundAdmin,
  type WrappedRoundDraft,
  type WrappedRoundPublic,
} from './schemas';
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

  if (!res.ok && res.status !== 404) {
    const errorText = await res.text();
    throw new Error(
      `${res.status} - RPGF API call failed: ${res.status} ${res.statusText} - ${errorText}`,
    );
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

export async function createDraft(
  f = fetch,
  draft: CreateRoundDraftDto,
): Promise<WrappedRoundDraft> {
  const res = await rpgfServerCall(`/round-drafts/`, 'PUT', draft, f);

  const parsed = wrappedRoundDraftSchema.parse(await res.json());
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

export async function deleteDraft(f = fetch, id: string): Promise<Response> {
  return await rpgfServerCall(`/round-drafts/${id}`, 'DELETE', undefined, f);
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
  const res = await rpgfServerCall(
    `/rounds/${slug}?chainId=${network.chainId}`,
    'GET',
    undefined,
    f,
  );
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
  // strip empty fields from fields
  const strippedFields = Object.fromEntries(
    Object.entries(application.fields).filter(
      (v) => v[1] !== null && v[1] !== undefined && v[1] !== '',
    ),
  );

  const res = await rpgfServerCall(
    `/rounds/${roundSlug}/applications`,
    'PUT',
    {
      ...application,
      fields: strippedFields,
    },
    f,
  );

  return applicationSchema(applicationFormat).parse(await res.json());
}

export async function getApplications(
  f = fetch,
  roundSlug: string,
  applicationFormat: ApplicationFormat,
  limit: number = 1000,
  offset: number = 0,
  sortBy: string = 'createdAt:desc',
  filterByUserId: string | null = null,
  filterByStatus: 'approved' | 'rejected' | 'pending' | null = null,
): Promise<Application[]> {
  const res = await rpgfServerCall(
    `/rounds/${roundSlug}/applications?sort=${sortBy}&limit=${limit}&offset=${offset}${filterByUserId ? `&submitterUserId=${filterByUserId}` : ''}${filterByStatus ? `&state=${filterByStatus}` : ''}`,
    'GET',
    undefined,
    f,
  );

  return applicationSchema(applicationFormat)
    .array()
    .parse(await res.json());
}

export async function getApplicationsCsv(f = fetch, roundSlug: string): Promise<string> {
  const res = await rpgfServerCall(
    `/rounds/${roundSlug}/applications?format=csv`,
    'GET',
    undefined,
    f,
  );

  if (!res.ok) {
    throw new Error(`${res.status} - Failed to fetch applications CSV: ${res.statusText}`);
  }

  return await res.text();
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

export async function castBallot(
  f = fetch,
  roundSlug: string,
  ballot: Ballot,
): Promise<WrappedBallot> {
  const res = await rpgfServerCall(
    `/rounds/${roundSlug}/ballots`,
    'PUT',
    {
      ballot,
    },
    f,
  );

  const parsed = wrappedBallotSchema.parse(await res.json());
  return parsed;
}

export async function patchBallot(
  f = fetch,
  roundSlug: string,
  updatedBallot: Ballot,
): Promise<WrappedBallot> {
  const res = await rpgfServerCall(
    `/rounds/${roundSlug}/ballots/own`,
    'PATCH',
    {
      ballot: updatedBallot,
    },
    f,
  );

  const parsed = wrappedBallotSchema.parse(await res.json());
  return parsed;
}

export async function getOwnBallot(f = fetch, roundSlug: string): Promise<WrappedBallot | null> {
  const res = await rpgfServerCall(`/rounds/${roundSlug}/ballots/own`, 'GET', undefined, f);

  if (res.status === 404) {
    return null;
  }

  const parsed = wrappedBallotSchema.parse(await res.json());
  return parsed;
}

export async function getBallots(f = fetch, roundSlug: string): Promise<WrappedBallot[]> {
  const res = await rpgfServerCall(`/rounds/${roundSlug}/ballots`, 'GET', undefined, f);

  const parsed = wrappedBallotSchema.array().parse(await res.json());
  return parsed;
}

export async function getBallotsCsv(f = fetch, roundSlug: string): Promise<string> {
  const res = await rpgfServerCall(`/rounds/${roundSlug}/ballots?format=csv`, 'GET', undefined, f);

  if (!res.ok) {
    throw new Error(`${res.status} - Failed to fetch ballots CSV: ${res.statusText}`);
  }

  return await res.text();
}

export async function getBallotStats(
  f = fetch,
  roundSlug: string,
): Promise<{
  numberOfVoters: number;
  numberOfBallots: number;
}> {
  const res = await rpgfServerCall(`/rounds/${roundSlug}/ballots/stats`, 'GET', undefined, f);

  if (!res.ok) {
    throw new Error(`${res.status} - Failed to fetch ballot stats: ${res.statusText}`);
  }

  const data = await res.json();

  return z
    .object({
      numberOfVoters: z.number(),
      numberOfBallots: z.number(),
    })
    .parse(data);
}
