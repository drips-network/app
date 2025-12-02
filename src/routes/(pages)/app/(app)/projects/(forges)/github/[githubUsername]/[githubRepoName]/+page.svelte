<script lang="ts">
  import type { PageData } from './$types';
  import ProjectProfile from '../../../components/project-profile/project-profile.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<ProjectProfile
  repoExists={data.repoExists}
  project={data.project}
  description={data.description}
  newRepo={data.newRepo}
  correctCasingRepo={data.correctCasingRepo}
/>
