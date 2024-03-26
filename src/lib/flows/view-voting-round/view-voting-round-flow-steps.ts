import { makeStep } from '$lib/components/stepper/types';
import type { VotingRound } from '$lib/utils/multiplayer/schemas';
import { writable } from 'svelte/store';
import FetchData from './fetch-data.svelte';
import type { SplitsComponentSplitsReceiver } from '$lib/components/splits/splits.svelte';
import ViewVotingRound from './view-voting-round.svelte';

export interface State {
  splits: SplitsComponentSplitsReceiver[];
}

const state = writable<State>({
  splits: [],
});

export default (votingRound: VotingRound) => ({
  context: () => state,
  steps: [
    makeStep({
      component: FetchData,
      props: {
        votingRound,
      },
    }),
    makeStep({
      component: ViewVotingRound,
      props: {
        votingRound,
      },
    }),
  ],
});
