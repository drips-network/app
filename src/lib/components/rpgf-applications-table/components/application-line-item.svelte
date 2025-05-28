<script lang="ts">
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import type { Application } from '$lib/utils/rpgf/schemas';

  export let roundSlug: string;
  export let application: Application;
</script>

<a href="/app/rpgf/rounds/{roundSlug}/applications/{application.id}" class="application-line-item">
  <RpgfApplicationBadge {application} />
</a>

<style>
  .application-line-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .application-line-item:last-child {
    border-bottom: none;
  }
</style>
