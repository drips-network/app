import { fireEvent } from '@testing-library/dom';
import { get } from 'svelte/store';
import scroll from '.';

vi.mock('$app/environment', () => ({
  browser: true,
}));

afterEach(() => {
  scroll.detach();
});

describe('scroll store', () => {
  it('is initially uninitialized', () => {
    expect(get(scroll).initialized).toBe(false);
  });

  it('is initialized after initializing', () => {
    scroll.attach();
    expect(get(scroll).initialized).toBe(true);
  });

  it('updates the window scroll value', () => {
    scroll.attach();

    window.scrollY = 100;
    fireEvent.scroll(window);

    expect(get(scroll).pos).toBe(100);
  });

  it('updates scroll direction', () => {
    scroll.attach();

    window.scrollY = 100;
    fireEvent.scroll(window);

    expect(get(scroll).direction).toBe('down');

    window.scrollY = 90;
    fireEvent.scroll(window);

    expect(get(scroll).direction).toBe('up');
  });

  it('locks and unlocks the root element', () => {
    scroll.attach();
    scroll.lock();

    const doc = document.querySelector('html');

    expect(doc?.style.overflow).toBe('hidden');

    scroll.unlock();

    expect(doc?.style.overflow).toBe('scroll');
  });
});
