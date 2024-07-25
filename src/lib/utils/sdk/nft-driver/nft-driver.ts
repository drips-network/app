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
import { nftDriverAbi, type NftDriverAbi } from './nft-driver-abi';
import type { TransactionResponse } from 'ethers';

const { provider, signer } = get(wallet);
const nftDriverAddress = getNetworkConfig().NFT_DRIVER;

const nftDriverContractRead = new Contract(nftDriverAddress, nftDriverAbi, provider);
const nftDriverContractWrite = new Contract(nftDriverAddress, nftDriverAbi, signer);

export async function nftDriverRead<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NftDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<NftDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  return nftDriverContractRead[config.functionName](...config.args);
}

export async function nftDriverWrite<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NftDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<NftDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<TransactionResponse> {
  assert(signer, `'${config.functionName}' requires a signer but it's missing.`);

  return nftDriverContractWrite[config.functionName](...config.args);
}
