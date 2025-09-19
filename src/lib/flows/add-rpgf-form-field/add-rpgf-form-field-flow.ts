import { makeStep } from '$lib/components/stepper/types';
import { get, writable } from 'svelte/store';
import type { ApplicationFieldDto } from '$lib/utils/rpgf/types/application';
import ChooseType from './choose-type.svelte';
import ConfigureField from './configure-field.svelte';

export interface State {
  field: ApplicationFieldDto | null;
}

export default (
  unavailableSlugs: string[],
  onAdd: (field: ApplicationFieldDto) => void,
  fieldToEdit?: ApplicationFieldDto | null,
) => {
  const context = writable<State>({
    field: fieldToEdit || null,
  });

  return {
    context: () => context,
    steps: [
      makeStep({
        component: ChooseType,
        props: {
          onAdd,
        },
        condition: () => {
          return get(context).field === null;
        },
      }),
      makeStep({
        component: ConfigureField,
        props: {
          unavailableSlugs,
          onAdd,
        },
      }),
    ],
  };
};
