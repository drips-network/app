<script lang="ts">
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { CellContext } from '@tanstack/svelte-table';

  export let context: CellContext<unknown, unknown>;

  let project: any;

  $: {
    project = context.getValue();
  }
</script>

<div style="max-width: max(240px, 33vw)">
  <ProjectBadge {project} maxWidth={false} tooltip={false} />
</div>
