import type { TokenInfo } from '@uniswap/token-lists';
import { ethers } from 'ethers';
import { z } from 'zod';
import type { CustomTokenInfoWrapper } from './tokens.store';
import assert from '$lib/utils/assert';

export function createCustomToken(customToken: TokenInfo) {
  const currentCustomTokenWrappers = readCustomTokensList();
  const newCustomTokenInfoWrapper: CustomTokenInfoWrapper = {
    source: 'custom',
    info: customToken,
    banned: false,
  };
  const newCustomTokens = [...currentCustomTokenWrappers, newCustomTokenInfoWrapper];

  writeCustomTokenList(newCustomTokens);

  return newCustomTokens;
}

export function updateCustomToken(address: string, newTokenInfoWrapper: CustomTokenInfoWrapper) {
  const customTokenWrappers = readCustomTokensList();

  const indexToUpdate = customTokenWrappers.findIndex(
    (t) => t.info.address.toLowerCase() === address.toLowerCase(),
  );

  assert(indexToUpdate !== -1, `Could not remove custom token with address '${address}': address not found`);

  customTokenWrappers.splice(indexToUpdate, 1, newTokenInfoWrapper);

  writeCustomTokenList(customTokenWrappers);
}

export function deleteCustomToken(customTokenWrapper: CustomTokenInfoWrapper) {
  const customTokenWrappers = readCustomTokensList();
  const indexToRemove = customTokenWrappers.findIndex(
    (t) => t.info.address.toLowerCase() === customTokenWrapper.info.address.toLowerCase(),
  );

  assert(
    indexToRemove !== -1,
    `Could not remove custom token with address ${customTokenWrapper.info.address}: Not found`,
  );

  customTokenWrappers.splice(indexToRemove, 1);

  writeCustomTokenList(customTokenWrappers);
}

export function readCustomTokensList(): CustomTokenInfoWrapper[] {
  const stored = localStorage.getItem('custom-tokens');

  if (!stored) return [];

  const tokenListValidator = z.array(
    z.object({
      source: z.literal('custom'),
      banned: z.boolean(),
      info: z.object({
        chainId: z.number(),
        address: z
          .string()
          .refine((val) => ethers.utils.isAddress(val), 'Address must be a valid Ethereum address'),
        name: z.string(),
        decimals: z.number(),
        symbol: z.string(),
        logoURI: z.string().optional(),
      }),
    }),
  );

  return tokenListValidator.parse(JSON.parse(stored));
}

function writeCustomTokenList(list: CustomTokenInfoWrapper[]) {
  localStorage.setItem('custom-tokens', JSON.stringify(list));
}
