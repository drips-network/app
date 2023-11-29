import uriDecodeParams from '$lib/utils/url-decode-params';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import GitHub from '$lib/utils/github/GitHub';
import { Octokit } from '@octokit/rest';
import { GITHUB_PERSONAL_ACCESS_TOKEN } from '$env/static/private';

const octokit = new Octokit({ auth: GITHUB_PERSONAL_ACCESS_TOKEN });
const github = new GitHub(octokit);

export const GET: RequestHandler = async ({ params }) => {
  const { repoUrl } = uriDecodeParams(params);

  try {
    const repo = await github.getRepoByUrl(repoUrl);

    return new Response(
      JSON.stringify({
        url: repo.html_url,
        description: repo.description,
        repoName: repo.name,
        ownerName: repo.owner.login,
        forksCount: repo.forks_count,
        stargazersCount: repo.stargazers_count,
        defaultBranch: repo.default_branch,
      }),
    );
  } catch (e) {
    const status =
      typeof e === 'object' && e && 'status' in e && typeof e.status === 'number' ? e.status : 500;

    throw error(status);
  }
};
