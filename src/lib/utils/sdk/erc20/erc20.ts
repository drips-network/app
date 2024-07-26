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
import { getNetworkConfig } from '$lib/utils/get-drips-clients';
import safeDripsTx from '../utils/safe-drips-tx';

type Erc20Abi = typeof erc20Abi;

export async function erc20Read<
  functionName extends ExtractAbiFunctionNames<Erc20Abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  token: OxString;
  functionName: functionName | ExtractAbiFunctionNames<Erc20Abi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const { token, functionName: func, args } = config;

  const erc20 = new Contract(token, erc20Abi, provider);

  return erc20[func](...args);
}

export async function erc20Write<
  functionName extends ExtractAbiFunctionNames<Erc20Abi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  token: OxString;
  functionName: functionName | ExtractAbiFunctionNames<Erc20Abi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { signer } = get(wallet);
  assert(signer, 'ERC20 contract call requires a signer but it is missing.');

  const { token, functionName: func, args } = config;

  const erc20 = new Contract(token, erc20Abi, signer);

  return erc20[func](...args);
}

export function getAddressDriverAllowance(token: OxString) {
  const signer = get(wallet).signer?.address;
  assert(signer, 'ERC20 contract call requires a signer but it is missing.');

  return erc20Read({
    token,
    functionName: 'allowance',
    args: [signer as OxString, getNetworkConfig().ADDRESS_DRIVER as OxString],
  });
}

export async function populateApproveTx(token: OxString, spender: OxString, amount: bigint) {
  const { signer } = get(wallet);
  assert(signer, 'ERC20 contract call requires a signer but it is missing.');

  const erc20 = new Contract(token, erc20Abi, signer);

  return safeDripsTx(await erc20.approve.populateTransaction(spender, amount));
}
