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
        amount: {
          tokenAddress: '0000',
          amount: BigInt('1000000000000000000'),
        },
      },
    });

    screen.getByText('Unknown token');
  });

  it('displays the correct amount for tokens of different decimals', () => {
    render(Amount, {
      amount: {
        tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
        amount: BigInt('1000000000000000000000000000'),
      },
    });

    // By default, the component should apply extra 9 decimals of precision to the value
    expect(screen.getByText('1.00000000')).toBeInTheDocument();
    expect(screen.getByText('RAD')).toBeInTheDocument();

    cleanup();

    render(Amount, {
      props: {
        amount: {
          tokenAddress: '0x607F4C5BB672230e8672085532f7e901544a7375', // RLC, 9 decimals
          amount: BigInt('1000000000000000000000000000'),
        },
      },
    });

    screen.getByText('1000000000.00000000');
    screen.getByText('RLC');
  });

  it('trims decimals on zero values', () => {
    render(Amount, {
      props: {
        amount: {
          tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
          amount: BigInt('0'),
        },
        multiplier: 1n,
      },
    });
    screen.getByText('0.00');

    render(Amount, {
      amount: {
        tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD, 18 decimals
        amount: BigInt('1123456789000000000'),
      },
      multiplier: 1n,
    });

    // Should display at most 8 decimal places
    screen.getByText('1.12345679');
  });
});

export default {};
