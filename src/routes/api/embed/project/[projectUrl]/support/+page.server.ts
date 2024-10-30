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
import { totalDrippedPrices } from '$lib/utils/total-dripped-approx';

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

export async function load({ url, params, fetch }): Promise<{
  supportButtonData: SupportButtonData;
  supportButtonOptions: SupportButtonOptions;
}> {
  const { projectUrl } = params;
  assert(projectUrl, 'Missing projectUrl param');

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

  const [res, prices] = await Promise.all([
    query<ProjectQuery, ProjectQueryVariables>(
      projectQuery,
      { url: projectUrl, chains: [network.gqlName] },
      fetch,
    ),
    totalDrippedPrices(fetch),
  ]);

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

  return {
    supportButtonData: {
      dependencies,
      projectName,
      projectUrl: appProjectUrl,
      projectAvatar: projectData,
      prices,
    },
    supportButtonOptions,
  };
}
