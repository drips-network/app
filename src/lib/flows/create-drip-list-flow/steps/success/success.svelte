<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import modal from '$lib/stores/modal';

  export let context: Writable<State>;

  let loading = false;

  $: safeAppMode = Boolean($walletStore.safe);

  async function viewDripList() {
    loading = true;

    const listId =
      $context.selectedCreationMode === 2 ? $context.newVotingRoundId : $context.dripListId;

    await goto(`/app/drip-lists/${listId}`).then(() => {
      loading = false;
      modal.hide();
    });
  }

  onMount(() => {
    // Removes the Drip List intro edu card on the Drip List page, since the user clearly knows already what a Drip List is.
    dismissablesStore.dismiss('drip-lists-page-intro');
  });
</script>

<div class="center-div">
  {#if loading}
    <Spinner />
  {:else if $context.selectedCreationMode === 2}
    <h4>Congratulations!</h4>
    <p>
      Youʼve successfully created your new collaborative Drip List. Collaborators can start voting
      now.
    </p>
    <Button variant="primary" icon={ArrowBoxUpRight} on:click={viewDripList}>
      View your Drip List
    </Button>
  {:else if safeAppMode}
    <h4>Continue in your Safe</h4>
    <p>
      The Drip List creation transaction has successfully been proposed to your Safe. Once it's
      executed, navigate to Drip List on your Dashboard to view your newly-created Drip List.
    </p>
    <a href="/app/drip-lists">
      <Button variant="primary" icon={ArrowBoxUpRight}>View your Drip List</Button>
    </a>
  {:else}
    <h4>Congratulations!</h4>
    <p>Youʼve successfully created your Drip List.</p>
    <Button variant="primary" icon={ArrowBoxUpRight} on:click={viewDripList}
      >View your Drip List</Button
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
