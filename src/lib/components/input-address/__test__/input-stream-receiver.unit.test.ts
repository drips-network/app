import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Wrapper from './input-stream-receiver-test-wrapper.svelte';
import ens from '$lib/stores/ens';

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
}));

const VITALIK_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const SLOW_ENS_ADDRESS = '0x1111111111111111111111111111111111111111';
const OTHER_ADDRESS = '0x2222222222222222222222222222222222222222';

const defaultReverseLookup = async (name: string) =>
  name === 'vitalik.eth' ? VITALIK_ADDRESS : undefined;

vi.mock('$lib/stores/ens', () => ({
  default: {
    reverseLookup: vi.fn(),
  },
}));

const reverseLookup = vi.mocked(ens.reverseLookup);

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

beforeEach(() => {
  reverseLookup.mockReset();
  reverseLookup.mockImplementation(defaultReverseLookup);
});

afterEach(() => {
  cleanup();
});

// Account ID of a Drip List (NFT driver).
const DRIP_LIST_ID = '41305178594442616889778610143373288091511468151140966646158126636698';
// Account ID of an address driver account, i.e. not a Drip List.
const NON_DRIP_LIST_ID = '1234';

const RECEIVER_PLACEHOLDER = 'Ethereum address, ENS name, or Drip List URL';

const dripListUrl = (id: string) => `${window.location.origin}/app/drip-lists/${id}`;

const validationState = () => screen.getByTestId('validation-state').textContent;
const validatedValue = () => screen.getByTestId('validated-value').textContent;
const inputValue = () => screen.getByTestId('input-value').textContent;

/** Replaces the whole receiver input with `text` in one go, as pasting over a selection does. */
async function enterRecipient(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText(RECEIVER_PLACEHOLDER) as HTMLInputElement;
  await user.click(input);
  input.setSelectionRange(0, input.value.length);
  await user.paste(text);
  expect(input.value).toBe(text);
}

describe('input-stream-receiver.svelte', () => {
  it('keeps a Drip List URL valid after another field in the form is edited', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await enterRecipient(user, dripListUrl(DRIP_LIST_ID));

    await waitFor(() => expect(validationState()).toBe('valid'));
    expect(validatedValue()).toBe(DRIP_LIST_ID);
    // The input keeps the URL; it is not replaced by the resolved account ID.
    expect(inputValue()).toBe(dripListUrl(DRIP_LIST_ID));

    await user.type(screen.getByPlaceholderText('Name'), 'My stream');

    expect(validationState()).toBe('valid');
    expect(validatedValue()).toBe(DRIP_LIST_ID);
    expect(inputValue()).toBe(dripListUrl(DRIP_LIST_ID));
    expect(screen.queryByText(/Enter a valid Ethereum address/)).toBeNull();
  });

  it('resolves an ENS name without replacing the input value', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await enterRecipient(user, 'vitalik.eth');

    await waitFor(() => expect(validationState()).toBe('valid'));
    expect(validatedValue()).toBe(VITALIK_ADDRESS);
    expect(inputValue()).toBe('vitalik.eth');

    await user.type(screen.getByPlaceholderText('Name'), 'x');
    expect(validationState()).toBe('valid');
    expect(inputValue()).toBe('vitalik.eth');
  });

  it('does not re-validate (or re-run the ENS lookup) when another field is edited', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await enterRecipient(user, 'vitalik.eth');
    await waitFor(() => expect(validationState()).toBe('valid'));

    const lookupsBefore = reverseLookup.mock.calls.length;
    expect(lookupsBefore).toBeGreaterThan(0);

    await user.type(screen.getByPlaceholderText('Name'), 'My stream');

    expect(reverseLookup).toHaveBeenCalledTimes(lookupsBefore);
  });

  it('discards the result of an ENS lookup for an input that has since changed', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    let resolveSlowLookup: (address: string) => void = () => undefined;
    reverseLookup.mockImplementation((name: string) =>
      name === 'slow.eth'
        ? new Promise<string>((resolve) => (resolveSlowLookup = resolve))
        : defaultReverseLookup(name),
    );

    await enterRecipient(user, 'slow.eth');
    await waitFor(() => expect(validationState()).toBe('pending'));
    expect(reverseLookup).toHaveBeenCalledWith('slow.eth');

    // Change the input before the lookup for `slow.eth` has resolved.
    await enterRecipient(user, OTHER_ADDRESS);
    await waitFor(() => expect(validationState()).toBe('valid'));
    expect(validatedValue()).toBe(OTHER_ADDRESS);

    // The lookup for the previous input now resolves, and must not win.
    resolveSlowLookup(SLOW_ENS_ADDRESS);
    await new Promise((r) => setTimeout(r, 0));

    expect(validationState()).toBe('valid');
    expect(validatedValue()).toBe(OTHER_ADDRESS);
    expect(inputValue()).toBe(OTHER_ADDRESS);
  });

  it('clears the validated value when the input changes to an invalid Drip List URL', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await enterRecipient(user, dripListUrl(DRIP_LIST_ID));
    await waitFor(() => expect(validationState()).toBe('valid'));
    expect(validatedValue()).toBe(DRIP_LIST_ID);

    await enterRecipient(user, dripListUrl(NON_DRIP_LIST_ID));

    await waitFor(() => expect(validationState()).toBe('invalid'));
    expect(screen.getByTestId('validation-message').textContent?.trim()).toBe(
      'Invalid Drip List URL',
    );
    expect(validatedValue()).toBe('');
  });

  it('re-validates when the exclusion list changes while the input stays the same', async () => {
    const user = userEvent.setup();
    const { rerender } = render(Wrapper);

    await enterRecipient(user, OTHER_ADDRESS);
    await waitFor(() => expect(validationState()).toBe('valid'));

    await rerender({ exclude: [{ addresses: [OTHER_ADDRESS], msg: 'That is you.' }] });

    await waitFor(() => expect(validationState()).toBe('invalid'));
    expect(screen.getByTestId('validation-message').textContent?.trim()).toBe('That is you.');

    await rerender({ exclude: [{ addresses: [], msg: 'That is you.' }] });

    await waitFor(() => expect(validationState()).toBe('valid'));
  });

  it('rejects invalid input', async () => {
    const user = userEvent.setup();
    render(Wrapper);

    await enterRecipient(user, 'nonsense');

    await waitFor(() => expect(validationState()).toBe('invalid'));
    expect(validatedValue()).toBe('');
  });
});
