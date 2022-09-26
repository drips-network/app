import { fireEvent, render, screen } from '@testing-library/svelte';
import Avatar from './avatar.svelte';

describe('avatar.svelte', async () => {
  it('renders the placeholder by default', () => {
    render(Avatar, {
      props: {
        placeholderSrc: 'foo',
      },
    });

    const placeholderImg = screen.queryByAltText('user avatar placeholder');
    expect(placeholderImg).toBeInTheDocument();

    const avatarImg = screen.queryByAltText('user avatar');
    expect(avatarImg).not.toBeInTheDocument();
  });

  it('shows the main image after it loaded', async () => {
    render(Avatar, {
      props: {
        placeholderSrc: 'foo',
        src: 'bar',
      },
    });

    const placeholderImg = screen.queryByAltText('user avatar placeholder');
    const avatarImg = screen.getByAltText('user avatar');

    expect(placeholderImg).toBeVisible();

    await fireEvent.load(avatarImg);

    // Loaded sets opacity = 0 to hide the placeholder over the main image
    expect(placeholderImg).toHaveClass('loaded');
  });
});
