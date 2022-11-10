import wallet from '$lib/stores/wallet';
import assert from '$lib/utils/assert';
import { AddressDriverClient, DripsHubClient, DripsSubgraphClient } from 'radicle-drips';
import { get } from 'svelte/store';
import isTest from './is-test';

export function getSubgraphClient() {
  const { network } = get(wallet);

  return isTest()
    ? DripsSubgraphClient.create(
        network.chainId,
        'http://localhost:8000/subgraphs/name/drips-subgraph-mainnet-v2',
      )
    : DripsSubgraphClient.create(network.chainId);
}

export function getAddressDriverClient() {
  const { provider, connected } = get(wallet);

  assert(connected, 'Wallet must be connected to create an AddressDriverClient');

  return isTest()
    ? AddressDriverClient.create(provider, '0x0165878A594ca255338adfa4d48449f69242Eb8F')
    : AddressDriverClient.create(provider);
}

export function getDripsHubClient() {
  const { provider, connected } = get(wallet);

  assert(connected, 'Wallet must be connected to create an AddressDriverClient');

  return isTest()
    ? DripsHubClient.create(provider, '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9')
    : DripsHubClient.create(provider);
}
