<script lang="ts" context="module">
  import type { GitProject } from '$lib/utils/metadata/types';
  import { onMount } from 'svelte';

  export interface ProjectSplit {
    type: 'project-split';
    project: GitProject;
    weight: number;
  }

  export interface AddressSplit {
    type: 'address-split';
    address: string;
    weight: number;
  }

  interface DripsDonationSplit {
    type: 'drips-donation-split';
    weight: number;
  }

  export type Split = ProjectSplit | AddressSplit | DripsDonationSplit;

  export interface SplitGroup {
    type: 'split-group';
    list: Splits;
    name?: string;
  }

  export type Splits = (SplitGroup | Split)[];
</script>

<script lang="ts">
  import SplitComponent from './components/split/split.svelte';

  export let list: Splits;

  // Sort splits by highest percentage first, with groups at the bottom always.
  $: sortedList = list.sort((a, b) => {
    if (a.type === 'split-group' && b.type === 'split-group') return 0;
    if (a.type === 'split-group') return 1;
    if (b.type === 'split-group') return -1;

    return b.weight - a.weight;
  });

  export let linkToNewTab = false;
  export let isGroup = false;

  let wrapperElem: HTMLDivElement;
  let splitElems: HTMLDivElement[] = [];

  let lineHeight = 0;

  function getLineHeight() {
    lineHeight = splitElems.reduce<number>((acc, curr, index, array) => {
      // If this is the last item in the list, its height shouldn't be covered be the line.
      if (index === array.length - 1) return acc;

      return acc + curr.clientHeight;
    }, 18);
  }

  onMount(() => {
    const observer = new ResizeObserver(getLineHeight);
    observer.observe(wrapperElem);

    return () => observer.disconnect();
  });
</script>

<div bind:this={wrapperElem} class="splits-list" class:group={isGroup}>
  {#each sortedList as listItem, index}
    <div bind:this={splitElems[index]} class="split">
      <SplitComponent {linkToNewTab} isNested={isGroup} split={listItem} />
    </div>
  {/each}
  <div class="line" style:height="{lineHeight}px" />
</div>

<style>
  .splits-list {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 16px;
    width: fit-content;
  }

  .line {
    width: 1px;
    left: 0.5px;
    top: 0;
    position: absolute;
    background: linear-gradient(
      to bottom,
      var(--color-background) 0%,
      var(--color-foreground) 1rem,
      var(--color-foreground) 100%
    );
  }
</style>
