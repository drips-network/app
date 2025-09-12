import {
  // get,
  writable,
  type Writable
} from 'svelte/store';
import type { Slots } from '../../components/standalone-flow-slots/standalone-flow-slots.svelte';
import { makeStep } from '$lib/components/stepper/types';
import ConnectWallet from './steps/connect-wallet/connect-wallet.svelte';
import EnterOrcidId, {
  ENTER_GIT_URL_STEP_ORCID_FRAGMENT,
} from './steps/enter-orcid-id/enter-orcid-id.svelte';
import AddEthereumAddress, {
  ADD_ETHEREUM_ADDRESS_STEP_ORCID_FRAGMENT,
} from './steps/add-ethereum-address/add-ethereum-address.svelte';
import OrcidSlot from './slots/orcid-slot.svelte';
// import SplitYourFunds from './steps/split-your-funds/split-your-funds.svelte';
// import ConfigureMaintainers from './steps/configure-maintainers/configure-maintainers.svelte';
// import ConfigureDependencies from './steps/configure-dependencies/configure-dependencies.svelte';
import Review, { REVIEW_STEP_UNCLAIMED_ORCID_FRAGMENT } from './steps/review/review.svelte';
import SetSplitsAndEmitMetadata from './steps/set-splits-and-emit-metadata/set-splits-and-emit-metadata.svelte';
import LinkedOrcid from './slots/linked-orcid.svelte';
import Success from './steps/success/success.svelte';
import WalletSlot from '$lib/components/slots/wallet-slot.svelte';
import { gql } from 'graphql-request';
import type { ClaimOrcidFlowOrcidFragment } from './__generated__/gql.generated';
// import type { Items, Weights } from '$lib/components/list-editor/types';
import ChooseNetwork from './steps/choose-network/choose-network.svelte';
// import type { FundingJson } from '$lib/utils/github/GitHub';
// import type { TemplateHighlight } from './steps/add-ethereum-address/drips-json-template';
import type { AddItemError } from '$lib/components/list-editor/errors';
import type Orcid from '$lib/utils/orcids/entities';

export const CLAIM_ORCID_FLOW_ORCID_FRAGMENT = gql`
  ${ENTER_GIT_URL_STEP_ORCID_FRAGMENT}
  ${ADD_ETHEREUM_ADDRESS_STEP_ORCID_FRAGMENT}
  ${REVIEW_STEP_UNCLAIMED_ORCID_FRAGMENT}
  fragment ClaimOrcidFlowOrcid on OrcidLinkedIdentity {
    ...EnterGitUrlStepOrcid
    ...AddEthereumAddressStepOrcid
    ...ReviewStepUnclaimedOrcid
  }
`;

type OrcidMetadata = Orcid

export interface State {
  // giturl or ORCID
  claimableId: string;
  claimableAccount: ClaimOrcidFlowOrcidFragment | undefined;
  claimableMetadata: OrcidMetadata | undefined;
  claimableContext: Record<string, unknown>| undefined;
  claimableProof: unknown;

  linkedToClaimable: boolean;
  gaslessOwnerUpdateTaskId: string | undefined;
  isPartiallyClaimed: boolean;

  // or this is part of a project's claimableContext
  recipientErrors: Array<AddItemError>;

  // aka linked to ORCID profile?
  // linkedToRepo: boolean;
  // aka ORCID profile URL?
  // entityUrl: string;
  // gitUrl: string;
  // isPartiallyClaimed: boolean;
  // entityAccount
  // orcidAccount: ClaimProjectFlowOrcidFragment | undefined;
  // entityMetadata:;
  // orcidMetadata: OrcidMetadata | undefined;
  // highLevelPercentages: { [key: string]: number };
  // maintainerSplits: ListEditorConfig;
  // dependencySplits: ListEditorConfig;
  // dependenciesAutoImported: boolean;
  // gaslessOwnerUpdateTaskId: string | undefined;
  // avatar:
  //   | {
  //       type: 'emoji';
  //       emoji: string;
  //     }
  //   | {
  //       type: 'image';
  //       cid: string;
  //     };
  // projectColor: string;
  // funding: {
  //   json: string;
  //   object: FundingJson;
  //   highlight: TemplateHighlight;
  // };
  // recipientErrors: Array<AddItemError>;
}

export const state = () =>
  writable<State>({
    isPartiallyClaimed: false,
    linkedToClaimable: false,
    claimableId: '',
    claimableAccount: undefined,
    claimableMetadata: undefined,
    claimableContext: undefined,
    claimableProof: undefined,
    gaslessOwnerUpdateTaskId: undefined,
    recipientErrors: [],

    // claimableContext: {
    //   highLevelPercentages: { maintainers: 60, dependencies: 40 },
    //   maintainerSplits: {
    //     items: {},
    //     weights: {},
    //   },
    //   dependencySplits: {
    //     items: {},
    //     weights: {},
    //   },
    //   dependenciesAutoImported: false,
    //   avatar: {
    //     type: 'emoji',
    //     emoji: '💧',
    //   },
    //   projectColor: '#000000',
    //   funding: {
    //     json: '{}',
    //     object: {},
    //     highlight: [null, null],
    //   },
    // },
  });

export function slotsTemplate(state: State, stepIndex: number): Slots {
  const orcidSlot = {
    leftComponent: {
      component: OrcidSlot,
      props: {
        orcid: state.claimableAccount,
      },
    },
    editStepIndex: 0,
  };

  const walletSlot = {
    leftComponent: {
      component: WalletSlot,
      props: {},
    },
    editStepIndex: state.linkedToClaimable ? undefined : 1,
    rightComponent: state.linkedToClaimable
      ? {
          component: LinkedOrcid,
          props: {},
        }
      : undefined,
  };

  switch (stepIndex) {
    case 2:
      return [orcidSlot];
    case 3:
      return [orcidSlot, walletSlot];
    case 4:
      return [orcidSlot, walletSlot];
    case 5:
      return [orcidSlot, walletSlot];
    case 6:
      return [orcidSlot, walletSlot];
    case 7:
      return [];
    default:
      return [];
  }
}

export const steps = (
  state: Writable<State>,
  skipWalletConnect = false,
  isModal = false,
  claimableId: string | undefined = undefined,
) => [
  makeStep({
    component: ChooseNetwork,
    props: undefined,
  }),
  makeStep({
    component: EnterOrcidId,
    props: {
      orcidId: claimableId,
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
  // aka verify ownership of ORCID profile
  makeStep({
    component: AddEthereumAddress,
    props: undefined,
  }),
  // makeStep({
  //   component: SplitYourFunds,
  //   props: undefined,
  // }),
  // makeStep({
  //   component: ConfigureMaintainers,
  //   props: undefined,
  //   condition: () => get(state).highLevelPercentages.maintainers > 0,
  // }),
  // makeStep({
  //   component: ConfigureDependencies,
  //   props: undefined,
  //   condition: () => get(state).highLevelPercentages.dependencies > 0,
  // }),
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
