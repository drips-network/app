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
  ens.disconnect();
});

describe('ens store', () => {
  it("quietly doesn't resolve without a provider", async () => {
    const result = await ens.lookup('0x1234');

    expect(result).toBe(undefined);
    expect(get(ens)['0x1234']?.name).toBe(undefined);
  });

  it('resolves records', async () => {
    ens.connect(provider);

    const result = await ens.lookup('0x1234');

    const expectedResult = {
      name: 'test.ens',
      avatarUrl: 'foo.com/bar',
    };

    expect(result).toStrictEqual(expectedResult);
    expect(get(ens)['0x1234']).toStrictEqual(result);
  });

  it('deduplicates requests', async () => {
    ens.connect(provider);

    ens.lookup('0x1234');
    ens.lookup('0x1234');

    expect(provider.lookupAddress).toHaveBeenCalledTimes(1);
    expect(provider.getAvatar).toHaveBeenCalledTimes(1);
  });
});
