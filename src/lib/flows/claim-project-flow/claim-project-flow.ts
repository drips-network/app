import { get, writable, type Writable } from 'svelte/store';
import type { Slots } from '../../components/standalone-flow-slots/standalone-flow-slots.svelte';
import { makeStep } from '$lib/components/stepper/types';
import ConnectWallet from './steps/connect-wallet/connect-wallet.svelte';
import EnterGitUrl, {
  ENTER_GIT_URL_STEP_PROJECT_FRAGMENT,
} from './steps/enter-git-url/enter-git-url.svelte';
import AddEthereumAddress, {
  ADD_ETHEREUM_ADDRESS_STEP_PROJECT_FRAGMENT,
} from './steps/add-ethereum-address/add-ethereum-address.svelte';
import ProjectSlot from './slots/project-slot.svelte';
import SplitYourFunds from './steps/split-your-funds/split-your-funds.svelte';
import ConfigureMaintainers from './steps/configure-maintainers/configure-maintainers.svelte';
import ConfigureDependencies from './steps/configure-dependencies/configure-dependencies.svelte';
import Review, { REVIEW_STEP_UNCLAIMED_PROJECT_FRAGMENT } from './steps/review/review.svelte';
import SetSplitsAndEmitMetadata from './steps/set-splits-and-emit-metadata/set-splits-and-emit-metadata.svelte';
import LinkedProject from './slots/linked-project.svelte';
import Success from './steps/success/success.svelte';
import WalletSlot from '$lib/components/slots/wallet-slot.svelte';
import { gql } from 'graphql-request';
import type { ClaimProjectFlowProjectFragment } from './__generated__/gql.generated';
import type { Items, Weights } from '$lib/components/list-editor/types';

export const CLAIM_PROJECT_FLOW_PROJECT_FRAGMENT = gql`
  ${ENTER_GIT_URL_STEP_PROJECT_FRAGMENT}
  ${ADD_ETHEREUM_ADDRESS_STEP_PROJECT_FRAGMENT}
  ${REVIEW_STEP_UNCLAIMED_PROJECT_FRAGMENT}
  fragment ClaimProjectFlowProject on Project {
    ...EnterGitUrlStepProject
    ...AddEthereumAddressStepProject
    ...ReviewStepUnclaimedProject
  }
`;

interface ListEditorConfig {
  items: Items;
  weights: Weights;
}

export interface State {
  linkedToRepo: boolean;
  gitUrl: string;
  isPartiallyClaimed: boolean;
  project: ClaimProjectFlowProjectFragment | undefined;
  projectMetadata:
    | {
        starCount: number;
        forkCount: number;
        description?: string | undefined;
        defaultBranch: string | undefined;
      }
    | undefined;
  highLevelPercentages: { [key: string]: number };
  maintainerSplits: ListEditorConfig;
  dependencySplits: ListEditorConfig;
  dependenciesAutoImported: boolean;
  gaslessOwnerUpdateTaskId: string | undefined;
  avatar:
    | {
        type: 'emoji';
        emoji: string;
      }
    | {
        type: 'image';
        cid: string;
      };
  projectColor: string;
}

export const state = () =>
  writable<State>({
    isPartiallyClaimed: false,
    linkedToRepo: false,
    gitUrl: '',
    project: undefined,
    projectMetadata: undefined,
    highLevelPercentages: { maintainers: 60, dependencies: 40 },
    maintainerSplits: {
      items: {},
      weights: {},
    },
    dependencySplits: {
      items: {},
      weights: {},
    },
    dependenciesAutoImported: false,
    gaslessOwnerUpdateTaskId: undefined,
    avatar: {
      type: 'emoji',
      emoji: '💧',
    },
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

export const steps = (
  state: Writable<State>,
  skipWalletConnect = false,
  isModal = false,
  projectUrl: string | undefined = undefined,
) => [
  makeStep({
    component: EnterGitUrl,
    props: {
      projectUrl,
    },
  }),
  ...(skipWalletConnect
    ? []
    : [
        makeStep({
          component: ConnectWallet,
          props: undefined,
        }),
      ]),
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
    condition: () => get(state).highLevelPercentages.maintainers > 0,
  }),
  makeStep({
    component: ConfigureDependencies,
    props: undefined,
    condition: () => get(state).highLevelPercentages.dependencies > 0,
  }),
  makeStep({
    component: Review,
    props: {
      canEditWalletConnection: !skipWalletConnect,
      isModal,
    },
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
