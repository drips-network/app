import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ThumbsUp from '$lib/components/icons/ThumbsUp.svelte';
import SectionHeader from './section-header.svelte';

describe('section-header.svelte', () => {
  it('renders its label', () => {
    render(SectionHeader, {
      props: {
        label: 'Test Label',
      },
    });

    screen.getByText('Test Label');
  });

  it('renders an icon', () => {
    render(SectionHeader, {
      props: {
        label: 'Test Label',
        icon: ThumbsUp,
      },
    });

    screen.getByTestId('section-icon');
  });

  it('applies primary styling to all icons by default', () => {
    render(SectionHeader, {
      props: {
        label: 'Test Label',
        icon: ThumbsUp,
      },
    });

    const iconWrapper = screen.getByTestId('section-icon');
    expect(iconWrapper).toHaveClass('icon-primary');
  });

  it('adds has-actions class when actions are provided', () => {
    render(SectionHeader, {
      props: {
        label: 'Test Label',
        actions: [
          {
            label: 'test action',
            handler: () => {},
          },
        ],
      },
    });

    const sectionHeader = document.querySelector('.section-header');
    expect(sectionHeader).toHaveClass('has-actions');
  });

  it('does not add has-actions class when no actions are provided', () => {
    render(SectionHeader, {
      props: {
        label: 'Test Label',
        actions: [],
      },
    });

    const sectionHeader = document.querySelector('.section-header');
    expect(sectionHeader).not.toHaveClass('has-actions');
  });

  it('renders actions', async () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    render(SectionHeader, {
      props: {
        label: 'Test Label',
        actions: [
          {
            label: 'test action 1',
            handler: spy1,
          },
          {
            label: 'test action 2',
            handler: spy2,
          },
        ],
      },
    });

    const button1 = screen.getByText('test action 1');
    const button2 = screen.getByText('test action 2');

    await userEvent.click(button1);

    expect(spy1).toHaveBeenCalled();

    await userEvent.click(button2);

    expect(spy2).toHaveBeenCalled();
  });
});
