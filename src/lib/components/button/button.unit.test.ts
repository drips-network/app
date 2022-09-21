import SlotTestComponent from '$lib/utils/test/slot-test-component.svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ThumbsUpIcon from 'radicle-design-system/icons/ThumbsUp.svelte';
import Button from './button.svelte';

describe('button.svelte', async () => {
  it('renders the main slot', () => {
    render(SlotTestComponent, {
      props: {
        component: Button,
        text: 'Test',
      },
    });

    const label = screen.getByText('Test');
    expect(label).toBeInTheDocument();
  });

  it('renders an icon', () => {
    render(Button, {
      props: {
        icon: ThumbsUpIcon,
      },
    });

    const icon = screen.getByRole('button');
    expect(icon).toBeInTheDocument();
  });

  it('fires click handler on click', () => {
    const handleClick = vi.fn();

    render(Button, {
      props: {
        onClick: handleClick,
      },
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('cannot be clicked when disabled', () => {
    const handleClick = vi.fn();

    render(Button, {
      props: {
        onClick: handleClick,
        disabled: true,
      },
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toBeCalledTimes(0);
  });

  it('renders ariaLabel for accessibility', () => {
    render(Button, {
      props: {
        ariaLabel: 'aria test',
      },
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('aria test');
  });
});
