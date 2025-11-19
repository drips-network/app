import type { Writable } from 'svelte/store';

export type BallotValidationErrorsStore = Writable<Set<string>>;

export const ballotValidationContextKey = Symbol('rpgf-ballot-validation-errors');
