import { writable } from 'svelte/store';

export default (() => {
  const state = writable(0);

  function increment(by: number): void {
    state.update((s) => s + by);
  }

  return {
    ...state,
    increment,
  };
})();
