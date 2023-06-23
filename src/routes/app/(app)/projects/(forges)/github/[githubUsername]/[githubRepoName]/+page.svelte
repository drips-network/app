<script lang="ts">
  import type { PageData } from './$types';
  import ProjectProfile from '../../../components/project-profile/project-profile.svelte';

  export let data: PageData;
</script>

<ProjectProfile
  project={data.project}
  unclaimedFunds={data.unclaimedFunds}
  dependencySplits={data.streamed.splits?.dependencies}
  maintainerSplits={data.streamed.splits?.maintainers}
/>
