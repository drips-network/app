import { writable } from 'svelte/store';
import type { Slots } from '../../components/standalone-flow-slots/standalone-flow-slots.svelte';
import { makeStep } from '$lib/components/stepper/types';
import ConnectWallet from './connect-wallet/connect-wallet.svelte';
import EnterGitUrl from './enter-git-url/enter-git-url.svelte';
import AddEthereumAddress from './add-ethereum-address/add-ethereum-address.svelte';

export interface State {
  gitUrl: string;
}

export const state = writable<State>({
  gitUrl: '',
});

export function slotsTemplate(state: State, stepIndex: number): Slots {
  switch (stepIndex) {
    default:
      return [];
  }
}

export const steps = () => [
  makeStep({
    component: EnterGitUrl,
    props: undefined,
  }),
  makeStep({
    component: ConnectWallet,
    props: undefined,
  }),
  makeStep({
    component: AddEthereumAddress,
    props: undefined,
  }),
];
