import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Dropdown from './dropdown.svelte';

vi.mock('$app/environment', () => ({
  browser: true,
}));

const TEST_PROPS = {
  value: 'first',
  options: [
    {
      value: 'third',
      title: 'Third Item',
    },
    {
      value: 'first',
      title: 'First Item',
    },
    {
      value: 'second',
      title: 'Second Item',
    },
  ],
};

describe('dropdown.svelte', () => {
  it('renders the selected item', () => {
    render(Dropdown, {
      props: TEST_PROPS,
    });

    expect(screen.getByTestId('title-field')).toHaveTextContent('First Item');
  });

  it('renders the dropdown options on click', async () => {
    render(Dropdown, {
      props: TEST_PROPS,
    });

    expect(screen.queryByTestId('options')).not.toBeInTheDocument();

    const dropdown = screen.getByTestId('dropdown');

    await userEvent.click(dropdown);

    expect(screen.queryByTestId('options')).toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    render(Dropdown, {
      props: TEST_PROPS,
    });

    await userEvent.click(screen.getByTestId('dropdown'));

    expect(screen.queryByTestId('options')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('option-third'));

    expect(screen.getByTestId('title-field')).toHaveTextContent('Third Item');
  });
});
