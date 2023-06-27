import { writable } from 'svelte/store';

const mockProvider = vi.fn(() => ({
  getSigner: vi.fn(() => mockSigner),
}));

const mockSigner = {
  getAddress: vi.fn(() => '0x0000'),
};

const mockWalletStoreState = writable({
  connected: true,
  address: '0x0000',
  dripsUserId: '1234',
  provider: mockProvider,
  signer: mockSigner,
  network: {
    chainId: 5,
    name: 'sepolia',
  },
});

export default {
  subscribe: mockWalletStoreState.subscribe,
  initialize: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockSetSubscribeValue: (value: any): void => mockWalletStoreState.set(value),
};
