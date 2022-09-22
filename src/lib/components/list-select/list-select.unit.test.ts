import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ListSelect from './list-select.svelte';

const testItems = {
  'test-item-1': {
    type: 'selectable',
    label: 'test-item-1-label',
    text: 'test-item-1-text',
  },
  'test-item-2': {
    type: 'selectable',
    label: 'test-item-2-label',
    text: 'test-item-2-text',
  },
};

describe('list-select.svelte', async () => {
  it('renders list items', () => {
    render(ListSelect, {
      props: {
        items: testItems,
      },
    });

    screen.getByText('test-item-1-label');
    screen.getByText('test-item-2-label');
    screen.getByText('test-item-1-text');
    screen.getByText('test-item-2-text');
  });

  it('shows a searchbar by default', () => {
    render(ListSelect, {
      props: {
        items: testItems,
        searchable: true,
      },
    });

    screen.getByPlaceholderText('Search…');
  });

  it("doesn't show a searchbar if searchable is false", () => {
    render(ListSelect, {
      props: {
        items: testItems,
        searchable: false,
      },
    });

    const searchBar = screen.queryByPlaceholderText('Search…');
    expect(searchBar).not.toBeInTheDocument();
  });

  it('filters items by search query', async () => {
    render(ListSelect, {
      props: {
        items: testItems,
      },
    });

    const searchBar = screen.getByPlaceholderText('Search…');

    await userEvent.type(searchBar, 'test-item-1');

    const item1 = screen.queryByTestId('item-test-item-1');
    const item2 = screen.queryByTestId('item-test-item-2');

    expect(item1).toBeInTheDocument();
    expect(item2).toHaveClass('hidden');
  });

  it('allows selecting an item', async () => {
    render(ListSelect, {
      props: {
        items: testItems,
      },
    });

    const item = screen.getByTestId('item-test-item-1');
    await fireEvent.click(item);

    expect(item).toHaveClass('selected');

    const otherItem = screen.getByTestId('item-test-item-2');

    expect(otherItem).not.toHaveClass('selected');
  });

  it('allows selecting an item via keyboard', async () => {
    render(ListSelect, {
      props: {
        items: testItems,
      },
    });

    await userEvent.tab();

    const searchBar = screen.getByPlaceholderText('Search…');
    expect(searchBar).toHaveFocus();

    await userEvent.tab();

    const item1 = screen.getByTestId('item-test-item-1');
    expect(item1).toHaveFocus();

    await userEvent.tab();

    const item2 = screen.getByTestId('item-test-item-2');
    expect(item2).toHaveFocus();

    await userEvent.keyboard('{enter}');
    expect(item2).toHaveClass('selected');
  });
});
