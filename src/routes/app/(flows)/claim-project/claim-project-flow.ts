import { writable } from 'svelte/store';
import type { Slots } from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
import { makeStep } from '$lib/components/stepper/types';
import ConnectWallet from './steps/connect-wallet/connect-wallet.svelte';
import EnterGitUrl from './steps/enter-git-url/enter-git-url.svelte';
import AddEthereumAddress from './steps/add-ethereum-address/add-ethereum-address.svelte';
import ProjectSlot from './slots/project-slot.svelte';
import type { UnclaimedGitProject } from '$lib/utils/metadata/types';
import SplitYourFunds from './steps/split-your-funds/split-your-funds.svelte';
import WalletSlot from './slots/wallet-slot.svelte';

export interface State {
  gitUrl: string;
  project: UnclaimedGitProject | undefined;
  projectMetadata:
    | {
        starCount: number;
        forkCount: number;
        description?: string | undefined;
      }
    | undefined;
  unclaimedFunds: { tokenAddress: string; amount: bigint }[] | undefined;
  highLevelPercentages: { [key: string]: number };
}

export const state = writable<State>({
  gitUrl: '',
  project: undefined,
  projectMetadata: undefined,
  unclaimedFunds: undefined,
  highLevelPercentages: { maintainers: 50, dependencies: 45, drips: 5 },
});

export function slotsTemplate(state: State, stepIndex: number): Slots {
  const projectSlot = {
    leftComponent: {
      component: ProjectSlot,
      props: {
        project: state.project,
      },
    },
    editStepIndex: 0,
  };

  const walletSlot = {
    leftComponent: {
      component: WalletSlot,
      props: {},
    },
    editStepIndex: 1,
  };

  switch (stepIndex) {
    case 1:
      return [projectSlot];
    case 2:
      return [projectSlot, walletSlot];
    case 3:
      return [projectSlot, walletSlot];
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
  makeStep({
    component: SplitYourFunds,
    props: undefined,
  }),
];
