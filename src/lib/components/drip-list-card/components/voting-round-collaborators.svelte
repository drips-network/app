<script lang="ts">
  import type { Collaborator, Vote, VotingRound } from '$lib/utils/multiplayer/schemas';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Button from '$lib/components/button/button.svelte';
  import * as multiplayer from '$lib/utils/multiplayer';
  import VoteButton from './vote-button.svelte';

  export let votingRound: VotingRound;

  export let noButtons = false;

  $: isOwnVotingRound =
    votingRound.publisherAddress.toLowerCase() === $walletStore.address?.toLowerCase();

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
            rightComponent: noButtons
              ? undefined
              : {
                  component: VoteButton,
                  props: {
                    votingRound,
                    collaboratorAddress: $walletStore.address,
                    collaborator,
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
              rightComponent: noButtons
                ? undefined
                : {
                    component: VoteButton,
                    props: {
                      votingRound,
                      collaboratorAddress: v.collaboratorAddress,
                      collaborator: {
                        hasVoted: Boolean(v.latestVote),
                        latestVote: v.latestVote,
                      },
                    },
                  },
            },
          ]),
        )}
      />
    {:else if votingRound.areVotesPrivate}
      <div class="empty-state">
        <h4>Collaborators hidden</h4>
        <p>
          The owner of this list chose to hide the full list of collaborators and their votes.<br />
          {#if !$walletStore.connected}
            Connect your wallet to check if you're eligible to vote.
          {/if}
        </p>
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
    padding: 0.5rem;
  }

  .empty-state:not(:only-child) {
    border-top: 1px solid var(--color-foreground);
  }
</style>
