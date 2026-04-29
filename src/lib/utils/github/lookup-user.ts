/**
 * Lightweight, unauthenticated lookups against the public GitHub API.
 * Used by the admin bans tool: usernames must be resolved to numeric
 * IDs before they can be banned, and existing ban records only carry
 * the numeric ID so we resolve back to a login for display.
 *
 * Unauthenticated GitHub API allows 60 req/hour per IP. We cache
 * results in-memory for the lifetime of the page to avoid re-fetching.
 */

export type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
};

const byIdCache = new Map<number, GitHubUser>();
const byLoginCache = new Map<string, GitHubUser | null>();

function normalize(raw: unknown): GitHubUser {
  const r = raw as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
  };
  return {
    id: r.id,
    login: r.login,
    name: r.name ?? null,
    avatarUrl: r.avatar_url,
    htmlUrl: r.html_url,
  };
}

export async function lookupGitHubUserByLogin(login: string): Promise<GitHubUser | null> {
  const key = login.toLowerCase();
  if (byLoginCache.has(key)) {
    return byLoginCache.get(key) ?? null;
  }

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (res.status === 404) {
    byLoginCache.set(key, null);
    return null;
  }

  if (res.status === 403 || res.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Please wait a while and try again.');
  }

  if (!res.ok) {
    throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
  }

  const user = normalize(await res.json());
  byLoginCache.set(key, user);
  byIdCache.set(user.id, user);
  return user;
}

export async function lookupGitHubUserById(id: number): Promise<GitHubUser | null> {
  if (byIdCache.has(id)) {
    return byIdCache.get(id) ?? null;
  }

  const res = await fetch(`https://api.github.com/user/${id}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (res.status === 404) {
    return null;
  }

  if (res.status === 403 || res.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Please wait a while and try again.');
  }

  if (!res.ok) {
    throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
  }

  const user = normalize(await res.json());
  byIdCache.set(user.id, user);
  byLoginCache.set(user.login.toLowerCase(), user);
  return user;
}
