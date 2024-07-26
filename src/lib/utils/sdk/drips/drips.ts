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
import { dripsAbi, type DripsAbi } from './drips-abi';
import safeDripsTx from '../utils/safe-drips-tx';
import type { OxString, SplitsReceiver } from '../sdk-types';

export async function dripsRead<
  functionName extends ExtractAbiFunctionNames<DripsAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<DripsAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<DripsAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const dripsAddress = getNetworkConfig().DRIPS;
  const drips = new Contract(dripsAddress, dripsAbi, provider);

  return drips[func](...args);
}

export async function populateSplitTx(
  accountId: string,
  erc20: OxString,
  currentReceivers: SplitsReceiver[],
) {
  const { signer } = get(wallet);
  assert(signer, 'Drips contract call requires a signer but it is missing.');

  const dripsAddress = getNetworkConfig().DRIPS;
  const drips = new Contract(dripsAddress, dripsAbi, signer);

  return safeDripsTx(await drips.approve.populateTransaction(accountId, erc20, currentReceivers));
}
