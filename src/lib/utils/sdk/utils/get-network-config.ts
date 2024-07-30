import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import { get } from 'svelte/store';
import isTest from '../../is-test';
import type { NetworkConfig } from '../sdk-types';

/**
 * NetworkConfig object that is aware of being ran in an E2E-test environment, so that
 * clients are initialized with addresses matching local testnet deployments. See `README`'s
 * E2E test section.
 */
export const networkConfigs = isTest()
  ? ({
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
    } as const)
  : ({
      // Mainnet
      1: {
        CHAIN: 'mainnet',
        DEPLOYMENT_TIME: '2023-07-13T12:30:27Z',
        COMMIT_HASH: 'afeba55f70a968ded7c0797a4211faa856e28fa0',
        WALLET: '0x823204FFd4fAa09fbf2AAc51A290233e829991a1',
        DETERMINISTIC_DEPLOYER: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
        CREATE3_FACTORY: '0x6aa3d87e99286946161dca02b97c5806fc5ed46f',
        DRIPS_DEPLOYER_SALT: 'DripsDeployer',
        DRIPS_DEPLOYER: '0x0c1Ea3a5434Bf8F135fD0c7258F0f25219fDB27f',
        DRIPS: '0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_LOGIC: '0xb0C9B6D67608bE300398d0e4FB0cCa3891E1B33F',
        DRIPS_ADMIN: '0x8dA8f82d2BbDd896822de723F55D6EdF416130ba',
        CALLER: '0x60F25ac5F289Dc7F640f948521d486C964A248e5',
        ADDRESS_DRIVER: '0x1455d9bD6B98f95dd8FEB2b3D60ed825fcef0610',
        ADDRESS_DRIVER_ID: '0',
        ADDRESS_DRIVER_LOGIC: '0x3Ea1e774f98cc4C6359bbCB3238E3e60365Fa5c9',
        ADDRESS_DRIVER_ADMIN: '0x8dA8f82d2BbDd896822de723F55D6EdF416130ba',
        NFT_DRIVER: '0xcf9c49B0962EDb01Cdaa5326299ba85D72405258',
        NFT_DRIVER_ID: '1',
        NFT_DRIVER_LOGIC: '0x3B11537D0d4276Ba9e41FFe04e9034280bd7af50',
        NFT_DRIVER_ADMIN: '0x8dA8f82d2BbDd896822de723F55D6EdF416130ba',
        IMMUTABLE_SPLITS_DRIVER: '0x1212975c0642B07F696080ec1916998441c2b774',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x2c338CDf00dFd5A9B3B6b0b78BB95352079AAF71',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x8dA8f82d2BbDd896822de723F55D6EdF416130ba',
        REPO_DRIVER: '0x770023d55D09A9C110694827F1a6B32D5c2b373E',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0xa928d4b087AD35C46BA83331d8eEddb83152319b',
        REPO_DRIVER_ANYAPI_JOB_ID: '9af746c7cfbc415c9737b239df9a30ab',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '1620000000000000000',
        REPO_DRIVER_LOGIC: '0xfC446dB5E1255e837E95dB90c818C6fEb8e93ab0',
        REPO_DRIVER_ADMIN: '0x8dA8f82d2BbDd896822de723F55D6EdF416130ba',
      },
      // Sepolia
      11155111: {
        CHAIN: 'sepolia',
        DEPLOYMENT_TIME: '2023-07-15T10:41:56Z',
        COMMIT_HASH: 'afeba55f70a968ded7c0797a4211faa856e28fa0',
        WALLET: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        DETERMINISTIC_DEPLOYER: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
        CREATE3_FACTORY: '0x6aa3d87e99286946161dca02b97c5806fc5ed46f',
        DRIPS_DEPLOYER_SALT: 'DripsDeployerTest1',
        DRIPS_DEPLOYER: '0xa6030dD9D31FA2333Ee9f7feaCa6FB23c42a1d96',
        DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_LOGIC: '0xf103BDDB82B6177e5fE53c50351E33F4f3df955B',
        DRIPS_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
        ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
        ADDRESS_DRIVER_ID: '0',
        ADDRESS_DRIVER_LOGIC: '0x298F37fFd4B31d216B8954968cEe7EC5273CB891',
        ADDRESS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
        NFT_DRIVER_ID: '1',
        NFT_DRIVER_LOGIC: '0xa6bD78d98720E2eA4B3E2887be7bA212C3aC5977',
        NFT_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        IMMUTABLE_SPLITS_DRIVER: '0xC3C1955bb50AdA4dC8a55aBC6d4d2a39242685c1',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0xf5573880ECB9975E1645C8D18ef1A0393c685CC1',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0x0F9c6BCdE15dfFFD95Cfa8F9167b19B433af1abE',
        REPO_DRIVER_ANYAPI_JOB_ID: '9af746c7cfbc415c9737b239df9a30ab',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '150000000000000000',
        REPO_DRIVER_LOGIC: '0x7A9a2a29B8d98922Ea2E70c73B123e36C95d1515',
        REPO_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
      },
      // Goerli
      5: {
        CHAIN: 'goerli',
        DEPLOYMENT_TIME: '2023-07-15T10:34:39Z',
        COMMIT_HASH: 'afeba55f70a968ded7c0797a4211faa856e28fa0',
        WALLET: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        DETERMINISTIC_DEPLOYER: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
        CREATE3_FACTORY: '0x6aa3d87e99286946161dca02b97c5806fc5ed46f',
        DRIPS_DEPLOYER_SALT: 'DripsDeployerTest1',
        DRIPS_DEPLOYER: '0xa6030dD9D31FA2333Ee9f7feaCa6FB23c42a1d96',
        DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_LOGIC: '0xf103BDDB82B6177e5fE53c50351E33F4f3df955B',
        DRIPS_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
        ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
        ADDRESS_DRIVER_ID: '0',
        ADDRESS_DRIVER_LOGIC: '0x298F37fFd4B31d216B8954968cEe7EC5273CB891',
        ADDRESS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
        NFT_DRIVER_ID: '1',
        NFT_DRIVER_LOGIC: '0xa6bD78d98720E2eA4B3E2887be7bA212C3aC5977',
        NFT_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        IMMUTABLE_SPLITS_DRIVER: '0xC3C1955bb50AdA4dC8a55aBC6d4d2a39242685c1',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0xf5573880ECB9975E1645C8D18ef1A0393c685CC1',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0x7ecFBD6CB2D3927Aa68B5F2f477737172F11190a',
        REPO_DRIVER_ANYAPI_JOB_ID: '9af746c7cfbc415c9737b239df9a30ab',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '50000000000000000',
        REPO_DRIVER_LOGIC: '0x7A9a2a29B8d98922Ea2E70c73B123e36C95d1515',
        REPO_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
      },
      // Polygon Amoy
      80002: {
        CHAIN: 'amoy',
        DEPLOYMENT_TIME: '2024-04-19T16:33:32+00:00',
        COMMIT_HASH: '8f327ad07dee6ef3487a86d29a63b6e5ec0bd0b1',
        WALLET: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        DETERMINISTIC_DEPLOYER: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
        CREATE3_FACTORY: '0x6aa3d87e99286946161dca02b97c5806fc5ed46f',
        DRIPS_DEPLOYER_SALT: 'DripsDeployerTest2',
        DRIPS_DEPLOYER: '0xc1b65B81964B3C75876E71119C11e1e8e69949C7',
        DRIPS: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_LOGIC: '0x6483776ad2b3208c79AbA7A77193409730DDEc60',
        DRIPS_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        CALLER: '0x5C7c5AA20b15e13229771CB7De36Fe1F54238372',
        ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
        ADDRESS_DRIVER_ID: '0',
        ADDRESS_DRIVER_LOGIC: '0x6A29959d0926617663B0A44990A7d5931081CDB9',
        ADDRESS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        NFT_DRIVER: '0xDafd9Ab96E62941808caa115D184D30A200FA777',
        NFT_DRIVER_ID: '1',
        NFT_DRIVER_LOGIC: '0xa7EAa16246c80741616758C1A5991a0C3bbC6b17',
        NFT_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        IMMUTABLE_SPLITS_DRIVER: '0x65A48270e51A7aa901fD8fc42ab9cDddb50aff05',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x20d8e5F5D0a2243Ea25883ec06F4907e59C60Fa1',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0xA2af9b58B09223108f19D14d2A751d6bcad346F8',
        REPO_DRIVER_ANYAPI_JOB_ID: '00000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '10000000000000000',
        REPO_DRIVER_LOGIC: '0x7C6cCB07A4Cc03e3873E8CD1E7f3633a11f6AcF7',
        REPO_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
      },
      // Optimism Sepolia
      11155420: {
        CHAIN: 'optimism-sepolia',
        DEPLOYMENT_TIME: '2024-04-19T17:32:23+00:00',
        COMMIT_HASH: '8f327ad07dee6ef3487a86d29a63b6e5ec0bd0b1',
        WALLET: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        DETERMINISTIC_DEPLOYER: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
        CREATE3_FACTORY: '0x6aa3d87e99286946161dca02b97c5806fc5ed46f',
        DRIPS_DEPLOYER_SALT: 'DripsDeployerTest1',
        DRIPS_DEPLOYER: '0xa6030dD9D31FA2333Ee9f7feaCa6FB23c42a1d96',
        DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
        DRIPS_CYCLE_SECONDS: '604800',
        DRIPS_LOGIC: '0xf103BDDB82B6177e5fE53c50351E33F4f3df955B',
        DRIPS_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
        ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
        ADDRESS_DRIVER_ID: '0',
        ADDRESS_DRIVER_LOGIC: '0x298F37fFd4B31d216B8954968cEe7EC5273CB891',
        ADDRESS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
        NFT_DRIVER_ID: '1',
        NFT_DRIVER_LOGIC: '0xa6bD78d98720E2eA4B3E2887be7bA212C3aC5977',
        NFT_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        IMMUTABLE_SPLITS_DRIVER: '0xC3C1955bb50AdA4dC8a55aBC6d4d2a39242685c1',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0xf5573880ECB9975E1645C8D18ef1A0393c685CC1',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0xc553E957490f4E076c1724C78997923fd20890f6',
        REPO_DRIVER_ANYAPI_JOB_ID: '00000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '10000000000000000',
        REPO_DRIVER_LOGIC: '0x7A9a2a29B8d98922Ea2E70c73B123e36C95d1515',
        REPO_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
      },
      // Base Sepolia
      84532: {
        CHAIN: 'base-sepolia',
        DEPLOYMENT_TIME: '2024-05-07T09:00:50+00:00',
        COMMIT_HASH: '3f703b13912854a400236b3e4868e700702a2731',
        WALLET: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        DETERMINISTIC_DEPLOYER: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
        CREATE3_FACTORY: '0x6aa3d87e99286946161dca02b97c5806fc5ed46f',
        DRIPS_DEPLOYER_SALT: 'DripsDeployerTest2',
        DRIPS_DEPLOYER: '0xc1b65B81964B3C75876E71119C11e1e8e69949C7',
        DRIPS: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
        DRIPS_CYCLE_SECONDS: '604800 [6.048e5]',
        DRIPS_LOGIC: '0x6483776ad2b3208c79AbA7A77193409730DDEc60',
        DRIPS_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        CALLER: '0x5C7c5AA20b15e13229771CB7De36Fe1F54238372',
        ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
        ADDRESS_DRIVER_ID: '0',
        ADDRESS_DRIVER_LOGIC: '0x6A29959d0926617663B0A44990A7d5931081CDB9',
        ADDRESS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        NFT_DRIVER: '0xDafd9Ab96E62941808caa115D184D30A200FA777',
        NFT_DRIVER_ID: '1',
        NFT_DRIVER_LOGIC: '0xa7EAa16246c80741616758C1A5991a0C3bbC6b17',
        NFT_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        IMMUTABLE_SPLITS_DRIVER: '0x65A48270e51A7aa901fD8fc42ab9cDddb50aff05',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '0x20d8e5F5D0a2243Ea25883ec06F4907e59C60Fa1',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
        REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
        REPO_DRIVER_ID: '3',
        REPO_DRIVER_ANYAPI_OPERATOR: '0xA2af9b58B09223108f19D14d2A751d6bcad346F8',
        REPO_DRIVER_ANYAPI_JOB_ID: '00000000000000000000000000000000',
        REPO_DRIVER_ANYAPI_DEFAULT_FEE: '10000000000000000 [1e16]',
        REPO_DRIVER_LOGIC: '0x7C6cCB07A4Cc03e3873E8CD1E7f3633a11f6AcF7',
        REPO_DRIVER_ADMIN: '0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d',
      },
    } as const);

/**
 * Get the networkConfig for the current network.
 * @returns The networkConfig for the current network.
 */
export function getNetworkConfig(chainId = get(wallet).network.chainId): NetworkConfig {
  const config = networkConfigs[chainId];
  assert(config, `No network config found for chainId ${chainId}`);

  return config;
}
