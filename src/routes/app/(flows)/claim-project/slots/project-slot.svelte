<script lang="ts">
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';

  export let project: GitProject;
</script>

<ProjectBadge {project} />
<!-- TODO: Add claimable funds preview -->
