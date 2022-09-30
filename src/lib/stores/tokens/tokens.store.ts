import uniswapTokenList from '@uniswap/default-token-list';
import type { TokenInfo } from '@uniswap/token-lists';
import { get, writable } from 'svelte/store';
import * as storedTokens from './stored-custom-tokens';
import assert from '$lib/utils/assert';
import { Utils } from 'radicle-drips';

interface DefaultTokenInfoWrapper {
  info: TokenInfo;
  source: 'default';
}

export interface CustomTokenInfoWrapper {
  info: TokenInfo;
  source: 'custom';
  banned: boolean;
}

export type TokenInfoWrapper = DefaultTokenInfoWrapper | CustomTokenInfoWrapper;

export default (() => {
  let chainId: number | undefined;
  const tokenList = writable<TokenInfoWrapper[] | undefined>();

  function connect(toChainId: number) {
    chainId = toChainId;

    const customTokens = storedTokens
      .readCustomTokensList()
      .filter((t) => t.info.chainId === chainId);

    const defaultTokens: TokenInfoWrapper[] = uniswapTokenList.tokens
      .filter((t) => t.chainId === chainId)
      .map((t) => ({
        info: t,
        source: 'default',
      }));

    tokenList.set([...defaultTokens, ...customTokens]);
  }

  function disconnect() {
    chainId = undefined;
    tokenList.set(undefined);
  }

  function getByAddress(address: string, chain = chainId): TokenInfoWrapper | undefined {
    const tokens = get(tokenList);
    assert(tokens, 'Store must be connected first');

    return tokens.find((t) => {
      const addressMatch = t.info.address.toLowerCase() === address.toLowerCase();
      const chainIdMatch = t.info.chainId === chain;

      return addressMatch && chainIdMatch;
    });
  }

  function getBySymbol(symbol: string, chain = chainId): TokenInfoWrapper | undefined {
    const tokens = get(tokenList);
    assert(tokens, 'Store must be connected first');

    return tokens.find((t) => {
      const symbolMatch = t.info.symbol.toLowerCase() === symbol.toLowerCase();
      const chainIdMatch = t.info.chainId === chain;

      return symbolMatch && chainIdMatch;
    });
  }

  function getByDripsAssetId(
    dripsAssetId: string | bigint,
    chain = chainId,
  ): TokenInfoWrapper | undefined {
    const tokens = get(tokenList);
    assert(tokens, 'Store must be connected first');

    return tokens.find((t) => {
      const assetAddress = Utils.Asset.getAddressFromId(dripsAssetId);

      const addressMatch = t.info.address.toLowerCase() === assetAddress.toLowerCase();
      const chainIdMatch = t.info.chainId === chain;

      return addressMatch && chainIdMatch;
    });
  }

  function addCustomToken(tokenInfo: TokenInfo) {
    const tokens = get(tokenList);
    assert(tokens && chainId, 'Store must be connected first');

    assert(
      !tokens.find((t) => t.info.address === tokenInfo.address),
      'This custom token already exists',
    );

    storedTokens.createCustomToken(tokenInfo);

    if (tokenInfo.chainId !== chainId) return;

    tokenList.update(() => [
      ...tokens,
      {
        info: tokenInfo,
        source: 'custom',
        banned: false,
      },
    ]);
  }

  function removeCustomToken(address: string, chainId: number) {
    const tokens = get(tokenList);
    assert(tokens && chainId, 'Store must be connected first');

    const token = getByAddress(address, chainId);
    assert(
      token && token.source === 'custom',
      `Unable to find custom token with address ${address} on chain ${chainId}`,
    );

    storedTokens.deleteCustomToken(token);

    tokens.splice(tokens.indexOf(token));
    tokenList.set(tokens);
  }

  function setCustomTokenBanStatus(address: string, chainId: number, banned: boolean) {
    const tokens = get(tokenList);
    assert(tokens && chainId, 'Store must be connected first');

    const token = getByAddress(address, chainId);
    assert(
      token && token.source === 'custom',
      `Unable to find custom token with address ${address}`,
    );

    const newValue = {
      ...token,
      banned,
    };

    storedTokens.updateCustomToken(address, newValue);

    tokens.splice(tokens.indexOf(token), 1, newValue);
    tokenList.set(tokens);
  }

  return {
    subscribe: tokenList.subscribe,
    connect,
    disconnect,
    getByAddress,
    getBySymbol,
    getByDripsAssetId,
    addCustomToken,
    removeCustomToken,
    setCustomTokenBanStatus,
  };
})();
