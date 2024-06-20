<script lang="ts">
  import type { Collaborator, VotingRound } from '$lib/utils/multiplayer/schemas';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import type { State } from './vote-flow-steps';
  import * as multiplayer from '$lib/utils/multiplayer';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import unreachable from '$lib/utils/unreachable';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRound: VotingRound;
  export let collaborator: Collaborator | undefined;

  onMount(async () => {
    dispatch('await', {
      message: 'Fetching vote data…',
      promise: async (updateAwaitStep: UpdateAwaitStepFn) => {
        const { latestVote } = collaborator ?? {};

        if (latestVote) {
          $context.listEditorConfig =
            await multiplayer.mapVoteReceiversToListEditorConfig(latestVote);
          return;
        }

        if (collaborator?.hasVoted === true && !collaborator.latestVote) {
          // Private voting round
          const { signer, address } = $walletStore;
          assert(signer);

          const timestamp = new Date();

          updateAwaitStep({
            message: 'Waiting for you to sign the message to reveal your vote…',
          });

          const signature = await multiplayer.signGetCollaborator(
            signer,
            timestamp,
            votingRound.id,
          );

          updateAwaitStep({
            message: 'Fetching vote data…',
          });

          const revealedCollaborator = await multiplayer.getCollaborator(votingRound.id, address, {
            signature,
            date: timestamp,
          });

          $context.listEditorConfig = await multiplayer.mapVoteReceiversToListEditorConfig(
            revealedCollaborator.latestVote ?? unreachable(),
          );
        }
      },
    });
  });
</script>
