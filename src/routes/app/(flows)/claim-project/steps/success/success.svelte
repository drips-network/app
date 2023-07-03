<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';

  export let context: Writable<State>;

  let loading = false;

  async function viewProject() {
    loading = true;

    const forge = $context.project?.source.forge;
    const username = $context.project?.source.ownerName;
    const repoName = $context.project?.source.repoName;

    await goto(`/app/projects/${forge}/${username}/${repoName}`).then(() => {
      loading = false;
    });
  }
</script>

<div class="center-div">
  {#if loading}
    <Spinner />
  {:else}
    <h4>Congratulations!</h4>
    <p>You've successfully claimed your project.</p>
    <Button variant="primary" icon={ArrowBoxUpRight} on:click={viewProject}
      >View project profile</Button
    >
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
