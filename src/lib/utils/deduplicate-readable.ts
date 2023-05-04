import { derived, type Readable } from 'svelte/store';

/** Returns a derived store that only notifies subscribers if the underlying readable's value has changed. */
export default function <T>(store: Readable<T>): Readable<T> {
  let previous: T;

  return derived(store, ($value, set) => {
    if (Array.isArray($value) && Array.isArray(previous)) {
      if (JSON.stringify($value) === JSON.stringify(previous)) return;
    }

    if ($value !== previous) {
      previous = $value;
      set($value);
    }
  });
}
