<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { ProjectCustomizerFragment } from '$lib/components/project-customizer/__generated__/gql.generated';
  import ProjectCustomizer from '$lib/components/project-customizer/project-customizer.svelte';
  import modal from '$lib/stores/modal';
  import CheckCircle from 'radicle-design-system/icons/CheckCircle.svelte';
  import type { Writable } from 'svelte/store';

  export let project: Writable<ProjectCustomizerFragment>;
</script>

<div class="project-customizer-modal">
  <ProjectCustomizer {project} />
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
