import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';
import { redis } from '../../../../api/redis';
import { createFetchProjectsParameters, fetchProjects, fetchProjectsQuery } from './load-projects';
import { featuredDripListQuery, fetchList } from './load-drip-list';

const FEATURED_DRIP_LIST = '45193817480599985262554974973835763972521255481357121508020698376704';

export default async function loadFilecoinExporePageData(f: typeof fetch) {
  const projectsParameters = createFetchProjectsParameters();
  const cacheKey = queryCacheKey(
    fetchProjectsQuery + featuredDripListQuery,
    [Object.entries(projectsParameters)],
    'explore-page-filecoin',
  );

  const [blogPosts, projects, dripList] = await cached(
    redis,
    cacheKey,
    6 * 60 * 60, // Change the cache expiration time to 6 hours
    async () =>
      Promise.all([
        fetchBlogPosts(),
        fetchProjects(f, projectsParameters),
        fetchList(FEATURED_DRIP_LIST, f),
      ]),
  );

  return {
    blogPosts,
    projects,
    dripList,
  };
}
