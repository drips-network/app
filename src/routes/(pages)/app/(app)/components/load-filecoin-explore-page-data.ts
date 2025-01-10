import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
} from '$lib/graphql/__generated__/base-types';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type {
  ExploreFilecoinProjectsQuery,
  ExploreFilecoinProjectsQueryVariables,
} from './__generated__/gql.generated';
import { DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT } from './default-explore-page.svelte';
import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';

const getProjectsQuery = gql`
  ${DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT}
  query ExploreFilecoinProjects(
    $where: ProjectWhereInput
    $sort: ProjectSortInput
    $chains: [SupportedChain!]!
  ) {
    projects(where: $where, sort: $sort, chains: $chains) {
      ...DefaultExplorePageFeaturedProject
    }
  }
`;

const fetchProjects = async (f: typeof fetch) => {
  const getProjectsVariables = {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
    chains: [network.gqlName],
  };

  const projectsRes = await query<
    ExploreFilecoinProjectsQuery,
    ExploreFilecoinProjectsQueryVariables
  >(getProjectsQuery, getProjectsVariables, f);

  return projectsRes.projects;
};

export default async function loadFilecoinExporePageData(f: typeof fetch) {
  const [blogPosts, projects] = await Promise.all([fetchBlogPosts(), fetchProjects(f)]);

  return {
    blogPosts,
    projects,
  };
}
