import { get, writable } from 'svelte/store';

interface State {
  data: Record<string, unknown>;
}

const state = writable<State>({ data: {} });

function set(key: string, value: unknown) {
  state.update((s) => {
    s.data[key] = value;
    return s;
  });
}

export function clear(key: string) {
  state.update((s) => {
    delete s.data[key];
    return s;
  });
}

export function clearAll() {
  state.set({ data: {} });
}

/**
 * Create a local "fetched data cache" that can be used to prevent data from being re-fetched
 * on navigations to a page that has already previously been navigated to.
 *
 * **Important**: There is no magic for removing data from this store. If data of a page that uses
 * this cache should be re-fetched, ensure that `invalidate` functions from `./invalidate.ts` are
 * called with the appropriate keys.
 *
 * **Also important**: No runtime type checking is being done. You need to make sure that
 *    1. The key you pass to this function is unique
 *    2. The type you pass to this function is correct
 * @param key
 * @returns
 */
export const makeFetchedDataCache = <T extends Record<string, unknown> | unknown[]>(
  key: string,
) => {
  function read(): T | undefined {
    return get(state).data[key] as T;
  }

  function write(v: T) {
    set(key, v);
  }

  return {
    subscribe: state.subscribe,
    read,
    write,
  };
};
