import { browser } from '$app/environment';
import { get } from 'svelte/store';
import getOptionalEnvVar from '../get-optional-env-var/public';
import stripTrailingSlash from '../strip-trailing-slash';
import { refreshAccessToken, rpgfAccessJwtStore } from './siwe';
import { z } from 'zod';
import network from '$lib/stores/wallet/network';
import { error } from '@sveltejs/kit';
import walletStore from '$lib/stores/wallet/wallet.store';
import {
  roundSchema,
  slugAvailableResponseSchema,
  type CreateRoundDto,
  type PatchRoundDto,
  type Round,
} from './types/round';
import {
  applicationCategorySchema,
  applicationFormSchema,
  applicationSchema,
  listingApplicationSchema,
  type Application,
  type ApplicationCategory,
  type ApplicationForm,
  type ApplicationReviewDto,
  type CreateApplicationCategoryDto,
  type CreateApplicationDto,
  type CreateApplicationFormDto,
  type ListingApplication,
} from './types/application';
import { wrappedBallotSchema, type Ballot, type WrappedBallot } from './types/ballot';
import { userSchema, type RpgfUser } from './types/user';

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

export async function rpgfServerCall(
  path: string,
  method: string = 'GET',
  body: unknown = null,
  headers: Record<string, string> = {},
  f = fetch,
) {
  if (!rpgfApiUrl || !rpgfInternalApiUrl) {
    throw new Error('Required environment variables are not set');
  }

  const baseUrl = stripTrailingSlash(browser ? rpgfApiUrl : rpgfInternalApiUrl);

  const res = await f(`${baseUrl}/api${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return res;
}

export async function authenticatedRpgfServerCall(
  path: string,
  method: string = 'GET',
  body: unknown = null,
  f = fetch,
  attemptRefresh: boolean = true,
) {
  const accessToken = get(walletStore).connected ? get(rpgfAccessJwtStore) : null;

  const res = await rpgfServerCall(
    path,
    method,
    body,
    {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    f,
  );

  if (res.status === 401 && accessToken && attemptRefresh) {
    // Try to refresh the access token
    const { success } = await refreshAccessToken();

    if (success) {
      return authenticatedRpgfServerCall(path, method, body, f, false);
    }
  }

  if (res.status === 401) {
    // User needs to re-authenticate
    throw error(401);
  }

  if (res.status === 500) {
    // Server error, throw a generic error
    throw error(500, 'Unexpected server error occurred.');
  }

  if (res.status === 400) {
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.error || 'Bad Request';
    throw error(400, message);
  }

  return res;
}

export async function getRounds(f = fetch, own = false): Promise<Round[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds${own ? '/own' : ''}?chainId=${network.chainId}`,
    'GET',
    undefined,
    f,
  );

  const parsed = roundSchema.array().parse(await res.json());
  return parsed;
}

export async function createRound(f = fetch, draft: CreateRoundDto): Promise<Round> {
  const res = await authenticatedRpgfServerCall(`/rounds`, 'PUT', draft, f);

  const parsed = roundSchema.parse(await res.json());
  return parsed;
}

export async function updateRound(f = fetch, id: string, draft: PatchRoundDto): Promise<Round> {
  // strip empty fields
  const strippedDraft: PatchRoundDto = Object.fromEntries(
    Object.entries(draft).filter((v) => v[1] !== null && v[1] !== undefined && v[1] !== ''),
  );

  // ...except customAvatarCid, which can be null
  strippedDraft.customAvatarCid = draft.customAvatarCid ?? null;

  const res = await authenticatedRpgfServerCall(`/rounds/${id}`, 'PATCH', strippedDraft, f);

  const parsed = roundSchema.parse(await res.json());
  return parsed;
}

export async function deleteRound(f = fetch, id: string): Promise<Response> {
  return await authenticatedRpgfServerCall(`/rounds/${id}`, 'DELETE', undefined, f);
}

export async function publishRound(f = fetch, id: string): Promise<Round> {
  const res = await authenticatedRpgfServerCall(`/rounds/${id}/publish`, 'POST', undefined, f);

  const parsed = roundSchema.parse(await res.json());
  return parsed;
}

export async function checkSlugAvailability(f = fetch, slug: string): Promise<boolean> {
  const res = await authenticatedRpgfServerCall(`/rounds/check-slug/${slug}`, 'GET', undefined, f);

  const { available } = slugAvailableResponseSchema.parse(await res.json());
  return available;
}

export async function getRound(f = fetch, slug: string): Promise<Round | null> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${slug}?chainId=${network.chainId}`,
    'GET',
    undefined,
    f,
  );
  const body = await res.json();

  if (res.status === 404) {
    return null;
  }

  return roundSchema.parse(body);
}

export async function submitApplication(
  f = fetch,
  roundId: string,
  application: CreateApplicationDto,
): Promise<Application> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/applications`,
    'PUT',
    application,
    f,
  );

  return applicationSchema.parse(await res.json());
}

export async function getApplications(
  f = fetch,
  roundId: string,
  limit: number = 1000,
  offset: number = 0,
  sortBy: string = 'createdAt:desc',
  filterByUserId: string | null = null,
  filterByStatus: 'approved' | 'rejected' | 'pending' | null = null,
): Promise<ListingApplication[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/applications?sort=${sortBy}&limit=${limit}&offset=${offset}${filterByUserId ? `&submitterUserId=${filterByUserId}` : ''}${filterByStatus ? `&state=${filterByStatus}` : ''}`,
    'GET',
    undefined,
    f,
  );

  return listingApplicationSchema.array().parse(await res.json());
}

export async function getApplicationsCsv(f = fetch, roundSlug: string): Promise<string> {
  const res = await authenticatedRpgfServerCall(
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
  roundId: string,
  applicationId: string,
): Promise<Application> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/applications/${applicationId}`,
    'GET',
    undefined,
    f,
  );

  return applicationSchema.parse(await res.json());
}

export async function patchRound(f = fetch, roundId: string, patchRoundDto: PatchRoundDto) {
  // strip empty fields
  const strippedRound = Object.fromEntries(
    Object.entries(patchRoundDto).filter((v) => v[1] !== null && v[1] !== undefined && v[1] !== ''),
  );

  //...except customAvatarCid, which can be null
  strippedRound.customAvatarCid = patchRoundDto.customAvatarCid ?? null;

  const res = await authenticatedRpgfServerCall(`/rounds/${roundId}`, 'PATCH', strippedRound, f);

  const parsed = roundSchema.parse(await res.json());
  return parsed;
}

export async function submitApplicationReview(
  f = fetch,
  roundId: string,
  decisions: ApplicationReviewDto,
): Promise<void> {
  await authenticatedRpgfServerCall(`/rounds/${roundId}/applications/review`, 'POST', decisions, f);
}

export async function castBallot(
  f = fetch,
  roundSlug: string,
  ballot: Ballot,
): Promise<WrappedBallot> {
  const res = await authenticatedRpgfServerCall(
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
  roundId: string,
  updatedBallot: Ballot,
): Promise<WrappedBallot> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/ballots/own`,
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
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundSlug}/ballots/own`,
    'GET',
    undefined,
    f,
  );

  if (res.status === 404) {
    return null;
  }

  const parsed = wrappedBallotSchema.parse(await res.json());
  return parsed;
}

export async function getBallots(f = fetch, roundSlug: string): Promise<WrappedBallot[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundSlug}/ballots`,
    'GET',
    undefined,
    f,
  );

  const parsed = wrappedBallotSchema.array().parse(await res.json());
  return parsed;
}

export async function getBallotsCsv(f = fetch, roundSlug: string): Promise<string> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundSlug}/ballots?format=csv`,
    'GET',
    undefined,
    f,
  );

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
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundSlug}/ballots/stats`,
    'GET',
    undefined,
    f,
  );

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

export async function recalculateResults(
  f = fetch,
  roundId: string,
  method: 'avg' | 'median' | 'sum',
): Promise<void> {
  await authenticatedRpgfServerCall(
    `/rounds/${roundId}/results/recalculate?method=${method}`,
    'POST',
    undefined,
    f,
  );

  return;
}

export async function publishResults(f = fetch, roundId: string): Promise<void> {
  await authenticatedRpgfServerCall(`/rounds/${roundId}/results/publish`, 'POST', undefined, f);

  return;
}

export async function getDripListWeightsForRound(
  f = fetch,
  roundId: string,
): Promise<Record<string, number>> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/results/drip-list-weights`,
    'GET',
    undefined,
    f,
  );

  const parsed = z.record(z.string(), z.number()).parse(await res.json());
  return parsed;
}

export async function linkDripListsToRound(
  f = fetch,
  roundId: string,
  dripListAccountIds: string[],
): Promise<void> {
  await authenticatedRpgfServerCall(
    `/rounds/${roundId}/drip-lists`,
    'PATCH',
    {
      dripListAccountIds,
    },
    f,
  );

  return;
}

export async function getOwnUserData(f = fetch): Promise<{
  walletAddress: string;
  id: string;
  whitelisted: boolean;
} | null> {
  const res = await authenticatedRpgfServerCall(
    `/users/me?chainId=${network.chainId}`,
    'GET',
    undefined,
    f,
  );

  if (res.status === 401) {
    return null;
  }

  return z
    .object({
      walletAddress: z.string(),
      id: z.string(),
      whitelisted: z.boolean(),
    })
    .parse(await res.json());
}

export async function getRoundAdmins(f = fetch, roundId: string): Promise<RpgfUser[]> {
  const res = await authenticatedRpgfServerCall(`/rounds/${roundId}/admins`, 'GET', undefined, f);

  return userSchema.array().parse(await res.json());
}

export async function setRoundAdmins(
  f = fetch,
  roundId: string,
  walletAddresses: string[],
): Promise<RpgfUser[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/admins`,
    'PUT',
    {
      walletAddresses,
    },
    f,
  );

  return userSchema.array().parse(await res.json());
}

export async function getRoundVoters(f = fetch, roundId: string): Promise<RpgfUser[]> {
  const res = await authenticatedRpgfServerCall(`/rounds/${roundId}/voters`, 'GET', undefined, f);

  return userSchema.array().parse(await res.json());
}

export async function setRoundVoters(
  f = fetch,
  roundId: string,
  walletAddresses: string[],
): Promise<RpgfUser[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/voters`,
    'PUT',
    {
      walletAddresses,
    },
    f,
  );

  return userSchema.array().parse(await res.json());
}

export async function getApplicationCategories(
  f = fetch,
  roundId: string,
): Promise<ApplicationCategory[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-categories`,
    'GET',
    undefined,
    f,
  );

  return applicationCategorySchema.array().parse(await res.json());
}

export async function createApplicationCategory(
  f = fetch,
  roundId: string,
  dto: CreateApplicationCategoryDto,
): Promise<ApplicationCategory> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-categories`,
    'PUT',
    dto,
    f,
  );

  return applicationCategorySchema.parse(await res.json());
}

export async function deleteApplicationCategory(
  f = fetch,
  roundId: string,
  categoryId: string,
): Promise<void> {
  await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-categories/${categoryId}`,
    'DELETE',
    undefined,
    f,
  );

  return;
}

export async function getApplicationForms(f = fetch, roundId: string): Promise<ApplicationForm[]> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-forms`,
    'GET',
    undefined,
    f,
  );

  return applicationFormSchema.array().parse(await res.json());
}

export async function getApplicationForm(
  f = fetch,
  roundId: string,
  formId: string,
): Promise<ApplicationForm | null> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-forms/${formId}`,
    'GET',
    undefined,
    f,
  );

  if (res.status === 404) {
    return null;
  }

  return applicationFormSchema.parse(await res.json());
}

export async function createApplicationForm(
  f = fetch,
  roundId: string,
  dto: CreateApplicationFormDto,
): Promise<ApplicationForm> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-forms`,
    'PUT',
    dto,
    f,
  );

  return applicationFormSchema.parse(await res.json());
}

export async function deleteApplicationForm(
  f = fetch,
  roundId: string,
  formId: string,
): Promise<void> {
  await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-forms/${formId}`,
    'DELETE',
    undefined,
    f,
  );

  return;
}

export async function updateApplicationForm(
  f = fetch,
  roundId: string,
  formId: string,
  dto: CreateApplicationFormDto,
): Promise<ApplicationForm> {
  const res = await authenticatedRpgfServerCall(
    `/rounds/${roundId}/application-forms/${formId}`,
    'PATCH',
    dto,
    f,
  );

  return applicationFormSchema.parse(await res.json());
}
