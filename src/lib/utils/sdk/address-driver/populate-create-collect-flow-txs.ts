import { toBigInt, type ContractTransaction } from 'ethers';
import type { OxString, SplitsReceiver, SqueezeArgs } from '../sdk-types';
import { populateDripsWriteTx } from '../drips/drips';
import contractConstants from '../utils/contract-constants';
import { populateAddressDriverWriteTx } from './address-driver';

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

  const collectTx = await populateAddressDriverWriteTx({
    functionName: 'collect',
    args: [tokenAddress, transferToAddress],
  });

  flow.push(collectTx);

  return flow;
}
