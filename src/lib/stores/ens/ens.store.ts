import type { Web3Provider } from '@ethersproject/providers';
import { get, writable } from 'svelte/store';

interface ResolvedRecord {
  name?: string;
  avatarUrl?: string;
}

type State = {
  [address: string]: ResolvedRecord;
};

export default (() => {
  const state = writable<State>({});
  let provider: Web3Provider | undefined;

  /**
   * Connect the store to a provider, which is needed in order to resolve ENS
   * records.
   * @param toProvider The provider to connect to.
   */
  function connect(toProvider: Web3Provider) {
    provider = toProvider;
  }

  /**
   * Disconnect the store from a previously-connected provider. After calling this,
   * all subsequent lookups will silently fail.
   */
  function disconnect() {
    provider = undefined;
  }

  /**
   * Perform an ENS lookup for the provided address, and append the result to the
   * store state. Looks up ENS name & avatar URL.
   * @param address The address to attempt resolving.
   * @returns A promise resolving to the fetched ENS record, or undefined if
   * unknown.
   */
  async function lookup(address: string): Promise<ResolvedRecord | undefined> {
    const saved = get(state)[address];
    if (saved?.name) return saved;

    // Initially write an empty object to prevent multiple in-flight requests
    // for the same name
    state.update((s) => ({ ...s, [address]: {} }));

    const lookups = [provider?.lookupAddress(address), provider?.getAvatar(address)];

    const [name, avatarUrl] = await Promise.all(lookups);

    if (name || avatarUrl) {
      const resolvedRecord = {
        name: name ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
      };

      state.update((s) => ({
        ...s,
        [address]: resolvedRecord,
      }));

      return resolvedRecord;
    }
  }

  return {
    subscribe: state.subscribe,
    connect,
    disconnect,
    lookup,
  };
})();
