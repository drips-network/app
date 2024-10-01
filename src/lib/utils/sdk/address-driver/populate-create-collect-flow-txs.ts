import { toBigInt, type ContractTransaction } from 'ethers';
import type { OxString, SplitsReceiver, SqueezeArgs } from '../sdk-types';
import { populateDripsWriteTx } from '../drips/drips';
import contractConstants from '../utils/contract-constants';
import { populateAddressDriverWriteTx } from './address-driver';
import { populateNativeTokenUnwrapperWriteTx } from '../native-token-unrapper/native-token-unwrapper';
import { get } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';
import network from '$lib/stores/wallet/network';
import assert from '$lib/utils/assert';

export type CollectFlowPayload = {
  accountId: string;
  tokenAddress: OxString;
  maxCycles: number;
  currentReceivers: SplitsReceiver[];
  transferToAddress: OxString;
  squeezeArgs?: SqueezeArgs[];
};

export default async function populateCreateCollectFlowTxs(
  payload: CollectFlowPayload,
  skipReceive: boolean = false,
  skipSplit: boolean = false,
  shouldAutoUnwrap: boolean = false,
): Promise<ContractTransaction[]> {
  const { accountId, tokenAddress, maxCycles, currentReceivers, transferToAddress, squeezeArgs } =
    payload;

  const flow: ContractTransaction[] = [];

  for (const args of squeezeArgs || []) {
    const squeezeTx = await populateDripsWriteTx({
      functionName: 'squeezeStreams',
      args: [
        toBigInt(accountId),
        tokenAddress,
        toBigInt(args.senderId),
        args.historyHash as OxString,
        args.streamsHistory,
      ],
    });

    flow.push(squeezeTx);
  }

  if (!skipReceive) {
    const receiveTx = await populateDripsWriteTx({
      functionName: 'receiveStreams',
      args: [toBigInt(accountId), tokenAddress, maxCycles],
    });

    flow.push(receiveTx);
  }

  if (!skipSplit) {
    if (currentReceivers.length > contractConstants.MAX_SPLITS_RECEIVERS) {
      throw new Error(
        `Too many receivers. Max allowed is ${contractConstants.MAX_SPLITS_RECEIVERS}.`,
      );
    }

    const splitTx = await populateDripsWriteTx({
      functionName: 'split',
      args: [
        toBigInt(accountId),
        tokenAddress,
        currentReceivers.map((r) => ({
          accountId: toBigInt(r.accountId),
          weight: r.weight,
        })),
      ],
    });

    flow.push(splitTx);
  }

  if (shouldAutoUnwrap) {
    const { address: userAddress } = get(walletStore);

    if (userAddress !== transferToAddress) {
      throw new Error('User address and transfer to address must match when auto unwrapping.');
    }

    const nativeTokenUnwrapperAddress = network.contracts.NATIVE_TOKEN_UNWRAPPER;
    assert(
      nativeTokenUnwrapperAddress,
      'Native token unwrapper address undefined, but auto unwrap enabled',
    );

    // Collect funds to the `NativeTokenUnwrapper` contract address.
    const collectTx = await populateAddressDriverWriteTx({
      functionName: 'collect',
      args: [tokenAddress, nativeTokenUnwrapperAddress as OxString],
    });

    // Unwrap the collected wrapped token to native and transfer it to user address.
    const unwrapTx = await populateNativeTokenUnwrapperWriteTx({
      functionName: 'unwrap',
      args: [userAddress],
    });

    flow.push(collectTx, unwrapTx); // Order matters.
  } else {
    const collectTx = await populateAddressDriverWriteTx({
      functionName: 'collect',
      args: [tokenAddress, transferToAddress],
    });

    flow.push(collectTx);
  }

  return flow;
}
