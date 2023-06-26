<script lang="ts">
  import type { PageData } from './$types';
  import ProjectProfile from '../../../components/project-profile/project-profile.svelte';

  export let data: PageData;
</script>

<ProjectProfile
  project={data.project}
  unclaimedFunds={data.streamed.unclaimedFunds}
  incomingSplits={data.streamed.incomingSplits}
  earnedFunds={data.streamed.earnedFunds}
  splits={data.streamed.splits}
/>
