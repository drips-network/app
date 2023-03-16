import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import {
  AddressDriverClient,
  AddressDriverTxFactory,
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

  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;

  return AddressDriverClient.create(provider, withSigner, addressDriverAddress);
}

/**
 * Get an initialized Address Driver transaction factory.
 * @returns An initialized Address Driver transaction factory.
 */
export function getAddressDriverTxFactory() {
  const { signer } = get(wallet);
  assert(signer);

  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;

  return AddressDriverTxFactory.create(signer, addressDriverAddress);
}

/**
 * Get an initialized Drips Hub client.
 * @returns An initialized Drips Hub client.
 */
export function getDripsHubClient() {
  const { provider, signer } = get(wallet);

  const dripsHubAddress = getNetworkConfig().DRIPS_HUB;

  return DripsHubClient.create(provider, signer, dripsHubAddress);
}

/**
 * Get an initialized Caller client.
 * @returns An initialized Caller client.
 */
export function getCallerClient() {
  const { provider, signer, connected } = get(wallet);
  assert(connected, 'Wallet must be connected to create a CallerClient');

  return CallerClient.create(provider, signer, getNetworkConfig().CALLER);
}

/**
 * NetworkConfig object that is aware of being ran in an E2E-test environment, so that
 * clients are initialized with addresses matching local testnet deployments. See `README`'s
 * E2E test section.
 */
export const networkConfigs: { [chainId: number]: NetworkConfig } = isTest()
  ? {
      5: {
        CHAIN: 'goerli',
        DEPLOYMENT_TIME: 'foobar',
        COMMIT_HASH: '8980ce57a29f797b53b9f30755f6628185b66c57',
        WALLET: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        WALLET_NONCE: '1',
        DEPLOYER: '0xC881Ee954895f1743FEFF7e6014E98BEf988FDc8',
        DRIPS_HUB_CYCLE_SECONDS: '604800',
        DRIPS_HUB_ADMIN: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        ADDRESS_DRIVER_ADMIN: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        NFT_DRIVER_ADMIN: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        SUBGRAPH_URL: 'http://localhost:8000/subgraphs/name/drips-subgraph-local',
        CALLER: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        DRIPS_HUB: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        NFT_DRIVER: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
        NFT_DRIVER_ID: '1',
        ADDRESS_DRIVER: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
        DRIPS_HUB_LOGIC: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
        ADDRESS_DRIVER_ID: '0',
        NFT_DRIVER_LOGIC: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
        ADDRESS_DRIVER_LOGIC: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
        IMMUTABLE_SPLITS_DRIVER: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
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
