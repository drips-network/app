import { get } from 'svelte/store';
import ens from '.';
import { provider } from './__mocks__/ens';

vi.spyOn(provider, 'lookupAddress');
vi.spyOn(provider, 'getResolver');

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
}));

vi.mock('$lib/stores/ens/ens');

afterEach(() => {
  ens.clear();
});

describe('ens store', () => {
  it('resolves records', async () => {
    await ens.lookup('0x1234');

    const expectedResult = {
      name: 'test.ens',
      avatarUrl: 'avatar.png',
    };

    expect(get(ens)['0x1234']).toStrictEqual(expectedResult);
  });

  it('deduplicates requests', async () => {
    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1234');
    ens.lookup('0x1234');

    expect(provider.lookupAddress).toHaveBeenCalledTimes(2);
    expect(provider.getResolver).toHaveBeenCalledTimes(1);
  });
});
