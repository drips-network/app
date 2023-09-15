<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';

  export let context: Writable<State>;

  let loading = false;

  $: safeAppMode = Boolean($walletStore.safe);

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
  {:else if safeAppMode}
    <h4>Continue in your Safe</h4>
    <p>
      The project claim transaction has successfully been proposed to your Safe. Once it's executed,
      navigate to Projects on your Dashboard to view your newly-claimed project.
    </p>
    <a href="/app/projects">
      <Button variant="primary" icon={ArrowBoxUpRight}>View your projects</Button>
    </a>
  {:else}
    <h4>Congratulations!</h4>
    <p>Youʼve successfully claimed your project.</p>
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
    text-align: center;
  }
</style>
