import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import FetchListWeights from './fetch-list-weights.svelte';

export interface State {
  weights: Record<string, number> | null;
}

export default (roundSlug: string) => {
  const state = writable<State>({
    weights: null,
  });

  return {
    context: () => state,
    steps: [
      makeStep({
        component: FetchListWeights,
        props: {
          roundSlug,
        },
      }),
    ],
  };
};
