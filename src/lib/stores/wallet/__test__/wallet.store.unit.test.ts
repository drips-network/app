/* eslint-disable @typescript-eslint/no-explicit-any */
import { get } from 'svelte/store';
import wallet from '../wallet.store';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$app/environment', () => ({
  browser: true,
}));

describe('wallet store', () => {
  it('is not connected to anything after being created', () => {
    expect(get(wallet).connected).toBe(false);
  });

  it.todo('connects to wallet');

  it.todo('restores a connection if a cached provider is available');
});
