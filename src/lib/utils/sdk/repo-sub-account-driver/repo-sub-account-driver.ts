import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import {
  repoSubAccountDriverAbi,
  type RepoSubAccountDriverAbi,
} from './repo-sub-account-driver-abi';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import type { ContractTransaction } from 'ethers';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import assert from '$lib/utils/assert';
import unwrapEthersResult from '../utils/unwrap-ethers-result';
import type { UnwrappedEthersResult } from '../sdk-types';
import network from '$lib/stores/wallet/network';

export async function executeRepoSubAccountDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<RepoSubAccountDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoSubAccountDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<RepoSubAccountDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  assert(
    network.contracts.SUB_ACCOUNT_REPO_DRIVER,
    'Sub Account Repo Driver does not exist on this network',
  );

  const repoDriver = new Contract(
    network.contracts.SUB_ACCOUNT_REPO_DRIVER,
    repoSubAccountDriverAbi,
    provider,
  );

  return unwrapEthersResult(await repoDriver[func](...args));
}

export async function populateRepoSubAccountDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<RepoSubAccountDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<RepoSubAccountDriverAbi, functionName>,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<RepoSubAccountDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Sub Account Repo Driver contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  assert(
    network.contracts.SUB_ACCOUNT_REPO_DRIVER,
    'Sub Account Repo Driver does not exist on this network',
  );

  const repoDriver = new Contract(
    network.contracts.SUB_ACCOUNT_REPO_DRIVER,
    repoSubAccountDriverAbi,
    signer,
  );

  return txToSafeDripsTx(await repoDriver[func].populateTransaction(...args));
}
