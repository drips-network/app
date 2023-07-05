import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import {
  AddressDriverClient,
  AddressDriverTxFactory,
  CallerClient,
  DripsClient,
  DripsSubgraphClient,
  Utils,
  type NetworkConfig,
  NFTDriverClient,
  NFTDriverTxFactory,
  RepoDriverClient,
  RepoDriverTxFactory,
  DripsTxFactory,
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
 * Get an initialized Repo Driver transaction factory.
 * @returns An initialized Repo Driver transaction factory.
 */
export function getRepoDriverTxFactory() {
  const { signer } = get(wallet);
  assert(signer);

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;

  return RepoDriverTxFactory.create(signer, repoDriverAddress);
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
export function getDripsClient() {
  const { provider, signer } = get(wallet);

  const dripsAddress = getNetworkConfig().DRIPS;

  return DripsClient.create(provider, signer, dripsAddress);
}

/**
 * Get an initialized Drips transaction factory.
 * @returns An initialized Drips transaction factory.
 */
export function getDripsTxFactory() {
  const { provider } = get(wallet);

  const dripsAddress = getNetworkConfig().DRIPS;

  return DripsTxFactory.create(provider, dripsAddress);
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
        COMMIT_HASH: '54ecc90aa08e141d27e6a7d6d7835d0316cb200f',
        WALLET: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        DRIPS_DEPLOYER: '0x84cD64825C40C23e1698f87BdA8db181BCedC7f5',
        DRIPS_DEPLOYER_SALT: 'DripsDeployer',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        ADDRESS_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        NFT_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        SUBGRAPH_URL: `http://${
          env?.PUBLIC_TEST_SUBGRAPH_HOST ?? 'localhost'
        }:8000/subgraphs/name/drips-subgraph-local`,
        CALLER: '0xB32DdAe2A2F98Fee768A4950559A085C7fA76Ad9',
        DRIPS: '0x81f95dC02f0C70175c20AEfE91C9EFe34B5aefaf',
        NFT_DRIVER: '0xfaF77afa82D7b277cebad7FDbF70E3424a185B67',
        NFT_DRIVER_ID: '1',
        ADDRESS_DRIVER: '0x439d0b5D3c007e447F020E15E46bE398B1ccc1A2',
        DRIPS_LOGIC: '0xD0BBd70EA014bFEC48da174EdF908EC30a5ba9F1',
        ADDRESS_DRIVER_ID: '0',
        NFT_DRIVER_LOGIC: '0xE87874DBF1c3a1D8B4f4cB44d736C53987e0cC5e',
        ADDRESS_DRIVER_LOGIC: '0xB1A29A3fe16eB40655e239e88B61aB84a9bf0397',
        IMMUTABLE_SPLITS_DRIVER: '0xF4A093CFa3125a1C9F3c029703C792Ce19fc946B',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x8291604630CcAd6E716792350bB2301f38E5CaF5',
        REPO_DRIVER: '0xE57458b012E2e261BBc9e827F80FF82CB9043064',
        REPO_DRIVER_LOGIC: '0xb6495F3c4384959ce679955DE520a5910eedcdc9',
        REPO_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0x0000000000000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_JOB_ID: '00000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '0',
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
