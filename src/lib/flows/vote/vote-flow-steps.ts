import type { Items, Weights } from '$lib/components/list-editor/types';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { writable } from 'svelte/store';
import VoteStep from './vote.svelte';
import type { Collaborator, VotingRound } from '$lib/utils/multiplayer/schemas';
import FetchVoteData from './fetch-vote-data.svelte';

export interface State {
  listEditorConfig: {
    items: Items;
    weights: Weights;
  };
}

const state = () =>
  writable<State>({
    listEditorConfig: {
      items: {},
      weights: {},
    },
  });

export default (votingRound: VotingRound, collaborator?: Collaborator) => ({
  context: () => state(),
  steps: [
    makeStep({
      component: FetchVoteData,
      props: {
        votingRound,
        collaborator,
      },
    }),
    makeStep({
      component: VoteStep,
      props: {
        votingRound,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        message: 'Your vote has been successfully submitted.',
      },
    }),
  ],
});
