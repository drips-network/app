<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import Folder from 'radicle-design-system/icons/Folder.svelte';

  export let context: Writable<State>;

  let loading = false;

  async function viewProject() {
    loading = true;

    const forge = $context.project?.source.forge;
    const username = $context.project?.source.ownerName;
    const repoName = $context.project?.source.repoName;
    await goto(`/app/projects/${forge}/${username}/${repoName}`);

    loading = false;
  }
</script>

<div class="center-div">
  {#if !loading}
    <p>Claimed project successfully!</p>
    <Button variant="primary" icon={Folder} on:click={viewProject}>View project</Button>
  {:else}
    <Spinner />
  {/if}
</div>

<style>
  .center-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    min-height: 16rem;
  }
</style>
