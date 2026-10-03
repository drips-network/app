import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Wrapper from './input-stream-receiver-test-wrapper.svelte';

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
}));

vi.mock('$lib/stores/ens', () => ({
  default: {
    reverseLookup: vi.fn(async (name: string) =>
      name === 'vitalik.eth' ? '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' : undefined,
    ),
  },
}));

class ResizeObserver {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window.ResizeObserver as any) = ResizeObserver;

afterEach(() => {
  cleanup();
});

const DRIP_LIST_ID = '41305178594442616889778610143373288091511468151140966646158126636698';

describe('input-stream-receiver.svelte', () => {
  it('keeps a Drip List URL valid after another field in the form is edited', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    const dripListUrl = `${window.location.origin}/app/drip-lists/${DRIP_LIST_ID}`;

    await user.click(screen.getByPlaceholderText('Ethereum address, ENS name, or Drip List URL'));
    await user.paste(dripListUrl);

    await waitFor(() => expect(screen.getByTestId('validation-state').textContent).toBe('valid'));
    expect(screen.getByTestId('validated-value').textContent).toBe(DRIP_LIST_ID);
    expect(screen.getByTestId('input-value').textContent).toBe(dripListUrl);

    await user.type(screen.getByPlaceholderText('Name'), 'My stream');

    expect(screen.getByTestId('validation-state').textContent).toBe('valid');
    expect(screen.getByTestId('validated-value').textContent).toBe(DRIP_LIST_ID);
    expect(screen.queryByText(/Enter a valid Ethereum address/)).toBeNull();
  });

  it('resolves an ENS name without replacing the input value', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await user.type(
      screen.getByPlaceholderText('Ethereum address, ENS name, or Drip List URL'),
      'vitalik.eth',
    );

    await waitFor(() => expect(screen.getByTestId('validation-state').textContent).toBe('valid'));
    expect(screen.getByTestId('validated-value').textContent).toBe(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    );
    expect(screen.getByTestId('input-value').textContent).toBe('vitalik.eth');

    await user.type(screen.getByPlaceholderText('Name'), 'x');
    expect(screen.getByTestId('validation-state').textContent).toBe('valid');
  });

  it('rejects invalid input', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await user.type(
      screen.getByPlaceholderText('Ethereum address, ENS name, or Drip List URL'),
      'nonsense',
    );

    await waitFor(() => expect(screen.getByTestId('validation-state').textContent).toBe('invalid'));
    expect(screen.getByTestId('validated-value').textContent).toBe('');
  });
});
