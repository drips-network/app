export const EFP_API_BASE = 'https://api.ethfollow.xyz/api/v1';

export interface EfpStats {
  followers: number;
  following: number;
}

export interface EfpCommonFollower {
  address: string;
  name?: string;
  avatar?: string;
  mutualsRank?: number;
}

export interface EfpFollowerState {
  follow: boolean;
  block: boolean;
  mute: boolean;
}

function parseCount(value: string | number | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function encodeUserId(id: string): string {
  return encodeURIComponent(id);
}

export async function getEfpStats(
  addressOrEns: string,
  fetchFn: typeof fetch = fetch,
): Promise<EfpStats | null> {
  try {
    const response = await fetchFn(`${EFP_API_BASE}/users/${encodeUserId(addressOrEns)}/stats`);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      followers_count?: string | number;
      following_count?: string | number;
    };

    const followers = parseCount(data.followers_count);
    const following = parseCount(data.following_count);

    return { followers, following };
  } catch {
    return null;
  }
}

export async function getCommonFollowers(
  addressOrEns: string,
  leader: string,
  fetchFn: typeof fetch = fetch,
  limit = 5,
): Promise<EfpCommonFollower[] | null> {
  try {
    const url = new URL(
      `${EFP_API_BASE}/users/${encodeUserId(addressOrEns)}/commonFollowers`,
    );
    url.searchParams.set('leader', leader);

    const response = await fetchFn(url.toString());
    if (!response.ok) return null;

    const data = (await response.json()) as {
      results?: Array<{
        address: string;
        name?: string;
        avatar?: string;
        mutuals_rank?: string;
      }>;
    };

    if (!data.results?.length) return [];

    return data.results.slice(0, limit).map((row) => ({
      address: row.address,
      name: row.name,
      avatar: row.avatar,
      mutualsRank: row.mutuals_rank ? Number(row.mutuals_rank) : undefined,
    }));
  } catch {
    return null;
  }
}

export async function getFollowerState(
  userAddressOrEns: string,
  followerAddressOrEns: string,
  fetchFn: typeof fetch = fetch,
): Promise<EfpFollowerState | null> {
  try {
    const response = await fetchFn(
      `${EFP_API_BASE}/users/${encodeUserId(userAddressOrEns)}/${encodeUserId(followerAddressOrEns)}/followerState`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      state?: { follow?: boolean; block?: boolean; mute?: boolean };
    };

    if (!data.state) return null;

    return {
      follow: !!data.state.follow,
      block: !!data.state.block,
      mute: !!data.state.mute,
    };
  } catch {
    return null;
  }
}

export async function getSupportersYouFollow(
  viewerAddress: string,
  supporterAddresses: string[],
  fetchFn: typeof fetch = fetch,
  concurrency = 5,
): Promise<Set<string>> {
  const followed = new Set<string>();
  const unique = [...new Set(supporterAddresses.map((a) => a.toLowerCase()))].filter(
    (a) => a !== viewerAddress.toLowerCase(),
  );

  for (let i = 0; i < unique.length; i += concurrency) {
    const batch = unique.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (supporter) => {
        const state = await getFollowerState(supporter, viewerAddress, fetchFn);
        return state?.follow ? supporter : null;
      }),
    );
    for (const address of results) {
      if (address) followed.add(address);
    }
  }

  return followed;
}
