import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { repoDriverAbi, type RepoDriverAbi } from './repo-driver-abi';
import { Contract } from 'ethers';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import { get } from 'svelte/store';
import type { ContractTransaction } from 'ethers';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import assert from '$lib/utils/assert';
import unwrapEthersResult from '../utils/unwrap-ethers-result';
import type { UnwrappedEthersResult } from '../sdk-types';

export async function executeRepoDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;
  const repoDriver = new Contract(repoDriverAddress, repoDriverAbi, provider);

  return unwrapEthersResult(await repoDriver[func](...args));
}

export async function populateRepoDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Repo Driver contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;
  const repoDriver = new Contract(repoDriverAddress, repoDriverAbi, signer);

  return txToSafeDripsTx(await repoDriver[func].populateTransaction(...args));
}
