import { MockProvider } from '@rsksmart/mock-web3-provider';
import { get, readable } from 'svelte/store';
import ens from '.';
import walletStore from '../wallet/wallet.store';

vi.mock('@rsksmart/mock-web3-provider', () => ({
  MockProvider: vi.fn().mockImplementation(() => ({
    lookupAddress: vi.fn(() => 'test.ens'),
    getAvatar: vi.fn(() => 'foo.com/bar'),
  })),
}));

vi.mock('$lib/stores/wallet/wallet.store', () => ({
  default: readable({
    provider: new MockProvider(),
  }),
}));

afterEach(() => {
  ens.clear();
});

describe('ens store', () => {
  it('resolves records', async () => {
    await ens.lookup('0x1234');

    const expectedResult = {
      name: 'test.ens',
      avatarUrl: 'foo.com/bar',
    };

    expect(get(ens)['0x1234']).toStrictEqual(expectedResult);
  });

  it('deduplicates requests', async () => {
    const mockProvider = get(walletStore).provider;
    const lookupSpy = vi.spyOn(mockProvider, 'lookupAddress');
    const getAvatarSpy = vi.spyOn(mockProvider, 'getAvatar');

    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1235');
    ens.lookup('0x1235');

    expect(lookupSpy).toHaveBeenCalledTimes(2);
    expect(getAvatarSpy).toHaveBeenCalledTimes(2);
  });
});
