<script lang="ts">
  import type { PageData } from './$types';
  import ProjectProfile from '../../../components/project-profile/project-profile.svelte';

  export let data: PageData;
  $: project = data.project;
  $: unclaimedFunds = data.unclaimedFunds;
</script>

<ProjectProfile {project} {unclaimedFunds} />
