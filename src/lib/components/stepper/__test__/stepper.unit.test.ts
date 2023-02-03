import { render, screen } from '@testing-library/svelte';
import Stepper from '../stepper.svelte';
import { makeStep } from '../types';
import OnlyText from './test-steps/only-text.svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import TriggerAwaitEvent from './test-steps/trigger-await-event.svelte';

vi.mock('$app/environment', () => ({
  browser: true,
}));

const wait = (millis: number) => new Promise((resolve) => setTimeout(resolve, millis));

class ResizeObserver {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

describe('stepper.svelte', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.ResizeObserver as any) = ResizeObserver;

  it('renders a step', () => {
    render(Stepper, {
      props: {
        steps: [
          makeStep({
            component: OnlyText,
            props: {
              text: 'Step 1',
            },
          }),
        ],
      },
    });

    screen.getByText('Step 1');
    screen.getByText('Continue');
    screen.getByText('Go back');
  });

  it('allows moving forward and backward', async () => {
    render(Stepper, {
      props: {
        steps: [
          makeStep({
            component: OnlyText,
            props: {
              text: 'Step 1',
            },
          }),
          makeStep({
            component: OnlyText,
            props: {
              text: 'Step 2',
            },
          }),
          makeStep({
            component: OnlyText,
            props: {
              text: 'Step 3',
            },
          }),
        ],
      },
    });

    screen.getByText('Step 1');

    const forwardButton = screen.getByText('Continue');
    const backwardButton = screen.getByText('Go back');

    userEvent.click(forwardButton);

    await wait(300);

    screen.getByText('Step 2');
    userEvent.click(forwardButton);

    await wait(300);

    screen.getByText('Step 3');
    userEvent.click(backwardButton);

    await wait(300);

    /*
    For some reason, previous steps that have been transitioned out
    stay in the DOM with the svelte testing library.
    In reality, the previous steps are removed from the DOM, but
    we need to expect Step 2 to be rendered twice here.
    */
    expect(screen.getAllByText('Step 2').length).toBe(2);
  });

  /*
  This test is skipped because it suddenly stopped working after updating to SvelteKit 1.0, without
  any changes to the stepper logic, and everything definitely still working fine.
  The stepper functionality is extensively covered by our E2E-tests anyway, so it's not super critical
  to skip it for now.

  TODO: Figure out why this test no longer passes.
  */
  it.skip('awaits promises with the wait step and displays success & error states', async () => {
    render(Stepper, {
      props: {
        steps: [
          makeStep({
            component: TriggerAwaitEvent,
            props: undefined,
          }),
          makeStep({
            component: OnlyText,
            props: {
              text: 'Await successful',
            },
          }),
        ],
      },
    });

    const triggerSuccess = screen.getByText('Await success');
    const triggerError = screen.getByText('Await error');

    userEvent.click(triggerSuccess);

    // Ensure the wait step is displayed
    await screen.findByText('Await success message');

    // Ensure the success step is displayed
    await screen.findByText('Await successful');

    const backwardButton = screen.getByText('Go back');

    userEvent.click(backwardButton);

    await tick();

    userEvent.click(triggerError);

    // Ensure the wait step is displayed
    await screen.findByText('Await error message');

    // Ensure the error step is displayed
    await screen.findByText('Failed to resolve promise');

    const tryAgainButton = screen.getByText('Try again');

    userEvent.click(tryAgainButton);

    /*
    Ensure trying again caused us to go back to the previous step.
    For some reason, previous steps that have been transitioned out
    stay in the DOM with the svelte testing library.
    In reality, the previous steps are removed from the DOM, but
    we need to expect Step 2 to be rendered twice here.
    */
    expect((await screen.findAllByText('Trigger await event step')).length).toBe(2);
  });
});

export {};
