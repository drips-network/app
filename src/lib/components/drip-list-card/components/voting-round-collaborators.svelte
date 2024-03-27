<script lang="ts">
  import type { Vote, VotingRound } from '$lib/utils/multiplayer/schemas';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import PropsOnlyButton from '$lib/components/button/props-only-button.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import voteFlowSteps from '$lib/flows/vote/vote-flow-steps';
  import viewVoteFlowSteps from '$lib/flows/view-vote/view-vote-flow-steps';
  import FormField from '$lib/components/form-field/form-field.svelte';

  export let votingRound: VotingRound;

  function getCollaboratorRightButton(connectedAddress: string | undefined, vote: Vote) {
    const { collaboratorAddress } = vote;

    const isOwnVote = collaboratorAddress.toLowerCase() === connectedAddress?.toLowerCase();

    if ('latestVote' in vote) {
      // Ballot already submitted

      return isOwnVote && votingRound.status === 'started'
        ? {
            component: PropsOnlyButton,
            props: {
              label: 'Change your vote',
              onClick: () => modal.show(Stepper, undefined, voteFlowSteps(votingRound.id, vote)),
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

    if (isOwnVote && votingRound.status === 'started') {
      return {
        component: PropsOnlyButton,
        props: {
          label: 'Cast your vote',
          onClick: () => modal.show(Stepper, undefined, voteFlowSteps(votingRound.id)),
          buttonProps: {
            variant: 'primary',
            icon: Proposals,
          },
        },
      };
    }

    return undefined;
  }
</script>

<FormField title="Collaborators" type="div">
  {#if votingRound.votes}
    <ListEditor
      isEditable={false}
      mode="list"
      items={Object.fromEntries(
        votingRound.votes.map((v) => [
          v.collaboratorAddress,
          {
            type: 'address',
            address: v.collaboratorAddress,
            rightComponent: getCollaboratorRightButton($walletStore.address, v),
          },
        ]),
      )}
    />
  {/if}
</FormField>