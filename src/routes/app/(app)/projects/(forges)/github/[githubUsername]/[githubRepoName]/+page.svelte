<script lang="ts">
  import type { PageData } from './$types';
  import ProjectProfile from '../../../components/project-profile/project-profile.svelte';

  export let data: PageData;
</script>

<ProjectProfile
  project={data.project}
  newRepo={data.newRepo}
  correctCasingRepo={data.correctCasingRepo}
  unclaimedFunds={data.streamed.unclaimedFunds}
/>
