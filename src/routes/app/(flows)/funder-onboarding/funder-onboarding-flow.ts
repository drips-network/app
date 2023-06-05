import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import BuildListStep from './steps/build-list/build-list.svelte';
import ConfigureSupportStep from './steps/configure-support/configure-support.svelte';
import ReviewStep from './steps/review/review.svelte';
import type {
  Items,
  Percentages,
} from './steps/build-list/components/list-editor/list-editor.svelte';
import type { Slots } from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
import ListIcon from 'radicle-design-system/icons/List.svelte';
import Pile from '$lib/components/pile/pile.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';

export interface State {
  dripList: {
    selected: string[];
    items: Items;
    percentages: Percentages;
    title: string;
  };
  supportConfig: {
    listSelected: string[];
    streamRateValue: string;
    streamRateValueParsed?: bigint | undefined;
    topUpAmountValue: string;
    topUpAmountValueParsed?: bigint | undefined;
  };
}

export const state = writable<State>({
  dripList: { title: 'My Drip List', percentages: {}, items: {}, selected: [] },
  supportConfig: { listSelected: [], streamRateValue: '', topUpAmountValue: '' },
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
                  if (item.type !== 'selectable') return;
                  if (!state.dripList.selected.includes(slug)) return;

                  return {
                    component: ProjectAvatar,
                    props: {
                      project: item.label.props.project,
                      outline: true,
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
];
