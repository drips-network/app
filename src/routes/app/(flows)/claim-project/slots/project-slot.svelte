<script lang="ts">
  import type { ProjectBadgeFragment } from '$lib/components/project-badge/__generated__/gql.generated';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';

  export let project: ProjectBadgeFragment;
</script>

<ProjectBadge linkToNewTab {project} />
