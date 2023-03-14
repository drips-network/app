import { get, writable } from 'svelte/store';

type FilterMembers<T, C> = {
  [K in keyof T]: T[K] extends C ? K : never;
};

type FilterKeys<T, C> = FilterMembers<T, C>[keyof T];

type FilterTypeMembers<T, C> = Pick<T, FilterKeys<T, C>>;

/**
 * A utility that saves certain inputs and can restore them on demand. Useful for saving inputs in a flow step, and restoring
 * them when the user comes back after an error, for example.
 *
 * Pass a type describing all values this particular restorer should keep track of as the first type argument.
 *
 * **Example**
 *
 * ```ts
 * const restorer = newRestorer<{ foo: string | undefined, bar: number | undefined }>()
 *
 * // ⬇️ Automatically typed as string | undefined
 * let foo = restorer.restore('foo'); // -> returns undefined
 *
 * // ⬇️ Foo is automatically typed as string | undefined
 * restorer.save({ foo: 'wassup' });
 *
 * foo = restorer.restore('foo'); // -> returns 'wassup'
 * ```
 *
 * If you include non-nullable values in your restorable types, you need to initially define them when creating
 * the restorer.
 *
 * **Example**
 *
 * ```ts
 * const restorer = newRestorer<{ optionalVal: string | undefined, requiredVal: string }>({ requiredVal: 'hello' });
 * ```
 *
 * @param defaults Initial values for any non-nullable restorables defined in the type argument.
 * @returns A new restorer instance.
 */
export function newRestorer<T extends Record<string, unknown>>(
  defaults: FilterTypeMembers<T, NonNullable<unknown>>,
) {
  const state = writable<T>(defaults as T);

  function save(vals: Partial<T>): void {
    const filteredVals = Object.fromEntries(Object.entries(vals).filter((e) => e[1] !== undefined));

    state.update((s) => ({ ...s, ...filteredVals }));
  }

  function saveAll(vals: T): void {
    state.set(vals);
  }

  function restore<K extends keyof T>(key: K): T[K] {
    const s = get(state);

    return (s ?? {})[key];
  }

  function clear() {
    state.set(defaults as T);
  }

  return {
    subscribe: state.subscribe,
    save,
    saveAll,
    restore,
    clear,
  };
}

export type Restorer<T extends Record<string, unknown>> = ReturnType<typeof newRestorer<T>>;
