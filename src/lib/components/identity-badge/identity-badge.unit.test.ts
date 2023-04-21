import ens from '$lib/stores/ens';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import IdentityBadge from './identity-badge.svelte';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$app/environment', () => ({
  browser: true,
}));

vi.mock('$lib/stores/ens/ens.store.ts');

vi.mock('radicle-design-system/lib/blockies', () => ({
  createIcon: vi.fn(() => ({
    toDataURL: vi.fn(() => 'foobar.com'),
  })),
}));

describe('identity-badge.svelte', () => {
  it('queries ens for an address', () => {
    vi.spyOn(ens, 'lookup');

    render(IdentityBadge, {
      props: {
        address: '0x1235',
      },
    });

    expect(ens.lookup).toHaveBeenCalledWith('0x1235');
  });

  it('renders a formatted address if no ens name is found', async () => {
    render(IdentityBadge, {
      props: {
        // Unknown address
        address: '0x12355678',
      },
    });

    await tick();

    screen.getAllByText('1235—5678');
  });

  it('renders the ens name if one is found', async () => {
    render(IdentityBadge, {
      props: {
        // Known address
        address: '0x12345678',
      },
    });

    await tick();

    const address = screen.queryByText('1234—5678');
    expect(address).toBeNull();

    screen.getAllByText('test.eth');
  });
});

export {};
