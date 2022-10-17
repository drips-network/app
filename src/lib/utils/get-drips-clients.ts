import wallet from '$lib/stores/wallet';
import assert from '$lib/utils/assert';
import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
import { get } from 'svelte/store';

export function getSubgraphClient() {
  const { network } = get(wallet);

  return DripsSubgraphClient.create(network.chainId);
}

export function getAddressDriverClient() {
  const { provider, connected } = get(wallet);

  assert(connected, 'Wallet must be connected to create an AddressDriverClient');

  return AddressDriverClient.create(provider);
}
