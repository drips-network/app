import uniswapTokenList from '@uniswap/default-token-list';
import additionalTokens from './additional-tokens.json';

export const DRIPS_DEFAULT_TOKEN_LIST = [...uniswapTokenList.tokens, ...additionalTokens.tokens];
