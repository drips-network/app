import { PUBLIC_NETWORK } from '$env/static/public';
import { gql } from 'graphql-request';
import {
  DEFAULT_EXPLORE_PAGE_FEATURED_DRIP_LISTS_FRAGMENT,
  DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT,
} from './default-explore-page.svelte';
import { postsListingSchema } from '../../../../api/blog/posts/schema';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redis } from '../../../../api/redis';
import cached from '$lib/utils/cache/remote/cached';
import query from '$lib/graphql/dripsQL';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import type {
  ExploreProjectsQuery,
  ExploreProjectsQueryVariables,
  FeaturedDripListQuery,
  FeaturedDripListQueryVariables,
} from './__generated__/gql.generated';
import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
} from '$lib/graphql/__generated__/base-types';
import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';

const FEATURED_DRIP_LISTS =
  {
    1: [
      '31017209032870028068280040871339261037749177808773684797297972107972',
      '34625983682950977210847096367816372822461201185275535522726531049130',
      '30178668158349445547603108732480118476541651095408979232800331391215',
      '36167722434539895740687283110259945938004377627588501179309095983174',
    ],
    5: [
      '43105784259047059587622297205437858441071428120535676155904083617631',
      '28481327705385486963944368236369218710166051344540861155364610214366',
    ],
  }[PUBLIC_NETWORK] ?? [];

const getProjectsQuery = gql`
  ${DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT}
  query ExploreProjects(
    $where: ProjectWhereInput
    $sort: ProjectSortInput
    $chains: [SupportedChain!]!
  ) {
    projects(where: $where, sort: $sort, chains: $chains) {
      ...DefaultExplorePageFeaturedProject
    }
  }
`;

const featuredDripListQuery = gql`
  ${DEFAULT_EXPLORE_PAGE_FEATURED_DRIP_LISTS_FRAGMENT}
  query FeaturedDripList($id: ID!, $chain: SupportedChain!) {
    dripList(id: $id, chain: $chain) {
      ...DefaultExplorePageFeaturedDripLists
    }
  }
`;

export default async function loadDefaultExplorePageData(f: typeof fetch) {
  const getProjectsVariables = {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
    chains: [network.gqlName],
  };

  const cacheKey = queryCacheKey(
    getProjectsQuery + featuredDripListQuery,
    [Object.entries(getProjectsVariables), FEATURED_DRIP_LISTS],
    'explore-page',
  );

  const fetchProjects = async () => {
    const projectsRes = await query<ExploreProjectsQuery, ExploreProjectsQueryVariables>(
      getProjectsQuery,
      getProjectsVariables,
      f,
    );

    // eslint-disable-next-line no-console
    console.log('fetchProjects', projectsRes);

    return projectsRes.projects;
  };

  const fetchFeaturedLists = async () => {
    const results = await Promise.all(
      FEATURED_DRIP_LISTS.map(async (id) => {
        try {
          const result = await query<FeaturedDripListQuery, FeaturedDripListQueryVariables>(
            featuredDripListQuery,
            { id, chain: network.gqlName },
            f,
          );
          return result;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('fetchFeaturedLists', error);
          throw error;
        }
      }),
    );

    return results.map((res) => res.dripList);
  };

  const fetchTlv = async () => {
    const response = await f('/api/tlv');
    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  // TODO: fetch is failing here for some reason!!!
  const [blogPosts, projects, featuredDripLists, totalDrippedPrices, tlv] = await cached(
    redis,
    cacheKey,
    6 * 60 * 60, // Change the cache expiration time to 6 hours
    async () =>
      Promise.all([
        fetchBlogPosts(),
        fetchProjects(),
        fetchFeaturedLists(),
        cachedTotalDrippedPrices(redis, f),
        fetchTlv(),
      ]),
  );

  return {
    projects,
    blogPosts: postsListingSchema.parse(blogPosts),
    featuredDripLists: mapFilterUndefined(featuredDripLists, (v) =>
      v === null || v === undefined ? undefined : v,
    ),
    tlv,
    totalDrippedPrices,
    blockWhileInitializing: false,
  };
}
