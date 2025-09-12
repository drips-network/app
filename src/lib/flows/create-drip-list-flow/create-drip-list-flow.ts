import { makeStep } from '$lib/components/stepper/types';
import { get, writable, type Writable } from 'svelte/store';
import BuildListStep from './steps/build-list/build-list.svelte';
import ConfigureContinuousSupportStep from './steps/configure-continuous-support/configure-continuous-support.svelte';
import ReviewStep from './steps/review/review.svelte';
import type { Slots } from '../../components/standalone-flow-slots/standalone-flow-slots.svelte';
import Pile from '$lib/components/pile/pile.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
import type { DripListConfig } from '$lib/components/drip-list-editor/drip-list-editor.svelte';
import ConnectWalletStep from './steps/connect-wallet/connect-wallet.svelte';
import ChooseSupportTypeStep from './steps/choose-support-type/choose-support-type.svelte';
import WalletSlot from '$lib/components/slots/wallet-slot.svelte';
import DripListIcon from '$lib/components/icons/DripList.svelte';
import ConfigureOneTimeDonation from './steps/configure-one-time-donation/configure-one-time-donation.svelte';
import ChooseCreationMode from './steps/choose-creation-mode/choose-creation-mode.svelte';
import ConfigureVotingRound from './steps/configure-voting-round/configure-voting-round.svelte';
import type { Items } from '$lib/components/list-editor/types';
import ReviewVotingRound from './steps/review-voting-round/review-voting-round.svelte';
import type { AddItemError } from '$lib/components/list-editor/errors';
import walletStore from '$lib/stores/wallet/wallet.store';
import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
import DripList from '$lib/components/illustrations/drip-list.svelte';

export interface State {
  dripList: DripListConfig;
  recipientErrors: Array<AddItemError>;
  /** 1 is immediate DL creation, 2 is creating a draft / voting round */
  selectedCreationMode: 1 | 2 | undefined;
  /** 1 is Continuous Support, 2 is one-time donation */
  selectedSupportOption: 1 | 2 | undefined;
  continuousSupportConfig: {
    listSelected: string[];
    streamRateValue?: string | undefined;
    streamRateValueParsed?: bigint | undefined;
    topUpAmountValue?: string | undefined;
    topUpAmountValueParsed?: bigint | undefined;
  };
  oneTimeDonationConfig: {
    selectedTokenAddress: string[] | undefined;
    amountInputValue: string;
    topUpMax: boolean;
    amount: bigint | undefined;
  };
  votingRoundConfig: {
    collaborators: Items;
    votingEnds: Date | undefined;
    areVotesPrivate: boolean;
    areRecipientsRestricted: boolean;
    allowedRecipients: Items;
  };
  newVotingRoundId: string | undefined;
  dripListId: string | undefined;
}

export const state = () =>
  writable<State>({
    dripList: { title: 'My Drip List', weights: {}, items: {}, description: undefined },
    recipientErrors: [],
    selectedCreationMode: undefined,
    selectedSupportOption: undefined,
    continuousSupportConfig: {
      listSelected: [],
    },
    oneTimeDonationConfig: {
      selectedTokenAddress: undefined,
      amountInputValue: '0',
      topUpMax: false,
      amount: undefined,
    },
    votingRoundConfig: {
      collaborators: {},
      votingEnds: undefined,
      areVotesPrivate: false,
      areRecipientsRestricted: false,
      allowedRecipients: {},
    },
    newVotingRoundId: undefined,
    dripListId: undefined,
  });

export function slotsTemplate(state: State, stepIndex: number): Slots {
  const dripListSlot = {
    title: state.dripList.title,
    icon: DripListIcon,
    editStepIndex: 0,
    leftComponent: {
      component: Pile,
      props: {
        components: mapFilterUndefined(Object.entries(state.dripList.items), ([slug, item]) => {
          if (item.type === 'project') {
            return {
              component: ProjectAvatar,
              props: {
                project: item.project,
                outline: true,
              },
            };
          }

          if (item.type === 'drip-list') {
            return {
              component: DripListBadge,
              props: {
                listId: item.dripList.account.accountId,
              },
            };
          }

          return {
            component: IdentityBadge,
            props: {
              address: slug,
              showIdentity: false,
              size: 'medium',
              disableLink: true,
            },
          };
        }),
        maxItems: 3,
      },
    },
  };

  const walletSlot = {
    leftComponent: {
      component: WalletSlot,
      props: {},
    },
    editStepIndex: 3,
    rightComponent: undefined,
  };

  if (state.selectedCreationMode === 2 && stepIndex > 0 && stepIndex < 7) return [dripListSlot];

  switch (stepIndex) {
    case 1:
      return [dripListSlot];
    case 2:
      return [dripListSlot];
    case 3:
      return [dripListSlot];
    case 4:
      return [dripListSlot, walletSlot];
    case 5:
      return [dripListSlot, walletSlot];
    case 6:
      return [dripListSlot, walletSlot];
    default:
      return [];
  }
}

const staticHeaderComponent = {
  component: DripList,
  props: {
    strokeWidth: 6,
  },
};

export const steps = (state: Writable<State>, skipWalletConnect = false, isModal = false) => [
  makeStep({
    component: ChooseCreationMode,
    props: {
      canCancel: isModal,
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: BuildListStep,
    props: undefined,
    condition: () => {
      return get(state).selectedCreationMode === 1;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ConfigureVotingRound,
    props: undefined,
    condition: () => {
      return get(state).selectedCreationMode === 2;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ConnectWalletStep,
    props: undefined,
    condition: () => !skipWalletConnect,
    staticHeaderComponent,
  }),
  makeStep({
    component: ChooseSupportTypeStep,
    props: undefined,
    condition: () => {
      return get(state).selectedCreationMode === 1;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ConfigureContinuousSupportStep,
    props: undefined,
    condition: () => {
      return get(state).selectedCreationMode === 1 && get(state).selectedSupportOption === 1;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ConfigureOneTimeDonation,
    props: undefined,
    condition: () => {
      return get(state).selectedCreationMode === 1 && get(state).selectedSupportOption === 2;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ReviewStep,
    props: {
      connectedWalletHidden: skipWalletConnect,
    },
    condition: () => {
      return get(state).selectedCreationMode === 1;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ReviewVotingRound,
    props: undefined,
    condition: () => {
      return get(state).selectedCreationMode === 2;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: SuccessStep,
    props: {
      safeAppMode: Boolean(get(walletStore).safe),
      message: () =>
        get(state).selectedCreationMode === 2
          ? 'Youʼve successfully created your new collaborative Drip List. Collaborators can start voting now.'
          : 'Youʼve successfully created your Drip List.',
      action: 'link',
      linkText: 'View your Drip List',
      href() {
        const context = get(state);

        const listId =
          context.selectedCreationMode === 2 ? context.newVotingRoundId : context.dripListId;

        return `/app/drip-lists/${listId}`;
      },
      onAction() {
        // Removes the Drip List intro edu card on the Drip List page, since the user clearly knows already what a Drip List is.
        dismissablesStore.dismiss('drip-lists-page-intro');
      },
    },
  }),
];
