export type ParsedRepoList = {
  /** Unique `owner/repo` names in input order, lowercased for matching. */
  repoFullNames: string[];
  /** Input entries that aren't a GitHub repo URL or `owner/repo`. */
  invalid: string[];
};

// GitHub owner: alphanumerics and single hyphens; repo: alphanumerics, `-`, `_`, `.`.
const OWNER_REPO = /^([a-z0-9](?:[a-z0-9-]{0,38}))\/([a-z0-9._-]{1,100})$/i;

function toFullName(entry: string): string | null {
  let value = entry.trim();
  if (!value) return null;

  // Accept full URLs, scheme-less `github.com/...` and plain `owner/repo`.
  value = value.replace(/^https?:\/\//i, '').replace(/^(www\.)?github\.com\//i, '');
  // Drop anything after owner/repo (tree/main, issues, query strings, trailing slash, .git).
  const [owner, repo] = value.split(/[/?#]/);
  if (!owner || !repo) return null;
  const candidate = `${owner}/${repo.replace(/\.git$/i, '')}`;

  return OWNER_REPO.test(candidate) ? candidate.toLowerCase() : null;
}

/** Parses a pasted list of repos (one per line, or comma/space separated). */
export function parseRepoList(input: string): ParsedRepoList {
  const seen = new Set<string>();
  const repoFullNames: string[] = [];
  const invalid: string[] = [];

  for (const entry of input.split(/[\s,]+/)) {
    if (!entry.trim()) continue;
    const fullName = toFullName(entry);
    if (!fullName) {
      invalid.push(entry.trim());
      continue;
    }
    if (!seen.has(fullName)) {
      seen.add(fullName);
      repoFullNames.push(fullName);
    }
  }

  return { repoFullNames, invalid };
}
