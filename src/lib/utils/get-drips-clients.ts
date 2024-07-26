import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import { AddressDriverTxFactory, CallerClient, Utils, type NetworkConfig } from 'radicle-drips';
import { get } from 'svelte/store';
import isTest from './is-test';

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
export const networkConfigs: { [chainId: number]: Omit<NetworkConfig, 'SUBGRAPH_URL'> } = isTest()
  ? {
      11155111: {
        CHAIN: 'sepolia',
        DEPLOYMENT_TIME: 'foobar',
        COMMIT_HASH: '232029aa1ded48751b01709311987535ee6d3a97',
        WALLET: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        DRIPS_DEPLOYER: '0x7000eE653a4E2694d70F0099DBf8fBAe649Cd1EF',
        DRIPS_DEPLOYER_SALT: 'DripsDeployerTest1',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        ADDRESS_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        NFT_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        CALLER: '0xaBf7431BFC75BAD19AA98911c4dd7165b619771F',
        DRIPS: '0xa0523b86472561f0859d84C094cc04e6c4B33169',
        NFT_DRIVER: '0xc95eb214845d5693abc750692161CB008796ae5C',
        NFT_DRIVER_ID: '1',
        ADDRESS_DRIVER: '0xcc137285FD4D8914Dae08629086309B89aA6FDef',
        DRIPS_LOGIC: '0xD0BBd70EA014bFEC48da174EdF908EC30a5ba9F1',
        ADDRESS_DRIVER_ID: '0',
        NFT_DRIVER_LOGIC: '0x1Dee3E2d70d41160D5AC80FB93986baE5D69A42e',
        ADDRESS_DRIVER_LOGIC: '0x7adB68BB8b9C20109fCeeDe40C36E5263D426746',
        IMMUTABLE_SPLITS_DRIVER: '0xEC8493BdbBbBe22a6F54573cFeE23ac8Ab90dF77',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0xB3106163A116F538f03dFd3FEAB0eb59979ebeDE',
        REPO_DRIVER: '0xb9C8e18E82687a564Ac4D26E22D28a4C95057CE9',
        REPO_DRIVER_LOGIC: '0xb6495F3c4384959ce679955DE520a5910eedcdc9',
        REPO_DRIVER_ADMIN: '0xFAdDb8777bf0445aBb85DA2d1889836BaCC5C9A3',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0x0000000000000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_JOB_ID: '00000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '0',
        DETERMINISTIC_DEPLOYER: '',
        CREATE3_FACTORY: '',
      },
    }
  : {
      ...Utils.Network.configs,
    };

/**
 * Get the networkConfig for the current network.
 * @returns The networkConfig for the current network.
 */
export function getNetworkConfig(
  chainId = get(wallet).network.chainId,
): Omit<NetworkConfig, 'SUBGRAPH_URL'> {
  const config = networkConfigs[chainId];
  assert(config, `No network config found for chainId ${chainId}`);

  return config;
}
