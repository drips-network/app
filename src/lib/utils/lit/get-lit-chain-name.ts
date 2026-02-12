/**
 * Maps ethers.js / network names to the chain names used in FUNDING.json and Lit Actions.
 */
export default function getLitChainName(networkName: string): string {
  switch (networkName) {
    case 'homestead':
      return 'ethereum';
    case 'base-sepolia':
      return 'baseSepolia';
    case 'optimism-sepolia':
      return 'optimismSepolia';
    default:
      return networkName;
  }
}
