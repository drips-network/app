import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';
import { redis } from '../../../../api/redis';
import { createFetchProjectsParameters, fetchProjects, fetchProjectsQuery } from './load-projects';
import { featuredDripListQuery, fetchList } from './load-drip-list';
import type { ComponentProps } from 'svelte';
import type DistributionExplorePage from './distribution-explore-page.svelte';
import filterFalsy from '$lib/utils/filter-falsy';

type PageProps = ComponentProps<DistributionExplorePage>;

export default async function loadDistributionExplorePageData(
  f: typeof fetch,
  config: {
    featuredListIds: string[];
    welcomeCardConfig: PageProps['welcomeCard'];
    showRecentProjects?: true;
  },
): Promise<PageProps> {
  const projectsParameters = createFetchProjectsParameters();

  const { featuredListIds, welcomeCardConfig, showRecentProjects } = config;

  const cacheKey = queryCacheKey(
    fetchProjectsQuery + featuredDripListQuery,
    [Object.entries(projectsParameters), featuredListIds],
    'explore-page',
  );

  const [blogPosts, projects, featuredDripLists] = await cached(
    redis,
    cacheKey,
    6 * 60 * 60,
    async () =>
      Promise.all([
        fetchBlogPosts(),
        showRecentProjects ? fetchProjects(f, projectsParameters) : undefined,
        await Promise.all((featuredListIds ?? []).map(async (id) => await fetchList(id, f))),
      ]),
  );

  return {
    blogPosts,
    projects,
    featuredDripLists: filterFalsy(featuredDripLists),
    welcomeCard: welcomeCardConfig,
  };
}
