import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import BuildListStep from './steps/build-list/build-list.svelte';
import ConfigureSupportStreamStep from './steps/configure-support/configure-support.svelte';
import ReviewStep from './steps/review/review.svelte';
import type { Slots } from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
import ListIcon from 'radicle-design-system/icons/List.svelte';
import Pile from '$lib/components/pile/pile.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import Success from './steps/success/success.svelte';
import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
import type { DripListConfig } from '$lib/components/drip-list-editor/drip-list-editor.svelte';
import ConnectWalletStep from './steps/connect-wallet/connect-wallet.svelte';
import ChooseSupportTypeStep from './steps/choose-support-type/choose-support-type.svelte';
import WalletSlot from '../shared/slots/wallet-slot.svelte';

export interface State {
  dripList: DripListConfig;
  /** 1 is Continuous Support, 2 is no support */
  selectedSupportOption: 1 | 2 | undefined;
  continuousSupportConfig: {
    listSelected: string[];
    streamRateValueParsed?: bigint | undefined;
    topUpAmountValueParsed?: bigint | undefined;
  };
  dripListId: string | undefined;
}

export const state = writable<State>({
  dripList: { title: 'My Drip List', percentages: {}, items: {}, description: undefined },
  selectedSupportOption: undefined,
  continuousSupportConfig: {
    listSelected: [],
  },
  dripListId: undefined,
});

export function slotsTemplate(state: State, stepIndex: number): Slots {
  const dripListSlot = {
    title: state.dripList.title,
    icon: ListIcon,
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
                listId: item.list.id,
              },
            };
          }

          return {
            component: IdentityBadge,
            props: {
              address: slug,
              showIdentity: false,
              size: 'medium',
              outline: true,
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
    editStepIndex: 1,
    rightComponent: undefined,
  };

  switch (stepIndex) {
    case 1:
      return [dripListSlot];
    case 2:
      return [dripListSlot, walletSlot];
    case 3:
      return [dripListSlot, walletSlot];
    default:
      return [];
  }
}

export const steps = () => [
  makeStep({
    component: BuildListStep,
    props: undefined,
  }),
  makeStep({
    component: ConnectWalletStep,
    props: undefined,
  }),
  makeStep({
    component: ChooseSupportTypeStep,
    props: undefined,
  }),
  // Skipped if user chooses not to set up support stream in prev. step
  makeStep({
    component: ConfigureSupportStreamStep,
    props: undefined,
  }),
  makeStep({
    component: ReviewStep,
    props: undefined,
  }),
  makeStep({
    component: Success,
    props: undefined,
  }),
];
