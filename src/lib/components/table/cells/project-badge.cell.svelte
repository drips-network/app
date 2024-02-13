<script context="module" lang="ts">
  export interface ProjectBadgeCellProps {
    project: ProjectBadgeFragment;
  }
</script>

<script lang="ts">
  import type { ProjectBadgeFragment } from '$lib/components/project-badge/__generated__/gql.generated';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { CellContext } from '@tanstack/svelte-table';

  export let context: CellContext<unknown, unknown>;

  let project: any;

  $: {
    project = context.getValue();
  }
  // export let project: ProjectBadgeFragment;
</script>

<ProjectBadge {project} maxWidth={false} tooltip={false} />
