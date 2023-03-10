import { newRestorer, type Restorer } from '$lib/utils/restorer';
import type { SplitsEntry } from 'radicle-drips';
import { writable } from 'svelte/store';
import type { SplitInput } from './edit-splits-inputs.svelte';

type Restorable = {
  splitsInputs: SplitInput[] | undefined;
};

export interface EditSplitsFlowState {
  splits: SplitsEntry[];
  restorer: Restorer<Restorable>;
}

export default writable<EditSplitsFlowState>({ splits: [], restorer: newRestorer<Restorable>({}) });
