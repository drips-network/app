const MockProvider = vi.fn().mockImplementation(() => ({
  lookupAddress: vi.fn(() => 'test.ens'),
  getResolver: vi.fn(() => ({
    getAvatar: vi.fn(() => 'avatar.png'),
  })),
}));

export const provider = MockProvider();

export function getMainnetProvider() {
  return provider;
}
