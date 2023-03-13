import { browser } from '$app/environment';
import { writable, type Writable, get } from 'svelte/store';
import type { z, ZodType } from 'zod';

/**
 * An extension of Svelte's `writable` that also saves its state to localStorage and
 * automatically restores it.
 * @param key The localStorage key to use for saving the writable's contents.
 * @param schema A Zod schema describing the contents of the writable.
 * @param initialValue The initial value to use if no prior state has been saved in
 * localstorage.
 * @returns A stored writable.
 */
export default function storedWritable<T extends ZodType>(
  key: string,
  schema: T,
  initialValue: z.infer<typeof schema>,
): Writable<z.infer<typeof schema>> {
  const stored = browser ? localStorage.getItem(key) : null;

  const w = writable<z.infer<typeof schema>>(
    stored ? schema.parse(JSON.parse(stored)) : initialValue,
  );

  function set(...args: Parameters<typeof w.set>) {
    w.set(...args);
    if (browser) localStorage.setItem(key, JSON.stringify(get(w)));
  }

  function update(...args: Parameters<typeof w.update>) {
    w.update(...args);
    if (browser) localStorage.setItem(key, JSON.stringify(get(w)));
  }

  return {
    subscribe: w.subscribe,
    set,
    update,
  };
}
