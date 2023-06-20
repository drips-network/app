import { derived, type Readable } from 'svelte/store';

function arraysEqual(a: unknown[], b: unknown[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Returns a derived store that only notifies subscribers if the underlying readable's value has changed. */
export default function <T>(store: Readable<T>): Readable<T> {
  let previous: T;

  return derived(store, ($value, set) => {
    if (Array.isArray($value) && Array.isArray(previous)) {
      if (arraysEqual($value, previous)) return;
    }

    if ($value !== previous) {
      previous = $value;
      set($value);
    }
  });
}
