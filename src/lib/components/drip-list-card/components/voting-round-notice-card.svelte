<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import deleteVotingRoundSteps from '$lib/flows/delete-voting-round/delete-voting-round-steps';
  import publishVotingRoundListFlowSteps from '$lib/flows/publish-voting-round-list/publish-voting-round-list-flow-steps';
  import modal from '$lib/stores/modal';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { BASE_URL } from '$lib/utils/base-url';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import unreachable from '$lib/utils/unreachable';

  export let votingRound: VotingRound;

  let votingRoundUrl = `${BASE_URL}/app/drip-lists/${votingRound.id}`;

  $: isPublisher =
    $walletStore.address?.toLowerCase() === votingRound.publisherAddress.toLowerCase();
</script>

{#if votingRound.status === 'Started'}
  <div class="wrapper">
    <AnnotationBox type="info" icon={Proposals}>
      This list is in voting.
      <svelte:fragment slot="actions">
        <ShareButton
          shareLabel="Share with collaborators"
          buttonVariant="primary"
          url={votingRoundUrl}
          downloadableImageUrl="{votingRoundUrl}.png?target=og"
        />
      </svelte:fragment>
    </AnnotationBox>
  </div>
{:else if (votingRound.status === 'Completed' || votingRound.status === 'PendingLinkCompletion') && !votingRound.result}
  <div class="wrapper">
    <AnnotationBox type="error" icon={Proposals}>
      Voting has ended but no collaborators voted.
      <svelte:fragment slot="actions">
        {#if isPublisher}
          <Button
            icon={Trash}
            variant="destructive"
            on:click={() =>
              modal.show(
                Stepper,
                undefined,
                deleteVotingRoundSteps(votingRound?.id ?? unreachable()),
              )}>Delete voting round</Button
          >
        {/if}
      </svelte:fragment>
    </AnnotationBox>
  </div>
{:else if (votingRound.status === 'Completed' || votingRound.status === 'PendingLinkCompletion') && isPublisher}
  <div class="wrapper">
    <AnnotationBox type="info" icon={Proposals}>
      Voting has ended. You can now publish.
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
{:else if votingRound.status === 'Completed' || votingRound.status === 'PendingLinkCompletion'}
  <div class="wrapper">
    <AnnotationBox type="info" icon={Proposals}>
      Voting has ended. Waiting for the owner to publish this Drip List on-chain.
    </AnnotationBox>
  </div>
{/if}

<style>
  .wrapper {
    margin-bottom: 1rem;
  }
</style>
