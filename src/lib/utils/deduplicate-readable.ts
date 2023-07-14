import { derived, type Readable } from 'svelte/store';

function replacer(_: string, value: unknown) {
  // Stringify bigints as strings
  if (typeof value === 'bigint') {
    return value.toString();
  }

  return value;
}

/** Returns a derived store that only notifies subscribers if the underlying readable's value has changed. */
export default function <T>(store: Readable<T>): Readable<T> {
  let previous: T;

  return derived(store, ($value, set) => {
    if (Array.isArray($value) && Array.isArray(previous)) {
      if (JSON.stringify($value, replacer) === JSON.stringify(previous, replacer)) return;
    }

    if ($value !== previous) {
      previous = $value;
      set($value);
    }
  });
}
