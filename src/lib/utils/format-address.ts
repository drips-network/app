/**
 * Formats an Ethereum address to a human-friendly format showing the first
 * and last four characters.
 * @param address The address to format.
 * @returns The formatted address.
 */
export default function formatAddress(address: string) {
  return `${address.substring(0, 4)}–${address.slice(-4)}`;
}
