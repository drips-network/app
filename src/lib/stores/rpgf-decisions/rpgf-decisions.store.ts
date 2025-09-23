import { writable } from 'svelte/store';

const state = writable<Record<string, 'approve' | 'reject' | null>>({});

export function clearDecisions() {
  state.set({});
}

export const decisionsStore = state;
