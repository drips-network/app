import { get } from 'svelte/store';
import tokens from '.';
import { DRIPS_DEFAULT_TOKEN_LIST } from './token-list';
import network from '../wallet/network';
import { toBigInt } from 'ethers';

vi.mock('$app/environment', () => ({
  browser: true,
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
});

export {};
