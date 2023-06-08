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
  RepoDriverClient,
} from 'radicle-drips';
import { get } from 'svelte/store';
import isTest from './is-test';
import { env } from '$env/dynamic/public';

/**
 * Get an initialized Drips Subgraph client.
 * @returns An initialized Drips Subgraph client.
 */
export function getSubgraphClient() {
  const { network } = get(wallet);

  return DripsSubgraphClient.create(network.chainId, getNetworkConfig().SUBGRAPH_URL);
}

/**
 * Get an initialized Repo Driver client.
 * @returns An initialized Repo Driver client.
 */
export function getRepoDriverClient(withSigner = get(wallet).signer) {
  const { provider } = get(wallet);

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;

  return RepoDriverClient.create(provider, withSigner, repoDriverAddress);
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
        CHAIN: 'sepolia',
        DEPLOYMENT_TIME: 'foobar',
        COMMIT_HASH: '3809b5fa68c81af3fe0ac9200f8c806d7aa78c88',
        WALLET: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
        WALLET_NONCE: '1',
        DEPLOYER: '0xefbF81372aBC3723463746a89CEb42080563684C',
        DRIPS_HUB_CYCLE_SECONDS: '604800',
        DRIPS_HUB_ADMIN: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
        ADDRESS_DRIVER_ADMIN: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
        NFT_DRIVER_ADMIN: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
        SUBGRAPH_URL: `http://${
          env?.PUBLIC_TEST_SUBGRAPH_HOST ?? 'localhost'
        }:8000/subgraphs/name/drips-subgraph-local`,
        CALLER: '0x97c1349650F9ab72fD46CAab8f215F8e677fdCF4',
        DRIPS_HUB: '0xa328B55BFF30EfF12591Cdfb3dcF4c12d804f583',
        NFT_DRIVER: '0x55329C69414e88279a21c862b8195c1C64b4da96',
        NFT_DRIVER_ID: '1',
        ADDRESS_DRIVER: '0xDDE80B7eDC6BFc55bB5f3449f016635c55C56b6e',
        DRIPS_HUB_LOGIC: '0xb2b3204FcA749d885483E8BaDA131dBeb11501E9',
        ADDRESS_DRIVER_ID: '0',
        NFT_DRIVER_LOGIC: '0xD2D2d4b4996ff83f9c967C3cD9d27181cD9da5DE',
        ADDRESS_DRIVER_LOGIC: '0xB6A122d7c20b5eE6ee322db85964DA8A7825389A',
        IMMUTABLE_SPLITS_DRIVER: '0x34466661145b6D19f32Ae0f4b2BFD3874573bdf0',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x427f7c59ED72bCf26DfFc634FEF3034e00922DD8',
        REPO_DRIVER: ' ',
        REPO_DRIVER_LOGIC: ' ',
        REPO_DRIVER_ADMIN: ' ',
        REPO_DRIVER_ID: ' ',
        REPO_DRIVER_ANYAPI_OPERATOR: ' ',
        REPO_DRIVER_ANYAPI_JOB_ID: ' ',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: ' ',
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
