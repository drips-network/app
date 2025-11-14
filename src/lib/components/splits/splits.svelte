<script lang="ts">
  import type { SupportedChain } from '$lib/graphql/__generated__/base-types';
  import SplitComponent from './components/split/split.svelte';
  import { type Splits, type SplitGroup } from './types';



  




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


  interface Props {
    disableLinks?: boolean;
    list: Splits;
    maxRows?: number | undefined;
    /** Set to false to hide the chevron next to split groups. */
    groupsExpandable?: boolean;
    startExpanded?: boolean;
    draft?: boolean;
    disableTooltips?: boolean;
    chainOverride?: SupportedChain | undefined;
    linkToNewTab?: boolean;
    isGroup?: boolean;
  }

  let {
    disableLinks = true,
    list,
    maxRows = undefined,
    groupsExpandable = true,
    startExpanded = false,
    draft = false,
    disableTooltips = false,
    chainOverride = undefined,
    linkToNewTab = false,
    isGroup = false
  }: Props = $props();
  let sortedList = $derived(truncateList(sortList(list)));
</script>

<ul class="splits-list" class:group={isGroup}>
  {#each sortedList as listItem, index}
    <li class="split">
      <SplitComponent
        groupExpanded={startExpanded}
        disableTooltip={disableTooltips}
        disableLink={disableLinks}
        {groupsExpandable}
        isFirst={index === 0}
        isLast={index === sortedList.length - 1}
        {linkToNewTab}
        isNested={isGroup}
        split={listItem}
        {draft}
        {chainOverride}
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
