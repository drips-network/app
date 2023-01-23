import wallet from '$lib/stores/wallet';
import assert from '$lib/utils/assert';
import {
  AddressDriverClient,
  CallerClient,
  DripsHubClient,
  DripsSubgraphClient,
  Utils,
  type NetworkConfig,
} from 'radicle-drips';
import { get } from 'svelte/store';
import isTest from './is-test';

/**
 * Get an initialized Drips Subgraph client.
 * @returns An initialized Drips Subgraph client.
 */
export function getSubgraphClient() {
  const { network } = get(wallet);

  return DripsSubgraphClient.create(network.chainId, getNetworkConfig().SUBGRAPH_URL);
}

/**
 * Get an initialized Address Driver client.
 * @returns An initialized Address Driver client.
 */
export function getAddressDriverClient(withSigner = get(wallet).signer) {
  const { provider } = get(wallet);

  const addressDriverAddress = getNetworkConfig().CONTRACT_ADDRESS_DRIVER;

  return AddressDriverClient.create(provider, withSigner, addressDriverAddress);
}

/**
 * Get an initialized Drips Hub client.
 * @returns An initialized Drips Hub client.
 */
export function getDripsHubClient() {
  const { provider, signer } = get(wallet);

  const dripsHubAddress = getNetworkConfig().CONTRACT_DRIPS_HUB;

  return DripsHubClient.create(provider, signer, dripsHubAddress);
}

/**
 * Get an initialized Caller client.
 * @returns An initialized Caller client.
 */
export function getCallerClient() {
  const { provider, signer, connected } = get(wallet);
  assert(connected, 'Wallet must be connected to create a CallerClient');

  return CallerClient.create(provider, signer, getNetworkConfig().CONTRACT_CALLER);
}

/**
 * NetworkConfig object that is aware of being ran in an E2E-test environment, so that
 * clients are initialized with addresses matching local testnet deployments. See `README`'s
 * E2E test section.
 */
export const networkConfigs: { [chainId: number]: NetworkConfig } = isTest()
  ? {
      5: {
        NETWORK_NAME: 'goerli',
        CYCLE_SECS: '604800',
        SUBGRAPH_URL: 'http://localhost:8000/subgraphs/name/drips-subgraph-mainnet-v2',
        CONTRACT_CALLER: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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
      },
    }
  : {
      ...Utils.Network.configs,
    };

/**
 * Get the networkConfig for the current network.
 * @returns The networkConfig for the current network.
 */
export function getNetworkConfig() {
  const { network } = get(wallet);

  return networkConfigs[network.chainId];
}
