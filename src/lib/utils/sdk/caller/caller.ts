import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import { callerAbi, type CallerAbi } from './caller-abi';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import type { ContractTransaction } from 'ethers';
import assert from '$lib/utils/assert';
import network from '$lib/stores/wallet/network';

export async function populateCallerWriteTx<
  functionName extends ExtractAbiFunctionNames<CallerAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<CallerAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<CallerAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Caller contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const caller = new Contract(network.contracts.CALLER, callerAbi, signer);

  return txToSafeDripsTx(await caller[func].populateTransaction(...args));
}
