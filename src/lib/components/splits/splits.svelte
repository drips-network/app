<script lang="ts" context="module">
  import type { GitProject } from '$lib/utils/metadata/types';

  interface ProjectSplit {
    type: 'project-split';
    project: GitProject;
    weight: number;
  }

  interface AddressSplit {
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

  export let isGroup = false;
</script>

<div class="splits-list" class:group={isGroup}>
  {#each list as listItem}
    <SplitComponent split={listItem} />
  {/each}
  <div class="line" />
</div>

<style>
  .splits-list {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 1rem;
  }

  .line {
    width: 1px;
    left: 0.5px;
    top: 0;
    height: calc(100% - 3rem);
    position: absolute;
    background: linear-gradient(
      to bottom,
      var(--color-background) 0%,
      var(--color-foreground) 1rem,
      var(--color-foreground) 100%
    );
  }
</style>
