import { get, writable } from 'svelte/store';
import assert from '$lib/utils/assert';
import network from '../wallet/network';
import walletStore from '../wallet/wallet.store';
import { getMainnetProvider, safeReverseLookp } from './ens';

export interface ResolvedRecord {
  name?: string;
  avatarUrl?: string;
}

type State = {
  [address: string]: ResolvedRecord;
};

const mainnetProvider = getMainnetProvider();

export default (() => {
  const state = writable<State>({});

  function _pickProvider() {
    return mainnetProvider ?? get(walletStore).provider;
  }

  /**
   * Perform an ENS lookup for the provided address, and append the result to the
   * store state. Looks up ENS name & avatar URL.
   * @param address The address to attempt resolving.
   */
  async function lookup(address: string): Promise<ResolvedRecord | undefined> {
    const provider = _pickProvider();

    const saved = get(state)[address];
    if (saved) return;

    // Initially write an empty object to prevent multiple in-flight requests
    // for the same name
    state.update((s) => ({ ...s, [address]: {} }));
    try {
      const name = await provider.lookupAddress(address);

      let avatarUrl: string | null = null;
      if (name) {
        const resolver = await provider.getResolver(name);
        assert(resolver, 'Failed to get resolver');

        avatarUrl = resolver ? await resolver.getAvatar() : null;
      }

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
    const provider = _pickProvider();

    assert(
      provider,
      'You need to `connect` the store to a provider before being able to reverse lookup',
    );

    const saved = Object.entries(get(state)).find((entry) => entry[1].name === name);
    if (saved) return saved[0];

    const address = await safeReverseLookp(
      get(walletStore).provider,
      provider,
      network.chainId,
      name,
    );
    if (address) lookup(address);

    return address;
  }

  function clear() {
    state.set({});
  }

  return {
    subscribe: state.subscribe,
    lookup,
    reverseLookup,
    clear,
  };
})();
