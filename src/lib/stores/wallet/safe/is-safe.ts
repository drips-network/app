import { isSupportedChainId, type ValueForEachSupportedChain } from '../network';
import assert from '$lib/utils/assert';

const GNOSIS_API_SAFES_BASE: ValueForEachSupportedChain<string | null> = {
  1: 'https://safe-transaction-mainnet.safe.global/',
  80002: null,
  11155420: null,
  11155111: 'https://safe-transaction-sepolia.safe.global/',
};

export async function isSafe(chainId: number, address: string) {
  assert(isSupportedChainId(chainId), 'Unsupported chain id');

  const apiBase = GNOSIS_API_SAFES_BASE[chainId];
  if (!apiBase) return false;

  const res = await fetch(`${GNOSIS_API_SAFES_BASE[chainId]}/api/v1/safes/${address}`);

  return res.status === 200;
}
