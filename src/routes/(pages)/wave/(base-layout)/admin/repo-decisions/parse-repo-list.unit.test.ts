import { parseRepoList } from './parse-repo-list';

describe('parseRepoList', () => {
  it.each([
    ['owner/repo', 'owner/repo'],
    ['Owner/Repo', 'owner/repo'],
    ['https://github.com/Owner/Repo', 'owner/repo'],
    ['http://www.github.com/owner/repo/', 'owner/repo'],
    ['github.com/owner/repo.git', 'owner/repo'],
    ['https://github.com/owner/repo/tree/main/src', 'owner/repo'],
    ['https://github.com/owner/repo?tab=readme', 'owner/repo'],
    ['https://github.com/owner/my.repo_name-2#readme', 'owner/my.repo_name-2'],
  ])('parses %j', (input, expected) => {
    expect(parseRepoList(input)).toEqual({ repoFullNames: [expected], invalid: [] });
  });

  it('splits on newlines, commas and spaces, dedupes case-insensitively and keeps order', () => {
    const input = 'b/two\nhttps://github.com/A/One, a/one   B/TWO\n\nc/three';
    expect(parseRepoList(input).repoFullNames).toEqual(['b/two', 'a/one', 'c/three']);
  });

  it('handles a pasted list of URLs with trailing whitespace', () => {
    const input = [
      'https://github.com/Open-Hub-Tec/yucu-protocol ',
      'https://github.com/Micopay/micopay-cafe',
      'https://github.com/Micopay/micopay-rentas',
      'https://github.com/Micopay/micopay-issuer-os',
    ].join('\n');
    expect(parseRepoList(input)).toEqual({
      repoFullNames: [
        'open-hub-tec/yucu-protocol',
        'micopay/micopay-cafe',
        'micopay/micopay-rentas',
        'micopay/micopay-issuer-os',
      ],
      invalid: [],
    });
  });

  it('reports entries that are not GitHub repos', () => {
    expect(parseRepoList('owner\nhttps://gitlab.com/x/y\n-bad/repo\nok/repo')).toEqual({
      repoFullNames: ['ok/repo'],
      invalid: ['owner', 'https://gitlab.com/x/y', '-bad/repo'],
    });
  });

  it('returns nothing for empty input', () => {
    expect(parseRepoList('  \n ')).toEqual({ repoFullNames: [], invalid: [] });
  });
});
