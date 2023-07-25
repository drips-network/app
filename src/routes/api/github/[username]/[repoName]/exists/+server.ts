import uriDecodeParams from '$lib/utils/url-decode-params';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import siteExists from '$lib/utils/site-exists';

export const GET: RequestHandler = async ({ params }) => {
  const { username, repoName } = uriDecodeParams(params);

  const gitHubUrl = `https://github.com/${username}/${repoName}`;

  if (!(await siteExists(gitHubUrl))) {
    throw error(404);
  }

  return new Response();
};
