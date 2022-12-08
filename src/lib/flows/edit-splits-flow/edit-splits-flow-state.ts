import type { SplitsEntry } from 'radicle-drips';
import { writable } from 'svelte/store';

export interface EditSplitsFlowState {
  splits: SplitsEntry[];
}

export default writable<EditSplitsFlowState>({ splits: [] });
