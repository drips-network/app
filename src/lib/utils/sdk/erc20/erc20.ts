import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract, type ContractTransaction } from 'ethers';
import { get } from 'svelte/store';
import { erc20Abi } from 'abitype/abis';
import type { OxString, UnwrappedEthersResult } from '../sdk-types';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import unwrapEthersResult from '../utils/unwrap-ethers-result';

type Erc20Abi = typeof erc20Abi;

export async function executeErc20ReadMethod<
  functionName extends ExtractAbiFunctionNames<Erc20Abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  token: OxString;
  functionName: functionName | ExtractAbiFunctionNames<Erc20Abi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { token, functionName: func, args } = config;

  const erc20 = new Contract(token, erc20Abi, provider);

  return unwrapEthersResult(await erc20[func](...args));
}

export function getAddressDriverAllowance(token: OxString) {
  const signer = get(wallet).signer?.address;
  assert(signer, 'ERC20 contract call requires a signer but it is missing.');

  return executeErc20ReadMethod({
    token,
    functionName: 'allowance',
    args: [signer as OxString, getNetworkConfig().ADDRESS_DRIVER as OxString],
  });
}

export async function populateErc20WriteTx<
  functionName extends ExtractAbiFunctionNames<Erc20Abi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  token: OxString;
  functionName: functionName | ExtractAbiFunctionNames<Erc20Abi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'ERC20 contract call requires a signer but it is missing.');

  const { token, functionName: func, args } = config;

  const erc20 = new Contract(token, erc20Abi, signer);

  return txToSafeDripsTx(await erc20[func].populateTransaction(...args));
}
