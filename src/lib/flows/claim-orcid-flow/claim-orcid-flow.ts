import { writable } from 'svelte/store';
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
import Review, { REVIEW_STEP_UNCLAIMED_ORCID_FRAGMENT } from './steps/review/review.svelte';
import SetSplitsAndEmitMetadata from './steps/set-splits/set-splits.svelte';
import LinkedOrcid from './slots/linked-orcid.svelte';
import Success from './steps/success/success.svelte';
import WalletSlot from '$lib/components/slots/wallet-slot.svelte';
import { gql } from 'graphql-request';
import type { ClaimOrcidFlowOrcidFragment } from './__generated__/gql.generated';
import ChooseNetwork from './steps/choose-network/choose-network.svelte';
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

type OrcidMetadata = Orcid;

export interface State {
  claimableId: string;
  claimableAccount: ClaimOrcidFlowOrcidFragment | undefined;
  claimableMetadata: OrcidMetadata | undefined;
  claimableContext: Record<string, unknown> | undefined;
  claimableProof: unknown;

  linkedToClaimable: boolean;
  gaslessOwnerUpdateTaskId: string | undefined;
  isPartiallyClaimed: boolean;
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

export const steps = (claimableId: string | undefined = undefined, skipWalletConnect = false) => [
  makeStep({
    component: ChooseNetwork,
    props: {},
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
          props: {},
        }),
      ]),
  // aka verify ownership of ORCID profile
  makeStep({
    component: AddEthereumAddress,
    props: {},
  }),
  makeStep({
    component: Review,
    props: {
      canEditWalletConnection: !skipWalletConnect,
    },
  }),
  makeStep({
    component: SetSplitsAndEmitMetadata,
    props: {},
  }),
  makeStep({
    component: Success,
    props: {},
  }),
];
