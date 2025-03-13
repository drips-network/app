import { postsListingSchema } from '../../../../api/blog/posts/schema';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redis } from '../../../../api/redis';
import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';

import { fetchBlogPosts } from '$lib/utils/blog-posts';
import { createFetchProjectsParameters, fetchProjects, fetchProjectsQuery } from './load-projects';
import { featuredDripListQuery, fetchList } from './load-drip-list';

export default async function loadDefaultExplorePageData(
  f: typeof fetch,
  config: {
    featuredDripListIds?: string[];
    featuredProjectIds?: string[];
    featuredWeb3ProjectIds?: string[];
  } = {},
) {
  const { featuredDripListIds, featuredProjectIds, featuredWeb3ProjectIds } = config;

  const fetchProjectsParameters = createFetchProjectsParameters();
  const cacheKey = queryCacheKey(
    fetchProjectsQuery + featuredDripListQuery,
    [Object.entries(fetchProjectsParameters), featuredDripListIds],
    'explore-page',
  );

  const fetchFeaturedLists = async () => {
    return await Promise.all((featuredDripListIds ?? []).map(async (id) => await fetchList(id, f)));
  };

  const fetchTlv = async () => {
    const response = await f('/api/tlv');
    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  const [blogPosts, projects, featuredDripLists, totalDrippedPrices, tlv] = await cached(
    redis,
    cacheKey,
    1 * 60 * 60, // 1 hr
    async () =>
      Promise.all([
        fetchBlogPosts(),
        fetchProjects(f, fetchProjectsParameters),
        fetchFeaturedLists(),
        cachedTotalDrippedPrices(redis, f),
        fetchTlv(),
      ]),
  );

  return {
    projects,
    featuredProjectIds,
    featuredWeb3ProjectIds,
    blogPosts: postsListingSchema.parse(blogPosts),
    featuredDripLists: mapFilterUndefined(featuredDripLists, (v) =>
      v === null || v === undefined ? undefined : v,
    ),
    tlv,
    totalDrippedPrices,
    blockWhileInitializing: false,
  };
}
