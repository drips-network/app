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
import buildProjectUrl from '$lib/utils/build-project-url';

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
          forge
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
              tokenAddress
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

  const { forge, ownerName, repoName } = project.source;
  const appProjectUrl = `${url.origin}${buildProjectUrl(forge, ownerName, repoName)}`;

  const projectName = `${project.source.repoName}`;
  const projectData = filterCurrentChainData(project.chainData);

  const dependencies = isClaimed(projectData)
    ? projectData.splits.dependencies.length.toString()
    : '0';

  const supportButtonOptions = getSupportButtonOptions(url);

  // const tokenAddresses = projectData.totalEarned?.map((a) => a.tokenAddress);
  // await fiatEstimates.start(url.origin)
  // const priceStore = fiatEstimates.price(tokenAddresses)
  // const result = aggregateFiatEstimate(priceStore, projectData.totalEarned);
  // console.log(projectData);

  return {
    supportButtonData: {
      dependencies,
      projectName,
      projectUrl: appProjectUrl,
      projectAvatar: projectData,
    },
    supportButtonOptions,
  };
}
