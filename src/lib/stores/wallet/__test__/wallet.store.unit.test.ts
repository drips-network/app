/* eslint-disable @typescript-eslint/no-explicit-any */
import { get } from 'svelte/store';
import wallet from '../wallet.store';
import { MockProvider } from '@rsksmart/mock-web3-provider';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$app/environment', () => ({
  browser: true,
}));

const TEST_ADDRESS = '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D';

const mockProvider = new MockProvider({
  address: TEST_ADDRESS,
  privateKey: 'de926db3012af759b4f24b5a51ef6afa397f04670f634aa4f48d4480417007f3',
  networkVersion: 5,
});

let cachedProvider = false;
vi.mock('web3modal', () => ({
  default: vi.fn().mockImplementation(() => ({
    cachedProvider: cachedProvider ? 'injected' : undefined,
    connect: vi.fn(() => mockProvider),
    clearCachedProvider: () => undefined,
  })),
}));

afterEach(() => {
  // Clear the store entirely
  if (get(wallet)) wallet.disconnect();
  cachedProvider = false;
});

describe('wallet store', () => {
  it('is not connected to anything after being created', () => {
    expect(get(wallet).connected).toBe(false);
  });

  it('is still disconnected after being initialized with no cached provider', async () => {
    await wallet.initialize();

    expect(get(wallet).connected).toBe(false);
  });

  it.todo('connects to wallet');

  it.todo('restores a connection if a cached provider is available');

  it('clears on disconnect', () => {
    // disconnect is called in afterEach
    expect(get(wallet).address).toBe(undefined);
    expect(get(wallet).connected).toBe(false);
  });
});
