<script lang="ts">
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { Project } from '$lib/graphql/generated/graphql';

  export let project: Project;
</script>

<ProjectBadge linkToNewTab {project} />
<!-- TODO: Add claimable funds preview -->
