<script lang="ts">
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { CellContext } from '@tanstack/svelte-table';

  export let context: CellContext<unknown, unknown>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let project: any;

  $: {
    project = context.getValue();
  }
</script>

<div style="max-width: max(240px, 33vw)">
  <ProjectBadge {project} tooltip={false} />
</div>
