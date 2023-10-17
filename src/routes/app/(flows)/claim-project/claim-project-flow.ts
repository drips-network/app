import { writable } from 'svelte/store';
import type { Slots } from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
import { makeStep } from '$lib/components/stepper/types';
import ConnectWallet from './steps/connect-wallet/connect-wallet.svelte';
import EnterGitUrl from './steps/enter-git-url/enter-git-url.svelte';
import AddEthereumAddress from './steps/add-ethereum-address/add-ethereum-address.svelte';
import ProjectSlot from './slots/project-slot.svelte';
import SplitYourFunds from './steps/split-your-funds/split-your-funds.svelte';
import type { ListEditorConfig } from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
import ConfigureMaintainers from './steps/configure-maintainers/configure-maintainers.svelte';
import ConfigureDependencies from './steps/configure-dependencies/configure-dependencies.svelte';
import Review from './steps/review/review.svelte';
import PollSubgraph from './steps/poll-subgraph/poll-subgraph.svelte';
import SetSplitsAndEmitMetadata from './steps/set-splits-and-emit-metadata/set-splits-and-emit-metadata.svelte';
import type { GitProject, UnclaimedGitProject } from '$lib/utils/metadata/types';
import LinkedProject from './slots/linked-project.svelte';
import Success from './steps/success/success.svelte';
import WalletSlot from '../shared/slots/wallet-slot.svelte';

interface SplitsConfig extends ListEditorConfig {
  itemsPromise: Promise<GitProject>[] | undefined;
}

export interface State {
  linkedToRepo: boolean;
  gitUrl: string;
  isPartiallyClaimed: boolean;
  project: UnclaimedGitProject | undefined;
  projectMetadata:
    | {
        starCount: number;
        forkCount: number;
        description?: string | undefined;
        defaultBranch: string | undefined;
      }
    | undefined;
  unclaimedFunds: { tokenAddress: string; amount: bigint }[] | undefined;
  highLevelPercentages: { [key: string]: number };
  maintainerSplits: SplitsConfig;
  dependencySplits: SplitsConfig;
  dependenciesAutoImported: boolean;
  projectEmoji: string;
  projectColor: string;
}

export const state = writable<State>({
  isPartiallyClaimed: false,
  linkedToRepo: false,
  gitUrl: '',
  project: undefined,
  projectMetadata: undefined,
  unclaimedFunds: undefined,
  highLevelPercentages: { maintainers: 60, dependencies: 40 },
  maintainerSplits: {
    itemsPromise: undefined,
    items: {},
    percentages: {},
  },
  dependencySplits: {
    itemsPromise: undefined,
    items: {},
    percentages: {},
  },
  dependenciesAutoImported: false,
  projectEmoji: '❓',
  projectColor: '#000000',
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
    editStepIndex: state.linkedToRepo ? undefined : 1,
    rightComponent: state.linkedToRepo
      ? {
          component: LinkedProject,
          props: {},
        }
      : undefined,
  };

  switch (stepIndex) {
    case 1:
      return [projectSlot];
    case 2:
      return [projectSlot, walletSlot];
    case 3:
      return [projectSlot, walletSlot];
    case 4:
      return [projectSlot, walletSlot];
    case 5:
      return [projectSlot, walletSlot];
    case 6:
      return [];
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
  makeStep({
    component: ConfigureMaintainers,
    props: undefined,
  }),
  makeStep({
    component: ConfigureDependencies,
    props: undefined,
  }),
  makeStep({
    component: Review,
    props: undefined,
  }),
  makeStep({
    component: PollSubgraph,
    props: undefined,
  }),
  makeStep({
    component: SetSplitsAndEmitMetadata,
    props: undefined,
  }),
  makeStep({
    component: Success,
    props: undefined,
  }),
];
