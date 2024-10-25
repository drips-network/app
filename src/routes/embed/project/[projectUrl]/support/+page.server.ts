import {
  SupportButtonBackground,
  SupportButtonStat,
  SupportButtonStyle,
  SupportButtonText,
  type SupportButtonData,
  type SupportButtonOptions,
} from '$lib/components/project-support-button/project-support-button';

import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import isClaimed from '$lib/utils/project/is-claimed';
import type { ProjectQuery, ProjectQueryVariables } from './__generated__/gql.generated';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import network from '$lib/stores/wallet/network';

const getSupportButtonOptions = (url: URL): SupportButtonOptions => {
  return {
    style:
      SupportButtonStyle[url.searchParams.get('style') as SupportButtonStyle] ||
      SupportButtonStyle.default,
    text:
      SupportButtonText[url.searchParams.get('text') as SupportButtonText] ||
      SupportButtonText.default,
    background:
      SupportButtonBackground[url.searchParams.get('background') as SupportButtonBackground] ||
      SupportButtonBackground.default,
    stat:
      SupportButtonStat[url.searchParams.get('stat') as SupportButtonStat] ||
      SupportButtonStat.default,
  };
};

export async function load({ url, params }): Promise<{
  supportButtonData: SupportButtonData;
  supportButtonOptions: SupportButtonOptions;
}> {
  const { projectUrl } = params;
  assert(projectUrl, 'Missing projectUrl param');

  // TODO: same as PROJECT_AVATAR_FRAGMENT from project-avatar.svelte
  const projectQuery = gql`
    query Project($url: String!, $chains: [SupportedChain!]) {
      projectByUrl(url: $url, chains: $chains) {
        source {
          ownerName
          repoName
        }
        chainData {
          ... on UnClaimedProjectData {
            chain
          }
          ... on ClaimedProjectData {
            chain
            color
            avatar {
              ... on ImageAvatar {
                cid
              }
              ... on EmojiAvatar {
                emoji
              }
            }
            splits {
              dependencies {
                __typename
              }
            }
            totalEarned {
              amount
            }
          }
        }
      }
    }
  `;

  const res = await query<ProjectQuery, ProjectQueryVariables>(
    projectQuery,
    { url: projectUrl, chains: [network.gqlName] },
    fetch,
  );
  const { projectByUrl: project } = res;
  try {
    assert(project);
  } catch {
    error(404);
  }

  const projectName = `${project.source.repoName}`;

  const projectData = filterCurrentChainData(project.chainData);

  const dependencies = isClaimed(projectData)
    ? projectData.splits.dependencies.length.toString()
    : '0';

  const supportButtonOptions = getSupportButtonOptions(url);

  return {
    supportButtonData: {
      support: 12456,
      dependencies,
      projectName,
      projectAvatar: projectData,
    },
    supportButtonOptions,
  };
}
