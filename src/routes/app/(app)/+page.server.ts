import { PROJECT_CARD_FRAGMENT } from '$lib/components/project-card/project-card.svelte';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectsQuery, ProjectsQueryVariables } from './__generated__/gql.generated.js';
import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
} from '$lib/graphql/__generated__/base-types.js';
import { postsListingSchema } from '../../api/blog/posts/schema';
import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import type { FeaturedDripListQuery } from './__generated__/gql.generated.js';
import type { FeaturedDripListQueryVariables } from './__generated__/gql.generated.js';
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

export const load = async ({ fetch }) => {
  const getProjectsQuery = gql`
    ${PROJECT_CARD_FRAGMENT}
    query Projects($where: ProjectWhereInput, $sort: ProjectSortInput) {
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

  const getProjectsVariables = {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
  };

  const fetchProjects = async () =>
    cached(
      redis,
      queryCacheKey(getProjectsQuery, getProjectsVariables, 'explore-projects'),
      30 * 60,
      async () => {
        const projectsRes = await query<ProjectsQuery, ProjectsQueryVariables>(
          getProjectsQuery,
          getProjectsVariables,
          fetch,
        );

        return projectsRes.projects;
      },
    );

  console.log('fetchProjects', fetchProjects)

  const featuredDripListQuery = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    query FeaturedDripList($id: ID!) {
      dripList(id: $id) {
        ...DripListCard
      }
    }
  `;

  const fetchFeaturedLists = () =>
    cached(
      redis,
      queryCacheKey(featuredDripListQuery, FEATURED_DRIP_LISTS, 'explore-featured-drip-lists'),
      60 * 60 * 24,
      async () => {
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
      },
    );

  console.log('fetchFeaturedLists', fetchFeaturedLists)

  const [blogPosts, projects, featuredDripLists, totalDrippedPrices] = await Promise.all([
    (await fetch('/api/blog/posts')).json(),
    // TODO: It currently fetches all claimed projects because we don't yet have pagination
    // capabilities on the API. It's fine because there's not a ton of projects yet,
    // but at some point we need to start fetching only featured + latest 4 projects.
    fetchProjects(),
    fetchFeaturedLists(),
    cachedTotalDrippedPrices(redis, fetch),
  ]);

  console.log('batch', { blogPosts, projects, featuredDripLists, totalDrippedPrices })

  const tlv = await (await fetch('/api/tlv')).json();

  console.log('tlv', tlv)

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
