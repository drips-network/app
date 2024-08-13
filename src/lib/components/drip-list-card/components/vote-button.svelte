<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import viewVoteFlowSteps from '$lib/flows/view-vote/view-vote-flow-steps';
  import voteFlowSteps from '$lib/flows/vote/vote-flow-steps';
  import modal from '$lib/stores/modal';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { getVotingRoundStatusReadable } from '$lib/utils/multiplayer';
  import type { Collaborator, VotingRound } from '$lib/utils/multiplayer/schemas';
  import unreachable from '$lib/utils/unreachable';

  export let votingRound: VotingRound;
  export let collaboratorAddress: string;
  export let collaborator: Collaborator;

  const status = getVotingRoundStatusReadable(votingRound);

  $: isOwnVote = collaboratorAddress.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<div style:display="flex" style:justify-content="center" style:gap="0.5rem">
  {#if collaborator.hasVoted}
    <div style:display="flex" style:align-items="center" style:gap="0.125rem">
      <Registered style="fill: var(--color-positive)" />
      <span class="hide-on-mobile" style:color="var(--color-positive)">Voted</span>
    </div>
  {/if}

  {#if isOwnVote && $status === 'Started'}
    <Button
      icon={collaborator.hasVoted ? undefined : Proposals}
      variant="primary"
      on:click={() =>
        modal.show(Stepper, undefined, voteFlowSteps(votingRound, collaborator ?? undefined))}
    >
      {#if collaborator.hasVoted}
        Change vote
      {:else}
        Cast your vote
      {/if}
    </Button>
  {:else if collaborator.latestVote}
    <Button
      on:click={() =>
        modal.show(
          Stepper,
          undefined,
          viewVoteFlowSteps(
            collaborator.latestVote
              ? { collaboratorAddress, latestVote: collaborator.latestVote }
              : unreachable(),
          ),
        )}
    >
      View vote
    </Button>
  {/if}
</div>

<style>
  @media (max-width: 768px) {
    .hide-on-mobile {
      display: none;
    }
  }
</style>
