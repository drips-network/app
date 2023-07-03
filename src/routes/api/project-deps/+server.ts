import type { RequestHandler } from './$types';
import DepUrlExtractor from 'git-dep-url';

export const GET = (async ({ url }) => {
  const projectUrl = url.searchParams.get('projectUrl');

  const depUrlExtractor = new DepUrlExtractor();
  const dependencies = await depUrlExtractor.discoverUrls(projectUrl as string);

  return new Response(String(JSON.stringify(dependencies, null, 2)));
}) satisfies RequestHandler;
