<script>
  import DripsBadge from './drips-badge.svelte'
  import GithubBadge from './github-badge.svelte'

  export let data;
</script>

<div data-theme='none'>
  Hello World {data}
  <DripsBadge/>
  <GithubBadge/>
</div>

<style>
</style>