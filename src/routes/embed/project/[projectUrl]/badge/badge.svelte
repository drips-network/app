<script lang="ts">
  import type { BadgeData, BadgeOptions } from './badge';
  import DripsBadge from './drips-badge.svelte'
  import GithubBadge from './github-badge.svelte'

  export let data: BadgeData;
  export let options: BadgeOptions;
</script>

<div data-theme='none'>
  <DripsBadge {data} {options}/>
  <GithubBadge {data} {options}/>
</div>

<style>
</style>