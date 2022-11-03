import { ethers } from 'ethers';
import erc20Abi from './erc20.abi.json';

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
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
): Promise<bigint> {
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  return (await contract.balanceOf(address)).toBigInt();
}
