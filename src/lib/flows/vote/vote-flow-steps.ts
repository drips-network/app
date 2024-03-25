import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { writable } from 'svelte/store';
import VoteStep from './vote.svelte';
import type { Vote } from '$lib/utils/multiplayer/schemas';
import FetchVoteData from './fetch-vote-data.svelte';

export interface State {
  listEditorConfig: {
    items: Items;
    percentages: Percentages;
  };
}

const state = writable<State>({
  listEditorConfig: {
    items: {},
    percentages: {},
  },
});

export default (votingRoundId: string, previousVote?: Vote) => ({
  context: () => state,
  steps: [
    makeStep({
      component: FetchVoteData,
      props: {
        previousVote,
      },
    }),
    makeStep({
      component: VoteStep,
      props: {
        votingRoundId,
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
