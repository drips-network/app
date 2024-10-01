import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import { addressDriverAbi, type AddressDriverAbi } from './address-driver-abi';
import type { OxString, UnwrappedEthersResult } from '../sdk-types';
import { executeErc20ReadMethod } from '../erc20/erc20';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import type { ContractTransaction } from 'ethers';
import assert from '$lib/utils/assert';
import unwrapEthersResult from '../utils/unwrap-ethers-result';
import network from '$lib/stores/wallet/network';

export async function executeAddressDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<AddressDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const addressDriver = new Contract(network.contracts.ADDRESS_DRIVER, addressDriverAbi, provider);

  return unwrapEthersResult(await addressDriver[func](...args));
}

export async function populateAddressDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<AddressDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<AddressDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<AddressDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Address driver contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const addressDriver = new Contract(network.contracts.ADDRESS_DRIVER, addressDriverAbi, signer);

  return txToSafeDripsTx(await addressDriver[func].populateTransaction(...args));
}

export async function getAddressDriverAllowance(token: OxString): Promise<bigint> {
  const owner = get(wallet).signer?.address as OxString;
  assert(owner, 'ERC20 contract call requires a signer but it is missing.');

  const spender = network.contracts.ADDRESS_DRIVER as OxString;

  return executeErc20ReadMethod({
    token,
    functionName: 'allowance',
    args: [owner, spender],
  });
}
