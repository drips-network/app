import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import BuildListStep from './steps/build-list/build-list.svelte';
import ConfigureSupportStep from './steps/configure-support/configure-support.svelte';
import ReviewStep from './steps/review/review.svelte';
import type { Slots } from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
import ListIcon from 'radicle-design-system/icons/List.svelte';
import Pile from '$lib/components/pile/pile.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
import Success from './steps/success/success.svelte';

export interface State {
  dripList: {
    items: Items;
    percentages: Percentages;
    title: string;
  };
  supportConfig: {
    listSelected: string[];
    streamRateValueParsed?: bigint | undefined;
    topUpAmountValueParsed?: bigint | undefined;
  };
}

export const state = writable<State>({
  dripList: { title: 'My Drip List', percentages: {}, items: {} },
  supportConfig: { listSelected: [] },
});

export function slotsTemplate(state: State, stepIndex: number): Slots {
  switch (stepIndex) {
    case 1:
      return [
        {
          title: state.dripList.title,
          icon: ListIcon,
          editStepIndex: 0,
          leftComponent: {
            component: Pile,
            props: {
              components: mapFilterUndefined(
                Object.entries(state.dripList.items),
                ([slug, item]) => {
                  return item.type === 'project'
                    ? {
                        component: ProjectAvatar,
                        props: {
                          project: item.project,
                          outline: true,
                        },
                      }
                    : {
                        component: IdentityBadge,
                        props: {
                          address: slug,
                          showIdentity: false,
                          size: 'medium',
                          outline: true,
                          disableLink: true,
                        },
                      };
                },
              ),
              maxItems: 3,
            },
          },
        },
      ];
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
    component: ConfigureSupportStep,
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
