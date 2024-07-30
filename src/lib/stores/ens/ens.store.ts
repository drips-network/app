import { get, writable } from 'svelte/store';
import assert from '$lib/utils/assert';
import type { AbstractProvider } from 'ethers';

export interface ResolvedRecord {
  name?: string;
  avatarUrl?: string;
}

type State = {
  [address: string]: ResolvedRecord;
};

export default (() => {
  const state = writable<State>({});
  const connected = writable(false);

  let provider: AbstractProvider | undefined;

  /**
   * Connect the store to a provider, which is needed in order to resolve ENS
   * records.
   * @param toProvider The provider to connect to.
   */
  function connect(toProvider: AbstractProvider) {
    provider = toProvider;
    connected.set(true);
  }

  /**
   * Perform an ENS lookup for the provided address, and append the result to the
   * store state. Looks up ENS name & avatar URL.
   * @param address The address to attempt resolving.
   */
  async function lookup(address: string): Promise<ResolvedRecord | undefined> {
    const saved = get(state)[address];
    if (saved) return;

    // Initially write an empty object to prevent multiple in-flight requests
    // for the same name
    state.update((s) => ({ ...s, [address]: {} }));
    try {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to resolve ENS name:', error); // eslint-disable-line no-console

      return undefined;
    }
  }

  /**
   * Look up an address by providing an ens name. The result is appended
   * to the store state.
   * @param name The name to reverse-lookup.
   * @returns The resolved name's Ethereum address.
   * If it was successful, you can find a resolved record which matches the provided
   * name in the store state.
   */
  async function reverseLookup(name: string): Promise<string | undefined> {
    assert(
      provider,
      'You need to `connect` the store to a provider before being able to reverse lookup',
    );

    const saved = Object.entries(get(state)).find((entry) => entry[1].name === name);

    if (saved) return saved[0];

    const address = await provider.resolveName(name);

    if (address) lookup(address);

    return address ?? undefined;
  }

  function clear() {
    state.set({});
  }

  return {
    subscribe: state.subscribe,
    connect,
    connected: { subscribe: connected.subscribe },
    lookup,
    reverseLookup,
    clear,
  };
})();
