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

    expect(screen.getByText('1.00')).toBeInTheDocument();
    expect(screen.getByText('RAD')).toBeInTheDocument();

    cleanup();

    render(Amount, {
      props: {
        tokenAddress: '0x607F4C5BB672230e8672085532f7e901544a7375', // RLC, 9 decimals
        amount: BigInt('1000000000'),
      },
    });

    screen.getByText('1.00');
    screen.getByText('RLC');
  });

  it('trims decimals', () => {
    render(Amount, {
      props: {
        tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
        amount: BigInt('1100000000000000000'),
      },
    });

    // Should display at least 2 decimal places
    screen.getByText('1.10');

    render(Amount, {
      props: {
        tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
        amount: BigInt('1123400000000000000'),
      },
    });

    // Should not display excessive zeroes
    screen.getByText('1.1234');

    render(Amount, {
      props: {
        tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
        amount: BigInt('1123456789000000000'),
      },
    });

    // Should display at most 8 decimal places
    screen.getByText('1.12345679');
  });
});

export default {};
