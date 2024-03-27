<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import publishVotingRoundListFlowSteps from '$lib/flows/publish-voting-round-list/publish-voting-round-list-flow-steps';
  import modal from '$lib/stores/modal';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';

  export let votingRound: VotingRound;

  $: isPublisher =
    $walletStore.address?.toLowerCase() === votingRound.publisherAddress.toLowerCase();
</script>

{#if votingRound.status === 'started'}
  <div class="wrapper">
    <AnnotationBox type="info">
      This list is in voting.
      <svelte:fragment slot="actions">
        <ShareButton url="https://drips.network/app/drip-lists/{votingRound.id}" />
      </svelte:fragment>
    </AnnotationBox>
  </div>
{:else if votingRound.status === 'completed' && isPublisher}
  <div class="wrapper">
    <AnnotationBox type="info">
      Voting has ended. Publish the Drip List on-chain now.
      <svelte:fragment slot="actions">
        <Button
          on:click={() =>
            modal.show(
              Stepper,
              undefined,
              publishVotingRoundListFlowSteps(
                votingRound.id,
                votingRound.name,
                votingRound.description ?? undefined,
              ),
            )}
          variant="primary"
          icon={Wallet}>Publish Drip List</Button
        >
      </svelte:fragment>
    </AnnotationBox>
  </div>
{:else if votingRound.status === 'completed'}
  <div class="wrapper">
    <AnnotationBox type="info">
      Voting has ended. Waiting for the owner to publish this Drip List on-chain.
    </AnnotationBox>
  </div>
{/if}

<style>
  .wrapper {
    margin-bottom: 1rem;
  }
</style>
