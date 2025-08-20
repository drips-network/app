import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';

import unwrapEthersResult from '../utils/unwrap-ethers-result';
import type { UnwrappedEthersResult } from '../sdk-types';
import network from '$lib/stores/wallet/network';
import { giversRegistryAbi, type GiversRegistryAbi } from './givers-registry-abi';

export async function executeGiversRegistryReadMethod<
  functionName extends ExtractAbiFunctionNames<GiversRegistryAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<GiversRegistryAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<GiversRegistryAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const giversRegistryAddress = network.contracts.GIVERS_REGISTRY;
  if (!giversRegistryAddress)
    throw new Error('Current network does not have a GiversRegistry contract address');

  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const giversRegistry = new Contract(giversRegistryAddress, giversRegistryAbi, provider);

  return unwrapEthersResult(await giversRegistry[func](...args));
}

export async function giverAddressForAccount(accountId: string) {
  return executeGiversRegistryReadMethod({
    functionName: 'giver',
    args: [BigInt(accountId)],
  });
}
