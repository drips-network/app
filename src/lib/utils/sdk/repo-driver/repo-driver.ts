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

const { provider, signer } = get(wallet);
const repoDriverAddress = getNetworkConfig().REPO_DRIVER;

const repoDriverContractRead = new Contract(repoDriverAddress, repoDriverAbi, provider);
const repoDriverContractWrite = new Contract(repoDriverAddress, repoDriverAbi, signer);

export async function repoDriverRead<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  return repoDriverContractRead[config.functionName](...config.args);
}

export async function repoDriverWrite<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  assert(signer);

  return repoDriverContractWrite[config.functionName](...config.args);
}
