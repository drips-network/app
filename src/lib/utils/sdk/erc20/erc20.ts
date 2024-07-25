import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import { erc20Abi } from 'abitype/abis';
import type { OxString } from '../sdk-types';
import unreachable from '$lib/utils/unreachable';
import { getNetworkConfig } from '$lib/utils/get-drips-clients';

type Erc20Abi = typeof erc20Abi;

export async function erc20<
  functionName extends ExtractAbiFunctionNames<Erc20Abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  tokenAddress: OxString;
  functionName: functionName | ExtractAbiFunctionNames<Erc20Abi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const { tokenAddress, functionName: func, args } = config;
  const erc20Contract = new Contract(tokenAddress, erc20Abi, provider);

  return erc20Contract[func](...args);
}

export default function getAddressDriverAllowance(tokenAddress: OxString) {
  const signer = (get(wallet).signer?.address as OxString) || unreachable();

  return erc20({
    tokenAddress,
    functionName: 'allowance',
    args: [signer, getNetworkConfig().ADDRESS_DRIVER as OxString],
  });
}
