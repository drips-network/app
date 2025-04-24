import { get, writable } from 'svelte/store';
import assert from '$lib/utils/assert';
import network from '../wallet/network';
import walletStore from '../wallet/wallet.store';
import { getMainnetProvider, safeReverseLookup } from './ens';

export interface ResolvedRecord {
  name?: string;
  avatarUrl?: string;
}

type State = {
  [address: string]: ResolvedRecord;
};

export default (() => {
  const state = writable<State>({});
  const mainnetProvider = network.enableEns ? getMainnetProvider() : null;

  /**
   * Perform an ENS lookup for the provided address, and append the result to the
   * store state. Looks up ENS name & avatar URL.
   * @param address The address to attempt resolving.
   */
  async function lookup(address: string): Promise<ResolvedRecord | undefined> {
    if (network.enableEns || !mainnetProvider) {
      return undefined;
    }

    const saved = get(state)[address];
    if (saved) return;

    // Initially write an empty object to prevent multiple in-flight requests
    // for the same name
    state.update((s) => ({ ...s, [address]: {} }));
    try {
      const name = await mainnetProvider.lookupAddress(address);

      let avatarUrl: string | null = null;
      if (name) {
        const resolver = await mainnetProvider.getResolver(name);
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
    if (network.enableEns || !mainnetProvider) {
      return undefined;
    }

    const address = await safeReverseLookup(
      get(walletStore).provider,
      mainnetProvider,
      network.chainId,
      name,
    );
    if (address) lookup(address);

    return address ?? undefined;
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
