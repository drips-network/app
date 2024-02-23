<script lang="ts" context="module">
  import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { gql } from 'graphql-request';

  export const SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT = gql`
    fragment SplitsComponentProjectSplits on Project {
      ... on ClaimedProject {
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
                ...ProjectAvatar
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

  export const SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    fragment SplitsComponentProjectReceiver on ProjectReceiver {
      weight
      project {
        ...ProjectBadge
        ... on UnclaimedProject {
          source {
            repoName
            ownerName
          }
        }
        ... on ClaimedProject {
          owner {
            address
          }
          source {
            repoName
            ownerName
          }
          color
        }
      }
    }
  `;

  export const SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT = gql`
    fragment SplitsComponentDripListReceiver on DripListReceiver {
      weight
      dripList {
        account {
          accountId
        }
        name
        owner {
          address
        }
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
    percentages: Percentages,
    groupPercentage: number,
  ): SplitsComponentSplitsReceiver[] {
    return mapFilterUndefined(Object.keys(items), (slug) => {
      const item = items[slug];

      const percentage = (groupPercentage / 100) * (percentages[slug] / 100) * 1000000;

      if (!percentage) return;

      if (item.type === 'project') {
        return {
          __typename: 'ProjectReceiver',
          project: item.project,
          weight: percentage,
        };
      } else if (item.type === 'drip-list') {
        return {
          __typename: 'DripListReceiver',
          dripList: item.list,
          weight: percentage,
        };
      } else {
        return {
          __typename: 'AddressReceiver',
          account: {
            __typename: 'AddressDriverAccount',
            address: slug,
          },
          weight: percentage,
        };
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
  }
</style>
