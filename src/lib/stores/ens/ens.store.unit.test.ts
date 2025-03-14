import { MockProvider } from '@rsksmart/mock-web3-provider';
import { get } from 'svelte/store';
import ens from '.';
import walletStore from '../wallet/wallet.store';

vi.mock('$lib/stores/wallet/wallet.store');

vi.mock('@rsksmart/mock-web3-provider', () => ({
  MockProvider: vi.fn().mockImplementation(() => ({
    lookupAddress: vi.fn(() => 'test.ens'),
    getResolver: vi.fn(() => ({
      getAvatar: vi.fn(() => 'avatar.png'),
    })),
  })),
}));

const provider = new MockProvider();

vi.mock('$lib/stores/ens/ens', () => ({
  getMainnetProvider: vi.fn(() => new MockProvider()),
  ...vi.importActual('$lib/stores/ens/ens'),
}));

afterEach(() => {
  ens.clear();
});

describe('ens store', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (walletStore as any).mockSetSubscribeValue({
      ...get(walletStore),
      provider,
    });
  });

  it('resolves records', async () => {
    await ens.lookup('0x1234');

    const expectedResult = {
      name: 'test.ens',
      avatarUrl: 'avatar.png',
    };

    expect(get(ens)['0x1234']).toStrictEqual(expectedResult);
  });
});
