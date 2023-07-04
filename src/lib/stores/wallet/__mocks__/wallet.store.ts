import { writable } from 'svelte/store';

const mockProvider = vi.fn(() => ({
  getSigner: vi.fn(() => mockSigner),
  getNetwork: vi.fn(() => ({
    chainId: 5,
    name: 'goerli',
  })),
}));

const mockSigner = {
  getAddress: vi.fn(() => '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a'),
};

const mockWalletStoreState = writable({
  connected: true,
  address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
  dripsUserId: '1234',
  provider: mockProvider,
  signer: mockSigner,
  network: {
    chainId: 5,
    name: 'goerli',
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
