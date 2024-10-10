import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import { nftDriverAbi, type NftDriverAbi } from './nft-driver-abi';
import type { TransactionResponse } from 'ethers';
import type { ContractTransaction } from 'ethers';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import assert from '$lib/utils/assert';
import unwrapEthersResult from '../utils/unwrap-ethers-result';
import type { UnwrappedEthersResult } from '../sdk-types';
import network from '$lib/stores/wallet/network';

export async function executeNftDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<NftDriverAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<NftDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const nftDriver = new Contract(network.contracts.NFT_DRIVER, nftDriverAbi, provider);

  return unwrapEthersResult(await nftDriver[func](...args));
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

  const nftDriver = new Contract(network.contracts.NFT_DRIVER, nftDriverAbi, signer);

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

  const nftDriver = new Contract(network.contracts.NFT_DRIVER, nftDriverAbi, signer);

  return txToSafeDripsTx(await nftDriver[func].populateTransaction(...args));
}
