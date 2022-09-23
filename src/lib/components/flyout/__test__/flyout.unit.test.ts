import { render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import flyoutTestWrapperComponentSvelte from './flyout-test-wrapper-component.svelte';

describe('flyout.svelte', () => {
  it('initially renders the trigger content slot, but not flyout content', () => {
    render(flyoutTestWrapperComponentSvelte);

    const trigger = screen.queryByText('Trigger');
    const content = screen.queryByText('Content');

    expect(trigger).toBeInTheDocument();
    expect(content).not.toBeInTheDocument();
  });

  /*
  The following two tests are skipped because of some weirdness with waiting for svelte
  transitions to conclude. I left a question here:

  https://github.com/testing-library/svelte-testing-library/issues/206#issuecomment-1256151224

  If someone has an answer, I'll adjust the tests and re-enable them.
  */

  it.skip('renders the content while hovering, and hides on mouseout', async () => {
    render(flyoutTestWrapperComponentSvelte);

    const trigger = screen.getByText('Trigger');

    await userEvent.hover(trigger);

    const content = screen.getByText('Content');

    await userEvent.unhover(trigger);
    await tick();

    await waitForElementToBeRemoved(content, { timeout: 5000 });
  });

  it.skip('responds to keyboard focus too', async () => {
    render(flyoutTestWrapperComponentSvelte);

    screen.getByText('Trigger');

    await userEvent.tab();

    const content = screen.getByText('Content');

    await userEvent.tab();
    await tick();

    await waitForElementToBeRemoved(content, { timeout: 5000 });
  });
});
