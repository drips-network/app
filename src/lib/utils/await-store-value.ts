import type { Readable } from 'svelte/store';

export default function awaitStoreValue<ST>(
  store: Readable<ST>,
  condition: (value: ST) => boolean,
) {
  return new Promise((resolve) => {
    const unsubscribe = store.subscribe((value) => {
      if (condition(value)) {
        resolve(value);
        unsubscribe();
      }
    });
  });
}
