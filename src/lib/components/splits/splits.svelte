<script lang="ts" context="module">
  import type { Items, Weights } from '$lib/components/list-editor/types';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import type {
    ProjectForVoteReceiverQuery,
    ProjectForVoteReceiverQueryVariables,
    DripListForVoteReceiverQuery,
    DripListForVoteReceiverQueryVariables,
  } from './__generated__/gql.generated';
  import { gql } from 'graphql-request';

  export const SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT = gql`
    ${EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT}
    ${EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT}
    ${EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    ${DRIP_LIST_BADGE_FRAGMENT}
    fragment SplitsComponentProjectSplits on ProjectData {
      ... on ClaimedProjectData {
        splits {
          dependencies {
            ... on AddressReceiver {
              ...EditProjectSplitsFlowAddressReceiver
              account {
                address
              }
            }
            ... on ProjectReceiver {
              ...EditProjectSplitsFlowProjectReceiver
              project {
                chainData {
                  ...ProjectAvatar
                }
              }
            }
            ... on DripListReceiver {
              ...EditProjectSplitsFlowDripListReceiver
              dripList {
                ...DripListBadge
              }
            }
          }
          maintainers {
            ... on AddressReceiver {
              ...EditProjectSplitsFlowAddressReceiver
              account {
                address
              }
            }
          }
        }
      }
    }
  `;

  export const SPLITS_COMPONENT_PROJECT_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    fragment SplitsComponentProject on Project {
      ...ProjectBadge
      source {
        repoName
        ownerName
      }
      chainData {
        ... on ClaimedProjectData {
          owner {
            address
          }
          color
        }
      }
    }
  `;

  export const SPLITS_COMPONENT_DRIP_LIST_FRAGMENT = gql`
    fragment SplitsComponentDripList on DripList {
      account {
        accountId
      }
      name
      owner {
        address
      }
    }
  `;

  export const SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT = gql`
    ${SPLITS_COMPONENT_PROJECT_FRAGMENT}
    fragment SplitsComponentProjectReceiver on ProjectReceiver {
      weight
      project {
        ...SplitsComponentProject
      }
    }
  `;

  export const SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT = gql`
    ${SPLITS_COMPONENT_DRIP_LIST_FRAGMENT}
    fragment SplitsComponentDripListReceiver on DripListReceiver {
      weight
      dripList {
        ...SplitsComponentDripList
      }
    }
  `;

  export const SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT = gql`
    fragment SplitsComponentAddressReceiver on AddressReceiver {
      weight
      account {
        address
      }
    }
  `;

  export type SplitsComponentSplitsReceiver =
    | SplitsComponentAddressReceiverFragment
    | SplitsComponentDripListReceiverFragment
    | SplitsComponentProjectReceiverFragment;

  export type Splits = (SplitGroup | SplitsComponentSplitsReceiver)[];

  export interface SplitGroup {
    __typename: 'SplitGroup';
    list: Splits;
    name?: string;
  }

  export function mapSplitsFromListEditorData(
    items: Items,
    weights: Weights,
    groupPercentage: number,
  ): SplitsComponentSplitsReceiver[] {
    return mapFilterUndefined(Object.keys(items), (accountId) => {
      const item = items[accountId];

      const weight = Math.floor((groupPercentage / 100) * weights[accountId]);

      switch (item.type) {
        case 'address':
          return {
            __typename: 'AddressReceiver',
            account: {
              __typename: 'AddressDriverAccount',
              address: item.address,
            },
            weight,
          };
        case 'project':
          return {
            __typename: 'ProjectReceiver',
            project: item.project,
            weight,
          };
        case 'drip-list':
          return {
            __typename: 'DripListReceiver',
            dripList: item.dripList,
            weight,
          };
      }
    });
  }

  export async function mapSplitsFromMultiplayerResults(
    receivers: VoteReceiver[],
    f = fetch,
  ): Promise<SplitsComponentSplitsReceiver[]> {
    const receiversToFetchDataFor = receivers.filter(
      (v): v is ProjectVoteReceiver | DripListVoteReceiver => {
        return 'type' in v && (v.type === 'project' || v.type === 'dripList');
      },
    );

    const receiversData = mapFilterUndefined(
      await Promise.all(
        receiversToFetchDataFor.map(async (v) => {
          const projectQuery = gql`
            ${SPLITS_COMPONENT_PROJECT_FRAGMENT}
            query ProjectForVoteReceiver($url: String!) {
              projectByUrl(url: $url) {
                ...SplitsComponentProject
              }
            }
          `;

          const dripListQuery = gql`
            ${SPLITS_COMPONENT_DRIP_LIST_FRAGMENT}
            query DripListForVoteReceiver($id: ID!, $chain: SupportedChain!) {
              dripList(id: $id, chain: $chain) {
                ...SplitsComponentDripList
              }
            }
          `;

          if (v.type === 'dripList') {
            return (
              await query<DripListForVoteReceiverQuery, DripListForVoteReceiverQueryVariables>(
                dripListQuery,
                {
                  id: v.accountId,
                  chain: network.gqlName,
                },
                f,
              )
            ).dripList;
          } else {
            return (
              await query<ProjectForVoteReceiverQuery, ProjectForVoteReceiverQueryVariables>(
                projectQuery,
                { url: v.url },
                f,
              )
            ).projectByUrl;
          }
        }),
      ),
      (v) => (v ? v : undefined),
    );

    return mapFilterUndefined(receivers, (v) => {
      switch (v.type) {
        case 'address':
          return {
            __typename: 'AddressReceiver',
            account: {
              __typename: 'AddressDriverAccount',
              address: v.address,
            },
            weight: v.weight,
          };
        case 'project': {
          const project = receiversData.find(
            (p): p is Extract<typeof p, { __typename: 'ClaimedProject' | 'UnclaimedProject' }> =>
              p.__typename !== 'DripList' && p.source.url === v.url,
          );
          if (!project) throw new Error(`Project not found for url: ${v.url}`);

          return {
            __typename: 'ProjectReceiver',
            project: project,
            weight: v.weight,
          };
        }
        case 'dripList': {
          const dripList = receiversData.find(
            (d): d is Extract<typeof d, { __typename: 'DripList' }> =>
              d.__typename === 'DripList' && d.account.accountId === v.accountId,
          );
          if (!dripList) throw new Error(`DripList not found for accountId: ${v.accountId}`);

          return {
            __typename: 'DripListReceiver',
            dripList: dripList,
            weight: v.weight,
          };
        }
      }
    });
  }
</script>

<script lang="ts">
  import SplitComponent from './components/split/split.svelte';
  import type {
    SplitsComponentAddressReceiverFragment,
    SplitsComponentDripListReceiverFragment,
    SplitsComponentProjectReceiverFragment,
  } from './__generated__/gql.generated';
  import { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import type {
    VoteReceiver,
    ProjectVoteReceiver,
    DripListVoteReceiver,
  } from '$lib/utils/multiplayer/schemas';
  import query from '$lib/graphql/dripsQL';
  import {
    EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT,
    EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT,
    EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT,
  } from '$lib/flows/edit-project-splits/edit-project-splits-steps';
  import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import { DRIP_LIST_BADGE_FRAGMENT } from '../drip-list-badge/drip-list-badge.svelte';
  import network from '$lib/stores/wallet/network';

  export let disableLinks = true;

  export let list: Splits;
  export let maxRows: number | undefined = undefined;

  /** Set to false to hide the chevron next to split groups. */
  export let groupsExpandable = true;

  export let draft = false;

  // Sort splits by highest percentage first, with groups at the bottom always.
  const sortList = (list: Splits) =>
    list.sort((a, b) => {
      if (a.__typename === 'SplitGroup' && b.__typename === 'SplitGroup') return 0;
      if (a.__typename === 'SplitGroup') return 1;
      if (b.__typename === 'SplitGroup') return -1;

      return b.weight - a.weight;
    });

  function truncateList(list: Splits) {
    if (!maxRows || list.length <= maxRows) {
      return list;
    }
    const clipIndex = maxRows - 1;
    const truncatedGroup: SplitGroup = {
      __typename: 'SplitGroup',
      list: list.slice(clipIndex, list.length),
      name: '',
    };
    return list.slice(0, clipIndex).concat(truncatedGroup);
  }

  $: sortedList = truncateList(sortList(list));

  export let linkToNewTab = false;
  export let isGroup = false;
</script>

<ul class="splits-list" class:group={isGroup}>
  {#each sortedList as listItem, index}
    <li class="split">
      <SplitComponent
        disableLink={disableLinks}
        {groupsExpandable}
        isFirst={index === 0}
        isLast={index === sortedList.length - 1}
        {linkToNewTab}
        isNested={isGroup}
        split={listItem}
        {draft}
      />
    </li>
  {/each}
</ul>

<style>
  .splits-list {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 16px;
    width: fit-content;
    overflow: hidden;
  }
</style>
