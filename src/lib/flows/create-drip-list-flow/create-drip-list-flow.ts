import { makeStep } from '$lib/components/stepper/types';
import { get, writable, type Writable } from 'svelte/store';
import BuildListStep from './steps/build-list/build-list.svelte';
import ReviewStep from './steps/review/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { DripListConfig } from '$lib/components/drip-list-editor/drip-list-editor.svelte';
import ConnectWalletStep from './steps/connect-wallet/connect-wallet.svelte';
import NameAndDescription from './steps/name-and-description/name-and-description.svelte';
import type { AddItemError } from '$lib/components/list-editor/errors';
import walletStore from '$lib/stores/wallet/wallet.store';
import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
import DripList from '$lib/components/illustrations/drip-list.svelte';

export interface State {
  dripList: DripListConfig;
  recipientErrors: Array<AddItemError>;
  dripListId: string | undefined;
}

export const flowState = () =>
  writable<State>({
    dripList: { title: 'My Drip List', weights: {}, items: {}, description: undefined },
    recipientErrors: [],
    dripListId: undefined,
  });

const staticHeaderComponent = {
  component: DripList,
  props: {
    strokeWidth: 6,
  },
};

export const steps = (state: Writable<State>, skipWalletConnect = false, isModal = false) => [
  makeStep({
    component: NameAndDescription,
    props: {
      canCancel: isModal,
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: BuildListStep,
    props: {},
    staticHeaderComponent,
  }),
  makeStep({
    component: ConnectWalletStep,
    props: {},
    condition: () => !skipWalletConnect,
    staticHeaderComponent,
  }),
  makeStep({
    component: ReviewStep,
    props: {
      connectedWalletHidden: skipWalletConnect,
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: SuccessStep,
    props: {
      safeAppMode: Boolean(get(walletStore).safe),
      message: 'Youʼve successfully created your Drip List.',
      action: 'link',
      linkText: 'View your Drip List',
      href() {
        return `/app/drip-lists/${get(state).dripListId}`;
      },
      onAction() {
        // Removes the Drip List intro edu card on the Drip List page, since the user clearly knows already what a Drip List is.
        dismissablesStore.dismiss('drip-lists-page-intro');
      },
    },
  }),
];
