<script lang="ts">
  import { BadgeStyle, type BadgeData, type BadgeOptions } from './badge';
  import DripsBadge from './drips-badge.svelte';
  import GithubBadge from './github-badge.svelte';

  export let data: BadgeData;
  export let options: BadgeOptions;
</script>

<div data-theme="none">
  {#if options.style === BadgeStyle.github}
    <GithubBadge {data} {options} />
  {:else}
    <DripsBadge {data} {options} />
  {/if}
</div>

<style>
</style>
