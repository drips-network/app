<script lang="ts">
  import { BadgeStyle, type BadgeData, type BadgeOptions } from './project-support-button';
  import DripsBadge from './drips-style-button.svelte';
  import GithubBadge from './github-style-button.svelte';

  export let data: BadgeData;
  export let options: BadgeOptions;
</script>

<div>
  {#if options.style === BadgeStyle.github}
    <GithubBadge {data} {options} />
  {:else}
    <DripsBadge {data} {options} />
  {/if}
</div>

<style>
</style>
