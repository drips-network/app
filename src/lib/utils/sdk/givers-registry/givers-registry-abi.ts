export const giversRegistryAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'accountId', type: 'uint256' }],
    name: 'giver',
    outputs: [{ internalType: 'address', name: 'giver_', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type GiversRegistryAbi = typeof giversRegistryAbi;
