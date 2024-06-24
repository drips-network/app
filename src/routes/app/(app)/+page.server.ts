import { PROJECT_CARD_FRAGMENT } from '$lib/components/project-card/project-card.svelte';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type {
  ExploreProjectsQuery,
  ExploreProjectsQueryVariables,
} from './__generated__/gql.generated';
import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
} from '$lib/graphql/__generated__/base-types';
import { postsListingSchema } from '../../api/blog/posts/schema';
import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import type { FeaturedDripListQuery } from './__generated__/gql.generated';
import type { FeaturedDripListQueryVariables } from './__generated__/gql.generated';
import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
import { PUBLIC_NETWORK } from '$env/static/public';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx.js';
import cached from '$lib/utils/cached.js';
import queryCacheKey from '$lib/utils/query-cache-key.js';
import { redis } from '../../api/redis.js';

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
  ${PROJECT_CARD_FRAGMENT}
  query ExploreProjects($where: ProjectWhereInput, $sort: ProjectSortInput) {
    projects(where: $where, sort: $sort) {
      ...ProjectCard
      ... on ClaimedProject {
        account {
          accountId
        }
      }
      ... on UnclaimedProject {
        account {
          accountId
        }
      }
    }
  }
`;

const featuredDripListQuery = gql`
  ${DRIP_LIST_CARD_FRAGMENT}
  query FeaturedDripList($id: ID!) {
    dripList(id: $id) {
      ...DripListCard
    }
  }
`;

export const load = async ({ fetch }) => {
  const getProjectsVariables = {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
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
      fetch,
    );

    return projectsRes.projects;
  };

  const fetchFeaturedLists = async () => {
    const results = await Promise.all(
      FEATURED_DRIP_LISTS.map((id) =>
        query<FeaturedDripListQuery, FeaturedDripListQueryVariables>(
          featuredDripListQuery,
          { id },
          fetch,
        ),
      ),
    );

    return results.map((res) => res.dripList);
  };

  const [blogPosts, projects, featuredDripLists, totalDrippedPrices, tlv] = await cached(
    redis,
    cacheKey,
    6 * 60 * 60, // Change the cache expiration time to 6 hours
    async () =>
      Promise.all([
        (await fetch('/api/blog/posts')).json(),
        fetchProjects(),
        fetchFeaturedLists(),
        cachedTotalDrippedPrices(redis, fetch),
        (await fetch('/api/tlv')).json(),
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
  };
};
