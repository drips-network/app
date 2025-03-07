import { get } from 'svelte/store';
import tokens from '.';
import { DRIPS_DEFAULT_TOKEN_LIST } from './token-list';
import network from '../wallet/network';
import { toBigInt } from 'ethers';
import { createCustomToken, readCustomTokensList } from './stored-custom-tokens';

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
}));

afterEach(() => {
  window.localStorage.clear();
});

const TEST_CUSTOM_TOKEN_INFO = {
  chainId: 11155111,
  address: '0x1111111111111111111111111111111111111111',
  name: 'Foobar',
  decimals: 18,
  symbol: 'FOO',
};

describe('tokens store', () => {
  it('lists default tokens for chain after initialization', () => {
    vi.mocked(network).chainId = 1;
    tokens.init();

    expect(get(tokens)).toStrictEqual(
      DRIPS_DEFAULT_TOKEN_LIST.filter((t) => t.chainId === 1).map((t) => ({
        source: 'default',
        info: t,
      })),
    );
  });

  it('finds tokens by address, symbol or drips asset ID', () => {
    expect(tokens.getBySymbol('RAD')?.info.address).toBe(
      '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
    );
    expect(tokens.getByAddress('0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3')?.info.symbol).toBe(
      'RAD',
    );
    expect(
      tokens.getByDripsAssetId(toBigInt('0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3').toString())
        ?.info.address,
    ).toBe('0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3');
  });

  it('adds and removes custom tokens', () => {
    vi.mocked(network).chainId = 11155111;
    tokens.init();

    tokens.addCustomToken(TEST_CUSTOM_TOKEN_INFO);

    // Token on a different chain that should get filtered out
    tokens.addCustomToken({
      ...TEST_CUSTOM_TOKEN_INFO,
      address: '0x1111111111111111111111111111111111111112',
      chainId: 78,
    });

    expect(
      get(tokens)?.find((t) => t.info.address === TEST_CUSTOM_TOKEN_INFO.address),
    ).toBeTruthy();
    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toStrictEqual({
      source: 'custom',
      info: TEST_CUSTOM_TOKEN_INFO,
      banned: false,
    });

    expect(tokens.getByAddress('0x1111111111111111111111111111111111111112')).toBeFalsy();

    tokens.removeCustomToken(TEST_CUSTOM_TOKEN_INFO.address, TEST_CUSTOM_TOKEN_INFO.chainId);

    expect(get(tokens)?.find((t) => t.info.address === TEST_CUSTOM_TOKEN_INFO.address)).toBeFalsy();
    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toBeUndefined();
  });

  it('prevents adding the same custom token twice', () => {
    vi.mocked(network).chainId = 11155111;
    tokens.init();

    tokens.addCustomToken(TEST_CUSTOM_TOKEN_INFO);
    expect(() => tokens.addCustomToken(TEST_CUSTOM_TOKEN_INFO)).toThrow();
  });

  it('bans and unbans custom tokens', () => {
    vi.mocked(network).chainId = 11155111;
    tokens.init();

    tokens.addCustomToken(TEST_CUSTOM_TOKEN_INFO);

    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toStrictEqual({
      source: 'custom',
      info: TEST_CUSTOM_TOKEN_INFO,
      banned: false,
    });

    tokens.setCustomTokenBanStatus(
      TEST_CUSTOM_TOKEN_INFO.address,
      TEST_CUSTOM_TOKEN_INFO.chainId,
      true,
    );

    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toStrictEqual({
      source: 'custom',
      info: TEST_CUSTOM_TOKEN_INFO,
      banned: true,
    });

    tokens.setCustomTokenBanStatus(
      TEST_CUSTOM_TOKEN_INFO.address,
      TEST_CUSTOM_TOKEN_INFO.chainId,
      false,
    );

    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toStrictEqual({
      source: 'custom',
      info: TEST_CUSTOM_TOKEN_INFO,
      banned: false,
    });
  });

  it('restores custom tokens on the same chain from localstorage', () => {
    vi.mocked(network).chainId = 11155111;
    tokens.init();

    tokens.addCustomToken(TEST_CUSTOM_TOKEN_INFO);
    tokens.setCustomTokenBanStatus(
      TEST_CUSTOM_TOKEN_INFO.address,
      TEST_CUSTOM_TOKEN_INFO.chainId,
      true,
    );

    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toStrictEqual({
      source: 'custom',
      info: TEST_CUSTOM_TOKEN_INFO,
      banned: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(network).chainId = 1234 as any;
    tokens.init();

    expect(tokens.getByAddress(TEST_CUSTOM_TOKEN_INFO.address)).toBeUndefined();
  });

  it('deletes custom tokens that are part of the default chain list', () => {
    vi.mocked(network).chainId = 11155111;

    const wrappedEtherTokenInfo = {
      name: 'Wrapped Ether',
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      symbol: 'WETH',
      decimals: 18,
      chainId: 11155111,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    };

    const uniswapTokenInfo = {
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      decimals: 18,
      chainId: 11155111,
      logoURI: '',
    };

    const anotherTokenInfo = {
      name: 'Another Token',
      address: '0x7705ea2afD095d898f73023C30fC49490799A730',
      symbol: 'AT',
      decimals: 18,
      chainId: 11155111,
      logoURI: '',
    };

    createCustomToken(wrappedEtherTokenInfo);
    createCustomToken(uniswapTokenInfo);
    createCustomToken(anotherTokenInfo);

    const storedValueForWrappedEther = {
      source: 'custom',
      banned: false,
      info: wrappedEtherTokenInfo,
    };

    const storedValueForUniswap = {
      source: 'custom',
      banned: false,
      info: uniswapTokenInfo,
    };

    const storedValueForAnotherToken = {
      source: 'custom',
      banned: false,
      info: anotherTokenInfo,
    };

    expect(readCustomTokensList()).toContainEqual(storedValueForWrappedEther);
    expect(readCustomTokensList()).toContainEqual(storedValueForUniswap);
    expect(readCustomTokensList()).toContainEqual(storedValueForAnotherToken);

    tokens.init();

    expect(readCustomTokensList()).not.toContainEqual(storedValueForWrappedEther);
    expect(tokens.getByAddress(wrappedEtherTokenInfo.address)?.source).toBe('default');

    expect(readCustomTokensList()).not.toContainEqual(storedValueForUniswap);
    expect(tokens.getByAddress(uniswapTokenInfo.address)?.source).toBe('default');

    expect(readCustomTokensList()).toContainEqual(storedValueForAnotherToken);
    expect(tokens.getByAddress(anotherTokenInfo.address)?.source).toBe('custom');
  });
});

export {};
