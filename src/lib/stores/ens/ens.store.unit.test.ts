import { MockProvider } from '@rsksmart/mock-web3-provider';
import { get } from 'svelte/store';
import ens from '.';

vi.mock('@rsksmart/mock-web3-provider', () => ({
  MockProvider: vi.fn().mockImplementation(() => ({
    lookupAddress: vi.fn(() => 'test.ens'),
    getAvatar: vi.fn(() => 'foo.com/bar'),
  })),
}));

const provider = new MockProvider();

afterEach(() => {
  ens.clear();
});

describe('ens store', () => {
  it('resolves records', async () => {
    ens.connect(provider);

    await ens.lookup('0x1234');

    const expectedResult = {
      name: 'test.ens',
      avatarUrl: 'foo.com/bar',
    };

    expect(get(ens)['0x1234']).toStrictEqual(expectedResult);
  });

  it('deduplicates requests', async () => {
    ens.connect(provider);

    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1234');

    expect(provider.lookupAddress).toHaveBeenCalledTimes(2);
    expect(provider.getAvatar).toHaveBeenCalledTimes(2);
  });
});
