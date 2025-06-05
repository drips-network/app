import wallet from '$lib/stores/wallet/wallet.store';
import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import { get } from 'svelte/store';
import { type CallerAbi, callerAbi } from './caller-abi';
import txToSafeDripsTx from '../utils/tx-to-safe-drips-tx';
import type { ContractTransaction } from 'ethers';
import assert from '$lib/utils/assert';
import network from '$lib/stores/wallet/network';
import type { UnwrappedEthersResult } from '../sdk-types';
import unwrapEthersResult from '../utils/unwrap-ethers-result';

export async function executeCallerReadMethod<
  functionName extends ExtractAbiFunctionNames<CallerAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<CallerAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<CallerAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>>
> {
  const { provider } = get(wallet);
  const { functionName: func, args } = config;

  const caller = new Contract(network.contracts.CALLER, callerAbi, provider);

  return unwrapEthersResult(await caller[func](...args));
}

export async function populateCallerWriteTx<
  functionName extends ExtractAbiFunctionNames<CallerAbi, 'nonpayable' | 'payable'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<CallerAbi, functionName>,
>(config: {
  functionName: functionName | ExtractAbiFunctionNames<CallerAbi, 'nonpayable' | 'payable'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<ContractTransaction> {
  const { signer } = get(wallet);
  assert(signer, 'Caller contract call requires a signer but it is missing.');

  const { functionName: func, args } = config;

  const caller = new Contract(network.contracts.CALLER, callerAbi, signer);

  return txToSafeDripsTx(await caller[func].populateTransaction(...args));
}

export async function getCallerNonce(address: string) {
  const nonce = await executeCallerReadMethod({
    functionName: 'nonce',
    args: [address as `0x${string}`],
  });

  return Number(nonce);
}

export const CallerERC2771Domain = {
  name: 'Caller',
  version: '1',
  chainId: network.chainId,
  verifyingContract: network.contracts.CALLER,
};

export const CallSignedERC2771Types = {
  CallSigned: [
    {
      name: 'sender',
      type: 'address',
    },
    {
      name: 'target',
      type: 'address',
    },
    {
      name: 'data',
      type: 'bytes',
    },
    {
      name: 'value',
      type: 'uint256',
    },
    {
      name: 'nonce',
      type: 'uint256',
    },
    {
      name: 'deadline',
      type: 'uint256',
    },
  ],
};
