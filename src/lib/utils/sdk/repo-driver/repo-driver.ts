import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { repoDriverAbi, type RepoDriverAbi } from './repo-driver-abi';
import { Contract } from 'ethers';
import { getNetworkConfig } from '$lib/utils/get-drips-clients';
import { get } from 'svelte/store';
import type { ContractTransaction } from 'ethers';

export async function executeRepoDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;
  const repoDriver = new Contract(repoDriverAddress, repoDriverAbi, provider);

  return repoDriver[func](...args);
}

export async function populateRepoDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;
  const repoDriver = new Contract(repoDriverAddress, repoDriverAbi, provider);

  return repoDriver[func].populateTransaction(...args);
}
