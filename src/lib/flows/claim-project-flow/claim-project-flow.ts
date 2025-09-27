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
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import WalletSlot from '$lib/components/slots/wallet-slot.svelte';
import { gql } from 'graphql-request';
import type { ClaimProjectFlowProjectFragment } from './__generated__/gql.generated';
import type { Items, ListEditorConfig, Weights } from '$lib/components/list-editor/types';
import ChooseNetwork from './steps/choose-network/choose-network.svelte';
import type { FundingJson } from '$lib/utils/github/GitHub';
import type { TemplateHighlight } from './steps/add-ethereum-address/drips-json-template';
import type { AddItemError } from '$lib/components/list-editor/errors';
import walletStore from '$lib/stores/wallet/wallet.store';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import type { ClaimedProjectData } from '$lib/graphql/__generated__/base-types';
import mergeAmounts from '$lib/utils/amounts/merge-amounts';
import buildUrl from '$lib/utils/build-url';
import MultiChain from '$lib/components/illustrations/multi-chain.svelte';

export const CLAIM_PROJECT_FLOW_PROJECT_FRAGMENT = gql`
  ${ENTER_GIT_URL_STEP_PROJECT_FRAGMENT}
  ${ADD_ETHEREUM_ADDRESS_STEP_PROJECT_FRAGMENT}
  ${REVIEW_STEP_UNCLAIMED_PROJECT_FRAGMENT}
  fragment ClaimProjectFlowProject on Project {
    ...EnterGitUrlStepProject
    ...AddEthereumAddressStepProject
    ...ReviewStepUnclaimedProject
    isVisible
  }
`;

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
  funding: {
    json: string;
    object: FundingJson;
    highlight: TemplateHighlight;
  };
  recipientErrors: Array<AddItemError>;
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
    funding: {
      json: '{}',
      object: {},
      highlight: [null, null],
    },
    recipientErrors: [],
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
    case 2:
      return [projectSlot];
    case 3:
      return [projectSlot, walletSlot];
    case 4:
      return [projectSlot, walletSlot];
    case 5:
      return [projectSlot, walletSlot];
    case 6:
      return [projectSlot, walletSlot];
    case 7:
      return [];
    default:
      return [];
  }
}

const staticHeaderComponent = {
  component: MultiChain,
  props: {
    strokeWidth: 6,
  },
};

export const steps = (
  state: Writable<State>,
  skipWalletConnect = false,
  isModal = false,
  projectUrl: string | undefined = undefined,
  linkToProjectPageOnSuccess = true,
  skipNetworkSelection = false,
) => [
  makeStep({
    component: ChooseNetwork,
    staticHeaderComponent,
    props: undefined,
    condition: () => !skipNetworkSelection,
  }),
  makeStep({
    component: EnterGitUrl,
    props: {
      projectUrl,
      showBackButton: !skipNetworkSelection,
    },
    staticHeaderComponent,
  }),
  ...(skipWalletConnect
    ? []
    : [
        makeStep({
          component: ConnectWallet,
          props: undefined,
          staticHeaderComponent,
        }),
      ]),
  makeStep({
    component: AddEthereumAddress,
    props: undefined,
    staticHeaderComponent,
  }),
  makeStep({
    component: SplitYourFunds,
    props: undefined,
    staticHeaderComponent,
  }),
  makeStep({
    component: ConfigureMaintainers,
    props: undefined,
    condition: () => get(state).highLevelPercentages.maintainers > 0,
    staticHeaderComponent,
  }),
  makeStep({
    component: ConfigureDependencies,
    props: undefined,
    condition: () => get(state).highLevelPercentages.dependencies > 0,
    staticHeaderComponent,
  }),
  makeStep({
    component: Review,
    props: {
      canEditWalletConnection: !skipWalletConnect,
      isModal,
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: SetSplitsAndEmitMetadata,
    props: undefined,
    staticHeaderComponent,
  }),
  makeStep({
    component: SuccessStep,
    props: {
      message: 'Your project has been successfully claimed.',
      action: linkToProjectPageOnSuccess ? 'link' : 'close',
      href() {
        const context = get(state);

        const forge = context.project?.source.forge;
        const username = context.project?.source.ownerName;
        const repoName = context.project?.source.repoName;
        const projectChainData = context.project?.chainData
          ? (filterCurrentChainData(context.project.chainData) as ClaimedProjectData)
          : undefined;

        const collectedFunds =
          mergeAmounts(
            projectChainData?.withdrawableBalances.map((wb) => ({
              tokenAddress: wb.tokenAddress,
              amount: BigInt(wb.collectableAmount) + BigInt(wb.splittableAmount),
            })) ?? [],
          ).length > 0;

        return buildUrl(
          `/app/projects/${forge?.toLowerCase()}/${username}/${repoName}?exact`,
          collectedFunds ? { collectHint: 'true' } : {},
        );
      },
      linkText: 'View your project',
      safeAppMode: Boolean(get(walletStore).safe),
    },
  }),
];
