import { ethers } from 'ethers';
import { z } from 'zod';
import erc20Abi from './erc20.abi.json';

/**
 * Fetches the name, symbol and decimals of any ERC-20 token contract, if provided.
 * @param tokenAddress The address of the ERC-20 token contract.
 * @param provider The provider to use for the fetch.
 * @throw An error if there is no properly-implemented ERC-20 contract at the given address.
 */
export default async (
  tokenAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
) => {
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();

  const expectedSchema = z.object({
    name: z.string().optional(),
    symbol: z.string(),
    decimals: z.number(),
  });

  return expectedSchema.parse({
    name,
    symbol,
    decimals,
  });
};
