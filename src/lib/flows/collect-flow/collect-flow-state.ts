import { newRestorer, type Restorer } from '$lib/utils/restorer';
import type { ContractReceipt } from 'ethers';
import type { SplitsEntry } from 'radicle-drips';
import { writable } from 'svelte/store';

type Restorable = {
  squeezeEnabled: boolean;
  selectedSqueezeSenderItems: string[];
};

export interface CollectFlowState {
  tokenAddress?: string;
  balances?: {
    splittable: bigint;
    collectable: bigint;
    receivable: bigint;
  };
  /** TOTAL_SPLITS_WEIGHT minus sum of all splits receivers. */
  splitsConfig?: SplitsEntry[];
  ownSplitsWeight?: bigint;
  currentDripsCycle?: {
    start: Date;
    durationMillis: number;
  };
  amountCollected?: bigint;
  squeezeEnabled?: boolean;
  receipt?: ContractReceipt;
  restorer: Restorer<Restorable>;
}

export default (tokenAddress?: string) =>
  writable<CollectFlowState>({
    tokenAddress,
    restorer: newRestorer<Restorable>({ squeezeEnabled: false, selectedSqueezeSenderItems: [] }),
  });
