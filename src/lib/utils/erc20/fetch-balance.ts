import { ethers } from 'ethers';
import erc20Abi from './erc20.abi.json';
import type { BrowserProvider, JsonRpcProvider } from 'ethers';

/**
 * Fetch the current balance of a given ERC-20 token at `tokenAddress`.
 * @param tokenAddress The contract address of the ERC-20 token.
 * @param address The wallet address to check the balance of.
 * @param provider The provider to use for the lookup.
 * @returns The current ERC-20 token balance as bigint.
 */
export default async function (
  tokenAddress: string,
  address: string,
  provider: BrowserProvider | JsonRpcProvider,
): Promise<bigint> {
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  return (await contract.balanceOf(address)).toBigInt();
}
