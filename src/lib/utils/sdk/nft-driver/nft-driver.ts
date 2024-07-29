import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import { get } from 'svelte/store';
import { nftDriverAbi, type NftDriverAbi } from './nft-driver-abi';
import type { TransactionResponse } from 'ethers';
import type { ContractTransaction } from 'ethers';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';

export async function executeNftDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NftDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<NftDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const nftDriverAddress = getNetworkConfig().NFT_DRIVER;
  const nftDriver = new Contract(nftDriverAddress, nftDriverAbi, provider);

  return nftDriver[func](...args);
}

export async function executeNftDriverWriteMethod<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NftDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<NftDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<TransactionResponse> {
  const { signer } = get(wallet);
  assert(signer, 'NFT Driver contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const nftDriverAddress = getNetworkConfig().NFT_DRIVER;
  const nftDriver = new Contract(nftDriverAddress, nftDriverAbi, signer);

  return nftDriver[func](...args);
}

export async function populateNftDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NftDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<NftDriverAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'NFT Driver contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const nftDriverAddress = getNetworkConfig().NFT_DRIVER;
  const nftDriver = new Contract(nftDriverAddress, nftDriverAbi, signer);

  return txToSafeDripsTx(await nftDriver[func].populateTransaction(...args));
}
