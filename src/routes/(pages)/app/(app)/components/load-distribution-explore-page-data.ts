import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';
import { redis } from '../../../../api/redis';
import { createFetchProjectsParameters, fetchProjects, fetchProjectsQuery } from './load-projects';
import { featuredDripListQuery, fetchList } from './load-drip-list';
import type { ComponentProps } from 'svelte';
import type DistributionExplorePage from './distribution-explore-page.svelte';

type PageProps = ComponentProps<DistributionExplorePage>;

export default async function loadDistributionExplorePageData(
  f: typeof fetch,
  config: {
    featuredListId: string | null;
    welcomeCardConfig: PageProps['welcomeCard'];
    showRecentProjects?: true;
  },
): Promise<PageProps> {
  const projectsParameters = createFetchProjectsParameters();
  const cacheKey = queryCacheKey(
    fetchProjectsQuery + featuredDripListQuery,
    [Object.entries(projectsParameters)],
    'explore-page',
  );

  const { featuredListId, welcomeCardConfig, showRecentProjects } = config;

  const [blogPosts, projects, dripList] = await cached(redis, cacheKey, 6 * 60 * 60, async () =>
    Promise.all([
      fetchBlogPosts(),
      showRecentProjects ? fetchProjects(f, projectsParameters) : undefined,
      featuredListId ? fetchList(featuredListId, f) : undefined,
    ]),
  );

  return {
    blogPosts,
    projects,
    dripList,
    welcomeCard: welcomeCardConfig,
  };
}
