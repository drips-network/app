import { makeStep } from '$lib/components/stepper/types';
import type { Vote } from '$lib/utils/multiplayer/schemas';
import { writable } from 'svelte/store';
import ViewVote from './view-vote.svelte';
import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
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

export default (vote: Vote) => ({
  context: () => state,
  steps: [
    makeStep({
      component: FetchVoteData,
      props: {
        vote,
      },
    }),
    makeStep({
      component: ViewVote,
      props: {
        vote,
      },
    }),
  ],
});
