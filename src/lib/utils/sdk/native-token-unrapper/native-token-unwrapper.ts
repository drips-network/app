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
import type { ContractTransaction } from 'ethers';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import assert from '$lib/utils/assert';
import {
  nativeTokenUnwrapperAbi,
  type NativeTokenUnwrapperAbi,
} from './native-token-unwrapper-abi';

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

  const nativeTokenUnwrapperAddress = getNetworkConfig().NATIVE_TOKEN_UNWRAPPER;
  const nativeTokenUnwrapper = new Contract(
    nativeTokenUnwrapperAddress,
    nativeTokenUnwrapperAbi,
    signer,
  );

  return txToSafeDripsTx(await nativeTokenUnwrapper[func].populateTransaction(...args));
}
