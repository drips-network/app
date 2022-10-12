import tokens from '$lib/stores/tokens';
import { cleanup, render, screen } from '@testing-library/svelte';
import Amount from './amount.svelte';

vi.mock('$app/environment', () => ({
  browser: true,
}));

beforeAll(() => {
  tokens.connect(1);
});

afterEach(() => {
  cleanup();
});

describe('amount.svelte', () => {
  it('displays unknown token if the token address is unknown', () => {
    render(Amount, {
      props: {
        tokenAddress: '0000',
        amount: BigInt('1000000000000000000'),
      },
    });

    screen.getByText('Unknown token');
  });

  it('displays the correct amount for tokens of different decimals', () => {
    render(Amount, {
      props: {
        tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
        amount: BigInt('1000000000000000000'),
      },
    });

    expect(screen.getByText('1.000000')).toBeInTheDocument();
    expect(screen.getByText('RAD')).toBeInTheDocument();

    cleanup();

    render(Amount, {
      props: {
        tokenAddress: '0x607F4C5BB672230e8672085532f7e901544a7375', // RLC, 9 decimals
        amount: BigInt('1000000000'),
      },
    });

    screen.getByText('1.000000');
    screen.getByText('RLC');
  });
});

export default {};
