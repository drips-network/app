import { render, fireEvent, screen } from '@testing-library/svelte';
import Counter from './example.svelte';

beforeEach(() => {
  render(Counter);
});

describe.skip('Test Counter.svelte', async () => {
  it('Initially shows zero', async () => {
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('Increases by 1 on click', async () => {
    const increaseButton = await screen.findByText('0');

    await fireEvent.click(increaseButton);

    const counter = await screen.findByText('1');
    expect(counter).toBeInTheDocument();
  });
});
