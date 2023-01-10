import { get, writable } from 'svelte/store';
import { z } from 'zod';
import assert from '$lib/utils/assert';
import { browser } from '$app/environment';

const LOCAL_STORAGE_KEY = 'dismissables';

const dismissableSchema = z.string();
type Dismissable = z.infer<typeof dismissableSchema>;

type State = Dismissable[];

const storageSchema = z.array(dismissableSchema);

/**
 * A simple key store persisted in localStorage, intended to be used for storing whether
 * the user has dismissed "dismissable" parts of the UI, such as hints or education cards.
 */
export default (() => {
  const previouslyDismissed =
    (browser && storageSchema.parse(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]'))) ||
    [];

  const state = writable<State>(previouslyDismissed);

  /**
   * Dismiss something by adding its arbitrary "id" to the list of dismissed items.
   * @param id The ID to dismiss.
   */
  function dismiss(id: string) {
    state.update((s) => {
      assert(!s.includes(id), 'This dismissable ID has already been dismissed.');

      const newState = [...s, id];

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));

      return newState;
    });
  }

  /**
   * Check whether `id` is included in the list of dismissed items.
   * @param id The ID to check for having been dismissed.
   */
  function isDismissed(id: string) {
    return get(state).includes(id);
  }

  /**
   * Clear the list of dismissed items.
   */
  function resetDismissables() {
    state.set([]);
    localStorage.setItem(LOCAL_STORAGE_KEY, '[]');
  }

  return {
    subscribe: state.subscribe,
    dismiss,
    isDismissed,
    resetDismissables,
  };
})();
