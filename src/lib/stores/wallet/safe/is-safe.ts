const GNOSIS_API_SAFES_BASE: { [chainId: number]: string } = {
  11155111: 'https://safe-transaction-sepolia.safe.global/',
  1: 'https://safe-transaction-mainnet.safe.global/',
};

export async function isSafe(chainId: number, address: string) {
  const apiBase = GNOSIS_API_SAFES_BASE[chainId];
  if (!apiBase) return false;

  const res = await fetch(`${GNOSIS_API_SAFES_BASE[chainId]}/api/v1/safes/${address}`);

  return res.status === 200;
}
