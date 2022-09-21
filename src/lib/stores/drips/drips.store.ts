import type { Web3Provider } from '@ethersproject/providers';
import { AddressAppClient, DripsSubgraphClient } from 'radicle-drips';
import { writable } from 'svelte/store';

interface State {
  clients: {
    addressApp: AddressAppClient;
    subgraph: DripsSubgraphClient;
  };
}

export default (() => {
  const state = writable<State | undefined>();

  /**
   * Connect the store to a provider and initialize all Drips clients at `state.clients`.
   * @param toProvider The provider to connect to.
   */
  async function connect(toProvider: Web3Provider): Promise<void> {
    const { chainId } = toProvider.network;

    state.set({
      clients: {
        subgraph: DripsSubgraphClient.create(chainId),
        addressApp: await AddressAppClient.create(toProvider),
      },
    });
  }

  /**
   * Disconnect the store from a previously-connected provider, and clear its state.
   */
  function disconnect(): void {
    state.set(undefined);
  }

  return {
    subscribe: state.subscribe,
    connect,
    disconnect,
  };
})();
