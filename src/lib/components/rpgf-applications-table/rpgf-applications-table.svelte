<script lang="ts">
  import type { Application } from '$lib/utils/rpgf/schemas';
  import ApplicationLineItem from './components/application-line-item.svelte';

  export let applications: Application[];
  export let roundSlug: string;
</script>

<div class="applications-table">
  {#each applications as application}
    <ApplicationLineItem {roundSlug} {application} />
  {/each}
</div>

<style>
  .applications-table {
    display: flex;
    flex-direction: column;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    overflow: hidden;
  }
</style>
