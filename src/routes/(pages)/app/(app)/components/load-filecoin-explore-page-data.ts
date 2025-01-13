import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';
import { redis } from '../../../../api/redis';
import { createFetchProjectsParameters, fetchProjects, fetchProjectsQuery } from './load-projects';

export default async function loadFilecoinExporePageData(f: typeof fetch) {
  const projectsParameters = createFetchProjectsParameters();
  const cacheKey = queryCacheKey(
    fetchProjectsQuery,
    [Object.entries(projectsParameters)],
    'explore-page-filecoin',
  );

  const [blogPosts, projects] = await cached(
    redis,
    cacheKey,
    6 * 60 * 60, // Change the cache expiration time to 6 hours
    async () => Promise.all([fetchBlogPosts(), fetchProjects(f, projectsParameters)]),
  );

  return {
    blogPosts,
    projects,
  };
}
