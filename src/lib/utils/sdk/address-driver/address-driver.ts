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
import { erc20 } from '../erc20/erc20';
import type { OxString } from '../sdk-types';
import unreachable from '$lib/utils/unreachable';

export async function addressDriverRead<
  functionName extends ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<AddressDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;
  const addressDriverContractRead = new Contract(addressDriverAddress, addressDriverAbi, provider);

  return addressDriverContractRead[config.functionName](...config.args);
}

export async function getAllowance(tokenAddress: OxString): Promise<bigint> {
  const owner = get(wallet).signer?.address as OxString;
  assert(owner, `'getAllowance' requires a signer but none was provided.`);

  const spender = getNetworkConfig().ADDRESS_DRIVER as OxString;

  return (
    await erc20({
      tokenAddress,
      functionName: 'allowance',
      args: [owner, spender],
    })
  )[0];
}
