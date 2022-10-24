<script lang="ts">
  import SplitsTableSplitLozenge from './splits-table-split-lozenge.svelte';
  import SplitsTableSplit from './splits-table-split.svelte';
  import SplitsTableVerticalLine from './splits-table-vertical-line.svelte';
  import type { Split } from './splits-table.types';

  export let splits: Split[] = [];
</script>

<section class="splits-table">
  <!-- head line -->
  <header class="ml-7">
    <SplitsTableVerticalLine classes="h-2.5 block -mb-px" />
    <SplitsTableSplit text={`${splits.length} accounts`} />
  </header>
  <div class="relative ml-7 -mt-1 pt-1 -mb-1">
    <ul class="pl-[39px]">
      <!-- each -->
      {#each splits as split, index}
        <SplitsTableSplit {split} verticalLine={index < splits.length - 1} />
      {/each}
    </ul>
    <SplitsTableVerticalLine classes="absolute h-full left-0 top-0" />
  </div>
  <div class="pl-7 relative">
    <!-- remainder lozenge -->
    <div class="absolute z-10 top-0 left-0 w-14 flex justify-center pt-px">
      <SplitsTableSplitLozenge text=">99%" />
    </div>
    <!-- down arrow -->
    <svg
      class="ml-px block transform -translate-x-1/2"
      width="16"
      height="47"
      viewBox="0 0 16 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.2929 46.5432C7.68342 46.9337 8.31658 46.9337 8.70711 46.5432L15.0711 40.1792C15.4616 39.7887 15.4616 39.1555 15.0711 38.765C14.6805 38.3745 14.0474 38.3745 13.6569 38.765L8 44.4218L2.34315 38.765C1.95262 38.3745 1.31946 38.3745 0.928934 38.765C0.538409 39.1555 0.538409 39.7887 0.928934 40.1792L7.2929 46.5432ZM9 1.83606C9 1.28377 8.55228 0.83606 8 0.83606C7.44772 0.83606 7 1.28377 7 1.83606L9 1.83606ZM7 1.83606L7 45.8361L9 45.8361L9 1.83606L7 1.83606Z"
        fill="var(--color-foreground-level-3)"
      />
    </svg>
    <!-- remainder receiver -->
  </div>
  <div class="pl-3.5 typo-text-bold">You</div>
</section>
