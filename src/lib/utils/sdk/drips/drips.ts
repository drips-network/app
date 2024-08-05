import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import { get } from 'svelte/store';
import { dripsAbi, type DripsAbi } from './drips-abi';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import type { ContractTransaction } from 'ethers';
import assert from '$lib/utils/assert';
import unwrapEthersResult from '../utils/unwrap-ethers-result';
import type { UnwrappedEthersResult } from '../sdk-types';

export async function executeDripsReadMethod<
  functionName extends ExtractAbiFunctionNames<DripsAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<DripsAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<DripsAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const dripsAddress = getNetworkConfig().DRIPS;
  const drips = new Contract(dripsAddress, dripsAbi, provider);

  return unwrapEthersResult(await drips[func](...args));
}

export async function populateDripsWriteTx<
  functionName extends ExtractAbiFunctionNames<DripsAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<DripsAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<DripsAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Drips contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const dripsAddress = getNetworkConfig().DRIPS;
  const drips = new Contract(dripsAddress, dripsAbi, signer);

  return txToSafeDripsTx(await drips[func].populateTransaction(...args));
}
