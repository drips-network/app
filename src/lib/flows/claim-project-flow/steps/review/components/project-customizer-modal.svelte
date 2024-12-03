<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { ProjectCustomizerFragment } from '$lib/components/project-customizer/__generated__/gql.generated';
  import ProjectCustomizer from '$lib/components/project-customizer/project-customizer.svelte';
  import modal from '$lib/stores/modal';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import type { Writable } from 'svelte/store';
  import type filterCurrentChainData from '$lib/utils/filter-current-chain-data';

  export let originalProject: ProjectCustomizerFragment;
  export let newProjectData: Writable<
    ReturnType<
      typeof filterCurrentChainData<ProjectCustomizerFragment['chainData'][number], 'claimed'>
    > & { isProjectVisible: boolean }
  >;
</script>

<div class="project-customizer-modal">
  <ProjectCustomizer {originalProject} {newProjectData} />
  <div class="actions">
    <Button icon={CheckCircle} on:click={modal.hide}>Confirm</Button>
  </div>
</div>

<style>
  .project-customizer-modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
