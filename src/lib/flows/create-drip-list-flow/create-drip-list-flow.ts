import { makeStep } from '$lib/components/stepper/types';
import { get, writable, type Writable } from 'svelte/store';
import BuildListStep from './steps/build-list/build-list.svelte';
import ReviewStep from './steps/review/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { DripListConfig } from '$lib/components/drip-list-editor/drip-list-editor.svelte';
import ConnectWalletStep from './steps/connect-wallet/connect-wallet.svelte';
import ChooseCreationMode from './steps/choose-creation-mode/choose-creation-mode.svelte';
import ConfigureVotingRound from './steps/configure-voting-round/configure-voting-round.svelte';
import type { Items } from '$lib/components/list-editor/types';
import ReviewVotingRound from './steps/review-voting-round/review-voting-round.svelte';
import type { AddItemError } from '$lib/components/list-editor/errors';
import walletStore from '$lib/stores/wallet/wallet.store';
import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
import DripList from '$lib/components/illustrations/drip-list.svelte';
import type { Blueprint } from '../../../routes/api/list-blueprints/blueprintSchema';
import PopulateBlueprint from './steps/populate-blueprint/populate-blueprint.svelte';

export interface State {
  dripList: DripListConfig;
  recipientErrors: Array<AddItemError>;
  /** 1 is immediate DL creation, 2 is creating a draft / voting round */
  selectedCreationMode: 1 | 2 | undefined;
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

export const flowState = () =>
  writable<State>({
    dripList: { title: 'My Drip List', weights: {}, items: {}, description: undefined },
    recipientErrors: [],
    selectedCreationMode: undefined,
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

const staticHeaderComponent = {
  component: DripList,
  props: {
    strokeWidth: 6,
  },
};

export const steps = (
  state: Writable<State>,
  skipWalletConnect = false,
  isModal = false,
  blueprintOrBlueprintError:
    | {
        blueprintError: 'not-found' | 'unknown' | 'invalid' | undefined;
      }
    | {
        blueprint: Blueprint;
      }
    | undefined,
) => [
  ...(blueprintOrBlueprintError
    ? [
        makeStep({
          component: PopulateBlueprint,
          props: {
            blueprintOrBlueprintError,
          },
        }),
      ]
    : []),
  makeStep({
    component: ChooseCreationMode,
    props: {
      canCancel: isModal,
      blueprintMode: !!blueprintOrBlueprintError,
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: BuildListStep,
    props: {},
    condition: () => {
      return get(state).selectedCreationMode === 1;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ConfigureVotingRound,
    props: {},
    condition: () => {
      return get(state).selectedCreationMode === 2;
    },
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
    condition: () => {
      return get(state).selectedCreationMode === 1;
    },
    staticHeaderComponent,
  }),
  makeStep({
    component: ReviewVotingRound,
    props: {},
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
