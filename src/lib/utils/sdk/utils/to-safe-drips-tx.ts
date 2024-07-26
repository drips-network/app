import type { ContractTransaction } from 'ethers';

// TODO: this was copied from the SDK. Check if it's still needed.
export default function toSafeDripsTx(tx: ContractTransaction): ContractTransaction {
  if (!tx.value) {
    tx.value = 0n;
  }

  return tx;
}
