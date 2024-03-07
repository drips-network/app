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
import { env } from '$env/dynamic/private';
import { getRedis } from '../../api/redis.js';
import cached from '$lib/utils/cached.js';

const FEATURED_DRIP_LISTS =
  {
    1: [
      '30178668158349445547603108732480118476541651095408979232800331391215',
      '34625983682950977210847096367816372822461201185275535522726531049130',
    ],
    5: [
      '43105784259047059587622297205437858441071428120535676155904083617631',
      '28481327705385486963944368236369218710166051344540861155364610214366',
    ],
  }[PUBLIC_NETWORK] ?? [];

export const load = async ({ fetch }) => {
  const redis = env.CACHE_REDIS_CONNECTION_STRING ? await getRedis() : undefined;

  const fetchProjects = async () =>
    cached(redis, 'explore-projects', 30 * 60, async () => {
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

      const projectsRes = await query<ProjectsQuery, ProjectsQueryVariables>(
        getProjectsQuery,
        {
          where: { verificationStatus: ProjectVerificationStatus.Claimed },
          sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
        },
        fetch,
      );

      return projectsRes.projects;
    });

  const fetchFeaturedLists = () =>
    cached(redis, 'explore-featured-drip-lists', 60 * 60 * 24, async () => {
      const featuredDripListQuery = gql`
        ${DRIP_LIST_CARD_FRAGMENT}
        query FeaturedDripList($id: ID!) {
          dripList(id: $id) {
            ...DripListCard
          }
        }
      `;

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
    });

  const [blogPosts, projects, featuredDripLists, totalDrippedPrices] = await Promise.all([
    (await fetch('/api/blog/posts')).json(),
    // TODO: It currently fetches all claimed projects because we don't yet have pagination
    // capabilities on the API. It's fine because there's not a ton of projects yet,
    // but at some point we need to start fetching only featured + latest 4 projects.
    fetchProjects(),
    fetchFeaturedLists(),
    cachedTotalDrippedPrices(redis, fetch),
  ]);

  const tlv = await (await fetch('/api/tlv')).json();

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
