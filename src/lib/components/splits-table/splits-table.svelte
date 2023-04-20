<script lang="ts">
  import SplitsTableVerticalLine from './splits-table-vertical-line.svelte';
  import SplitsTableSplit from './splits-table-split.svelte';
  import type { SplitsTable } from './types';
  import SplitsTableSplitLozenge from './splits-table-split-lozenge.svelte';
  import { isAddress } from 'ethers/lib/utils';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import { onMount } from 'svelte';

  export let data: SplitsTable = {
    user: '...',
    incoming: {
      splits: [],
    },
    outgoing: {
      splits: [],
      splitsTotalPercent: '...',
    },
  };

  $: showOutgoingTotalPercent = data.outgoing.splits.length > 1;

  let containerEl: HTMLElement;
  let incomingListEl: HTMLUListElement;
  let outgoingListEl: HTMLUListElement;

  function resizeToFitGraphic() {
    const leftEdge = incomingListEl.offsetLeft;
    const rightEdge = outgoingListEl.offsetLeft + outgoingListEl.offsetWidth;
    const width = rightEdge - leftEdge;
    containerEl.style.minWidth = width + 80 + 'px'; // add some padding
  }

  onMount(() => resizeToFitGraphic());
</script>

<section
  bind:this={containerEl}
  class="splits-table-full relative border rounded-lg py-8 lg:py-12 min-w-[1200px]"
>
  <div class="py-px">
    <!-- incoming -->
    <div class="flex w-full justify-start pl-[2px]">
      <div class="w-1/2 flex justify-end">
        <ul bind:this={incomingListEl} class="-mb-px">
          <!-- incoming splits... -->
          {#if data.incoming.splits.length}
            {#each data.incoming.splits as split, index}
              <SplitsTableSplit {split} verticalLine={index > 0} isIncoming={true} />
            {/each}
          {:else}
            <SplitsTableSplit
              split={{
                subject: '<span class="text-foreground-level-4">No incoming</span>',
                percent: false,
              }}
              verticalLine={false}
              isIncoming
              isFaded
            />
          {/if}
        </ul>
      </div>
    </div>
    <div
      class="w-full flex justify-center relative {!data.incoming.splits.length
        ? 'text-foreground-level-3'
        : 'text-foreground-level-4'}"
    >
      <SplitsTableVerticalLine classes="h-7" />
      <div class="absolute bottom-0 right-0 flex justify-center w-full">
        <svg
          width="16"
          height="9"
          viewBox="0 0 16 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.29289 8.70711C7.68342 9.09763 8.31658 9.09763 8.70711 8.70711L15.0711 2.34315C15.4616 1.95262 15.4616 1.31946 15.0711 0.928932C14.6805 0.538408 14.0474 0.538408 13.6569 0.928932L8 6.58579L2.34315 0.928932C1.95262 0.538408 1.31946 0.538408 0.928932 0.928932C0.538408 1.31946 0.538408 1.95262 0.928932 2.34315L7.29289 8.70711ZM9 2C9 1.44772 8.55228 1 8 1C7.44771 1 7 1.44772 7 2L9 2ZM9 8L9 2L7 2L7 8L9 8Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>

    <!-- user -->
    <div class="w-full flex justify-center">
      {#if isAddress(data.user)}
        <div class="my-6">
          <IdentityBadge address={data.user} size="medium" />
        </div>
      {:else}
        <div class="my-5 typo-text" class:animate-pulse={data.user.includes('...')}>
          {data.user}
        </div>
      {/if}
    </div>

    <!-- outgoing -->
    <!-- sum -->
    <div class="w-full flex justify-center relative">
      <SplitsTableVerticalLine
        classes="{showOutgoingTotalPercent ? 'h-16' : 'h-6'} {!data.outgoing.splits.length
          ? 'text-foreground-level-3'
          : 'text-foreground-level-4'}"
      />
      {#if showOutgoingTotalPercent}
        <div class="absolute overlay flex items-center justify-center">
          <SplitsTableSplitLozenge text={data.outgoing.splitsTotalPercent} />
        </div>
      {/if}
    </div>
    <!-- list -->
    <div class="flex justify-end">
      <div class="w-1/2 flex">
        <ul bind:this={outgoingListEl} class="-ml-px -mt-px">
          <!-- outgoing splits... -->
          {#if data.outgoing.splits.length}
            {#each data.outgoing.splits as split, index}
              <SplitsTableSplit {split} verticalLine={index < data.outgoing.splits.length - 1} />
            {/each}
          {:else}
            <SplitsTableSplit
              split={{
                subject: '<span class="text-foreground-level-4">No outgoing</span>',
                percent: false,
              }}
              verticalLine={false}
              isFaded
            />
          {/if}
        </ul>
      </div>
    </div>
  </div>
</section>
