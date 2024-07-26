import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { getNetworkConfig } from '$lib/utils/get-drips-clients';
import { get } from 'svelte/store';
import { addressDriverAbi, type AddressDriverAbi } from './address-driver-abi';
import type { OxString } from '../sdk-types';
import { erc20Read } from '../erc20/erc20';

export async function addressDriverRead<
  functionName extends ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<AddressDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;
  const addressDriver = new Contract(addressDriverAddress, addressDriverAbi, provider);

  return addressDriver[func](...args);
}

export async function getAddressDriverAllowance(token: OxString): Promise<bigint> {
  const owner = get(wallet).signer?.address as OxString;
  assert(owner, 'ERC20 contract call requires a signer but it is missing.');

  const spender = getNetworkConfig().ADDRESS_DRIVER as OxString;

  return (
    await erc20Read({
      token,
      functionName: 'allowance',
      args: [owner, spender],
    })
  )[0];
}
