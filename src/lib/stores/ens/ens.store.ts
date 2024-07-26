import { get, writable } from 'svelte/store';
import walletStore from '../wallet/wallet.store';

export interface ResolvedRecord {
  name?: string;
  avatarUrl?: string;
}

type State = {
  [address: string]: ResolvedRecord;
};

export default (() => {
  const state = writable<State>({});

  /**
   * Perform an ENS lookup for the provided address, and append the result to the
   * store state. Looks up ENS name & avatar URL.
   * @param address The address to attempt resolving.
   */
  async function lookup(address: string): Promise<ResolvedRecord | undefined> {
    const { provider } = get(walletStore);

    const saved = get(state)[address];
    if (saved) return;

    // Initially write an empty object to prevent multiple in-flight requests
    // for the same name
    state.update((s) => ({ ...s, [address]: {} }));

    const lookups = [provider.lookupAddress(address), provider.getAvatar(address)];

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

  /**
   * Look up an address by providing an ens name. The result is appended
   * to the store state.
   * @param name The name to reverse-lookup.
   * @returns The resolved name's Ethereum address.
   * If it was successful, you can find a resolved record which matches the provided
   * name in the store state.
   */
  async function reverseLookup(name: string): Promise<string | undefined> {
    const { provider } = get(walletStore);

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
    lookup,
    reverseLookup,
    clear,
  };
})();
