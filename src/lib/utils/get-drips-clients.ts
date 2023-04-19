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
  NFTDriverClient,
  NFTDriverTxFactory,
  GitDriverClient,
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
 * Get an initialized NFT Driver client.
 * @returns An initialized NFT Driver client.
 */
export function getNFTDriverClient() {
  const { provider, signer, connected } = get(wallet);
  assert(connected, 'Wallet must be connected to create a NFTDriverClient');

  const nftDriverAddress = getNetworkConfig().NFT_DRIVER;

  return NFTDriverClient.create(provider, signer, nftDriverAddress);
}

/**
 * Get an initialized Git Driver client.
 * @returns An initialized Git Driver client.
 */
export function getGitDriverClient() {
  const { provider, signer, connected } = get(wallet);
  assert(connected, 'Wallet must be connected to create a GitDriverClient');

  const gitDriverAddress = getNetworkConfig().GIT_DRIVER;

  return GitDriverClient.create(provider, signer, gitDriverAddress);
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
 * Get an initialized NFT Driver transaction factory.
 * @returns An initialized NFT Driver transaction factory.
 */
export function getNFTDriverTxFactory() {
  const { signer } = get(wallet);
  assert(signer);

  const nftDriverAddress = getNetworkConfig().NFT_DRIVER;

  return NFTDriverTxFactory.create(signer, nftDriverAddress);
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
        CALLER: '0xeEBe00Ac0756308ac4AaBfD76c05c4F3088B8883',
        DRIPS_HUB: '0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968',
        NFT_DRIVER: '0x9CfA6D15c80Eb753C815079F2b32ddEFd562C3e4',
        NFT_DRIVER_ID: '1',
        ADDRESS_DRIVER: '0x603E1BD79259EbcbAaeD0c83eeC09cA0B89a5bcC',
        DRIPS_HUB_LOGIC: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
        ADDRESS_DRIVER_ID: '0',
        NFT_DRIVER_LOGIC: '0x86337dDaF2661A069D0DcB5D160585acC2d15E9a',
        ADDRESS_DRIVER_LOGIC: '0x10C6E9530F1C1AF873a391030a1D9E8ed0630D26',
        IMMUTABLE_SPLITS_DRIVER: '0x275039fc0fd2eeFac30835af6aeFf24e8c52bA6B',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x427f7c59ED72bCf26DfFc634FEF3034e00922DD8',
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
