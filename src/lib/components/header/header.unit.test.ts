import scroll from '$lib/stores/scroll';
import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import Header from './header.svelte';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$app/environment', () => ({
  browser: true,
}));

beforeEach(() => {
  scroll.attach();
});

describe('header.svelte', () => {
  it('has zero elevation at top of page', () => {
    render(Header);

    const header = screen.getByRole('banner');

    expect(header).not.toHaveStyle({
      boxShadow: 'var(--elevation-medium)',
    });
  });

  it('has elevation when scrolling down on the page', async () => {
    render(Header);

    window.scrollY = 100;
    fireEvent.scroll(window);

    const header = screen.getByRole('banner');

    await tick();

    expect(header).toHaveClass('elevated');

    window.scrollY = 0;
    fireEvent.scroll(window);

    await tick();

    expect(header).not.toHaveClass('elevated');
  });

  it('has a link back to the homepage', () => {
    render(Header);

    const links = screen.queryAllByRole('link');

    expect(links.find((e) => e.getAttribute('href') === '/')).toBeTruthy();
  });
});
