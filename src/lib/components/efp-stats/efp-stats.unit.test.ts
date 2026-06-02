import { render, screen } from '@testing-library/svelte';
import EfpStats from './efp-stats.svelte';

vi.mock('$lib/stores/wallet/network', () => ({
  default: { enableEfp: true },
}));

vi.mock('$lib/components/identity-badge/identity-badge.svelte', () => ({
  default: true,
}));

describe('efp-stats.svelte', () => {
  it('renders follower and following counts when stats are present', () => {
    render(EfpStats, {
      props: {
        address: '0x1234567890123456789012345678901234567890',
        stats: { followers: 1200, following: 42 },
      },
    });

    expect(screen.getByText(/1,200 followers/)).toBeInTheDocument();
    expect(screen.getByText(/42 following/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://efp.app/0x1234567890123456789012345678901234567890',
    );
  });

  it('renders nothing when stats are absent', () => {
    const { container } = render(EfpStats, {
      props: {
        address: '0x1234567890123456789012345678901234567890',
        stats: null,
      },
    });

    expect(container.querySelector('.efp-stats')).toBeNull();
  });

  it('truncates common followers to maxCommonFollowers', () => {
    render(EfpStats, {
      props: {
        address: '0x1234567890123456789012345678901234567890',
        stats: { followers: 3, following: 1 },
        showCommonFollowers: true,
        maxCommonFollowers: 2,
        commonFollowers: [
          { address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
          { address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
          { address: '0xcccccccccccccccccccccccccccccccccccccccc' },
        ],
      },
    });

    expect(screen.getByText('Followers you know')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
