import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { writable } from 'svelte/store';
import LoadData from './load-data.svelte';
import Review from './review.svelte';
import type { VoteReceiver } from '$lib/utils/multiplayer/schemas';
import type { DripListConfig } from '$lib/components/drip-list-editor/drip-list-editor.svelte';

export interface State {
  results: VoteReceiver[];
  dripListConfig: DripListConfig;
  publishedDripListId: string | undefined;
}

const state = (listName: string, listDescription?: string) =>
  writable<State>({
    results: [],
    dripListConfig: {
      title: listName,
      description: listDescription,
      items: {},
      weights: {},
    },
    publishedDripListId: undefined,
  });

export default (votingRoundId: string, listName: string, listDescription?: string) => ({
  context: () => state(listName, listDescription),
  steps: [
    makeStep({
      component: LoadData,
      props: {
        votingRoundId,
      },
    }),
    makeStep({
      component: Review,
      props: {
        votingRoundId,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        onAction: () => window.location.reload(),
        message: 'Your new Drip List has successfully been published on-chain.',
      },
    }),
  ],
});
