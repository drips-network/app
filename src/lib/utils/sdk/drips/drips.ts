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

const { provider, signer } = get(wallet);
const dripsAddress = getNetworkConfig().DRIPS;
const dripsContractRead = new Contract(dripsAddress, dripsAbi, provider);
const dripsContractWrite = new Contract(dripsAddress, dripsAbi, signer);

export async function dripsRead<
  functionName extends ExtractAbiFunctionNames<DripsAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<DripsAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<DripsAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  return dripsContractRead[config.functionName](...config.args);
}

export async function populateSplitTx(
  accountId: string,
  erc20: OxString,
  currentReceivers: SplitsReceiver[],
) {
  const { signer } = get(wallet);

  assert(signer, `'populateSplitTx' requires a signer but it's missing.`);

  return safeDripsTx(
    await dripsContractWrite.approve.populateTransaction(accountId, erc20, currentReceivers),
  );
}
