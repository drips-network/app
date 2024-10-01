import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import type { ContractTransaction } from 'ethers';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import assert from '$lib/utils/assert';
import {
  nativeTokenUnwrapperAbi,
  type NativeTokenUnwrapperAbi,
} from './native-token-unwrapper-abi';
import network from '$lib/stores/wallet/network';

export async function populateNativeTokenUnwrapperWriteTx<
  functionName extends ExtractAbiFunctionNames<NativeTokenUnwrapperAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NativeTokenUnwrapperAbi, functionName>,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<NativeTokenUnwrapperAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Native Token Unwrapper contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const nativeTokenUnwrapperAddress = network.contracts.NATIVE_TOKEN_UNWRAPPER;
  assert(nativeTokenUnwrapperAddress, 'Native Token Unwrapper address is missing.');

  const nativeTokenUnwrapper = new Contract(
    nativeTokenUnwrapperAddress,
    nativeTokenUnwrapperAbi,
    signer,
  );

  return txToSafeDripsTx(await nativeTokenUnwrapper[func].populateTransaction(...args));
}
