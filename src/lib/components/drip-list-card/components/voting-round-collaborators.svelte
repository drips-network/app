<script lang="ts">
  import type { Collaborator, Vote, VotingRound } from '$lib/utils/multiplayer/schemas';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import PropsOnlyButton from '$lib/components/button/props-only-button.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import voteFlowSteps from '$lib/flows/vote/vote-flow-steps';
  import viewVoteFlowSteps from '$lib/flows/view-vote/view-vote-flow-steps';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Button from '$lib/components/button/button.svelte';
  import * as multiplayer from '$lib/utils/multiplayer';

  export let votingRound: VotingRound;

  export let noButtons = false;

  $: isOwnVotingRound =
    votingRound.publisherAddress.toLowerCase() === $walletStore.address?.toLowerCase();

  function getCollaboratorRightButton(connectedAddress: string | undefined, vote: Vote) {
    if (noButtons) return undefined;

    const { collaboratorAddress } = vote;

    const isOwnVote = collaboratorAddress.toLowerCase() === connectedAddress?.toLowerCase();

    const collaborator: Collaborator = {
      isCollaborator: true,
      hasVoted: Boolean(vote.latestVote),
      latestVote: vote.latestVote,
    };

    if (vote.latestVote) {
      // Ballot already submitted

      return isOwnVote && votingRound.status === 'Started'
        ? {
            component: PropsOnlyButton,
            props: {
              label: 'Change your vote',
              onClick: () =>
                modal.show(Stepper, undefined, voteFlowSteps(votingRound, collaborator)),
              buttonProps: {
                variant: 'primary',
                icon: Proposals,
              },
            },
          }
        : {
            component: PropsOnlyButton,
            props: {
              label: 'View vote',
              onClick: () => modal.show(Stepper, undefined, viewVoteFlowSteps(vote)),
              buttonProps: {
                variant: 'secondary',
                icon: Proposals,
              },
            },
          };
    }

    if (isOwnVote && votingRound.status === 'Started') {
      return {
        component: PropsOnlyButton,
        props: {
          label: 'Cast your vote',
          onClick: () => modal.show(Stepper, undefined, voteFlowSteps(votingRound)),
          buttonProps: {
            variant: 'primary',
            icon: Proposals,
          },
        },
      };
    }

    return undefined;
  }

  let revealedVotes: Vote[] | undefined = undefined;

  async function handleRevealVotes() {
    if (!$walletStore.connected) return;

    const { signer, address } = $walletStore;

    const timestamp = new Date();

    const signature = await multiplayer.signGetVotingRoundVotes(
      signer,
      timestamp,
      address,
      votingRound.id,
    );

    revealedVotes = [
      ...(await multiplayer.getVotingRoundVotes(votingRound.id, {
        signature,
        date: timestamp,
      })),
    ];
  }

  let collaborator: Collaborator | undefined = undefined;

  async function updateCollaborator(votingRoundId: string, address: string) {
    collaborator = undefined;
    collaborator = await multiplayer.getCollaborator(votingRoundId, address);
  }
  $: {
    if ($walletStore.connected) {
      updateCollaborator(votingRound.id, $walletStore.address);
    }
  }

  function sortVotes(connectedAddress: string | undefined, votes: Vote[]) {
    if (!connectedAddress) return votes;

    return votes.sort((a, b) => {
      if (a.collaboratorAddress === connectedAddress) return -1;
      if (b.collaboratorAddress === connectedAddress) return 1;

      if (a.latestVote && !b.latestVote) return -1;

      return 0;
    });
  }
</script>

<FormField title="Collaborators" type="div">
  <div class="wrapper">
    {#if votingRound.areVotesPrivate && collaborator?.isCollaborator && $walletStore.address && votingRound.status === 'Started'}
      <ListEditor
        isEditable={false}
        weightsMode={false}
        outline={false}
        forceBottomBorderOnItems={Boolean(votingRound.votes || revealedVotes)}
        items={{
          [$walletStore.address]: {
            type: 'address',
            address: $walletStore.address,
            rightComponent: {
              component: PropsOnlyButton,
              props: {
                label: collaborator.hasVoted ? 'Change your vote' : 'Cast your vote',
                onClick: () =>
                  modal.show(
                    Stepper,
                    undefined,
                    voteFlowSteps(votingRound, collaborator ?? undefined),
                  ),
                buttonProps: {
                  variant: 'primary',
                  icon: Proposals,
                },
              },
            },
          },
        }}
      />
    {/if}
    {#if votingRound.votes || revealedVotes}
      <ListEditor
        isEditable={false}
        weightsMode={false}
        outline={false}
        items={Object.fromEntries(
          sortVotes(
            $walletStore.address,
            votingRound.votes ||
              revealedVotes?.filter(
                (v) => v.collaboratorAddress.toLowerCase() !== $walletStore.address?.toLowerCase(),
              ) ||
              [],
          ).map((v) => [
            v.collaboratorAddress,
            {
              type: 'address',
              address: v.collaboratorAddress,
              rightComponent: getCollaboratorRightButton($walletStore.address, v),
            },
          ]),
        )}
      />
    {:else if votingRound.areVotesPrivate}
      <div class="empty-state">
        <h4>Collaborators hidden</h4>
        <p>The owner of this list chose to hide collaborators and their votes.</p>
        {#if isOwnVotingRound}
          <div style:margin-top="0.25rem">
            <Button on:click={handleRevealVotes}>Reveal collaborators</Button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</FormField>

<style>
  .wrapper {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    text-align: center;
    min-height: 10rem;
    justify-content: center;
  }

  .empty-state:not(:only-child) {
    border-top: 1px solid var(--color-foreground);
  }
</style>
