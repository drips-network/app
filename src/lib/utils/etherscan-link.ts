/**
 * Build an etherscan link to transaction details with a networkName and transaction hash.
 * @param networkName The network name for the network the transaction is on.
 * @param txHash The transaction hash to link to.
 * @returns The full link to the transaction's Etherscan detail page.
 */
export default function (networkName: string, txHash: string) {
  return `https://${networkName}.etherscan.io/tx/${txHash}`;
}
