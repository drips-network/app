import { newRestorer, type Restorer } from '$lib/utils/restorer';
import { writable } from 'svelte/store';

type Restorable = {
  newAmountValue: string | undefined;
  newName: string | undefined;
  newSelectedMultiplier: string;
};

export interface EditStreamFlowState {
  restorer: Restorer<Restorable>;
}

export default () =>
  writable<EditStreamFlowState>({
    restorer: newRestorer<Restorable>({ newSelectedMultiplier: '1' }),
  });
