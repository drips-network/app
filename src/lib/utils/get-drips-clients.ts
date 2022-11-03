import wallet from '$lib/stores/wallet';
import assert from '$lib/utils/assert';
import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
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
    ? AddressDriverClient.create(provider, {
        NAME: 'goerli',
        CYCLE_SECS: '604800',
        SUBGRAPH_URL: 'http://localhost:8000/subgraphs/name/drips-subgraph-mainnet-v2',
        CONTRACT_DRIPS_HUB: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        CONTRACT_NFT_DRIVER: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
        CONTRACT_NFT_DRIVER_ID: '1',
        CONTRACT_ADDRESS_DRIVER: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
        CONTRACT_DRIPS_HUB_LOGIC: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        CONTRACT_ADDRESS_DRIVER_ID: '0',
        CONTRACT_NFT_DRIVER_LOGIC: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
        CONTRACT_ADDRESS_DRIVER_LOGIC: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
        CONTRACT_IMMUTABLE_SPLITS_DRIVER: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
        CONTRACT_IMMUTABLE_SPLITS_DRIVER_ID: '2',
        CONTRACT_IMMUTABLE_SPLITS_DRIVER_LOGIC: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
      })
    : AddressDriverClient.create(provider);
}
