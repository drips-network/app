import type { ContractReceipt } from 'ethers';
import type { SplitsEntry } from 'radicle-drips';
import { writable } from 'svelte/store';

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
}

export default writable<CollectFlowState>({});
