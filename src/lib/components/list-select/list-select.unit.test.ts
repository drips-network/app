import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ListSelect from './list-select.svelte';
import type { Items } from './list-select.types';

const testItems: Items = {
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

  it('allows selecting (multiple) items via keyboard', async () => {
    render(ListSelect, {
      props: {
        items: testItems,
        multiselect: true,
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

    await userEvent.tab({ shift: true });
    expect(item1).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(item1).toHaveClass('selected');
    expect(item2).toHaveClass('selected');

    await userEvent.tab({ shift: true });
    expect(searchBar).toHaveFocus();
  });

  it('fires action handlers', async () => {
    const spy = vi.fn();

    render(ListSelect, {
      props: {
        items: {
          action: {
            type: 'action',
            label: 'action',
            handler: spy,
          },
        },
      },
    });

    const item1 = screen.getByTestId('item-action');
    await userEvent.click(item1);

    expect(spy).toHaveBeenCalled();
  });
});
