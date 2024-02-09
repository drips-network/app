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

  const featuredDripListQuery = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    query FeaturedDripList($id: ID!) {
      dripList(id: $id) {
        ...DripListCard
      }
    }
  `;

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

  const [blogPosts, projectsRes, featuredDripLists] = await Promise.all([
    (await fetch('/api/blog/posts')).json(),
    query<ProjectsQuery, ProjectsQueryVariables>(
      getProjectsQuery,
      {
        where: { verificationStatus: ProjectVerificationStatus.Claimed },
        sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
      },
      fetch,
    ),
    fetchFeaturedLists(),
  ]);

  return {
    projects: projectsRes.projects,
    blogPosts: postsListingSchema.parse(blogPosts),
    featuredDripLists: mapFilterUndefined(featuredDripLists, (v) =>
      v === null || v === undefined ? undefined : v,
    ),
  };
};
