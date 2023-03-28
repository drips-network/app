const GNOSIS_API_SAFES_BASE: { [chainId: number]: string } = {
  5: 'https://safe-transaction-goerli.safe.global/',
  1: 'https://safe-transaction-mainnet.safe.global/',
  137: 'https://safe-transaction-polygon.safe.global/',
  10: 'https://safe-transaction-optimism.safe.global/',
};

export async function isSafe(chainId: number, address: string) {
  const res = await fetch(`${GNOSIS_API_SAFES_BASE[chainId]}/api/v1/safes/${address}`);

  return res.status === 200;
}
