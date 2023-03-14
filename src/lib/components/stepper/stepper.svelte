<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onDestroy, onMount, tick } from 'svelte';
  import type { AwaitPendingPayload, Steps, MovePayload, SidestepPayload } from './types';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import AwaitStep, { type Result } from './components/await-step.svelte';
  import AwaitErrorStep from './components/await-error-step.svelte';
  import type { Writable } from 'svelte/store';
  import modal from '$lib/stores/modal';

  export let steps: Steps;
  export let context: (() => Writable<unknown>) | undefined = undefined;
  const resolvedContext = context?.();

  let stepElement: HTMLDivElement;

  let internalSteps = steps;

  $: resolvedSteps = internalSteps.map((someStep) => someStep((i) => i));

  let currentStepIndex = 0;
  $: currentStep = resolvedSteps[currentStepIndex];

  let direction: 'forward' | 'backward' = 'forward';

  /**
   * Advances `by` amount of steps in the flow (or goes backwards with a negative number).
   * Resolves when the step transition has concluded fully.
   * @param by The amount of steps to move by.
   */
  async function move(by: number) {
    if (!resolvedSteps[currentStepIndex + by]) {
      return;
    }

    direction = by > 0 ? 'forward' : 'backward';

    currentStepIndex += by;

    // Wait for the old step to be fully out of view and unmounted.
    return new Promise<void>((resolve) => (transitionEndListener = resolve));
  }

  let disableTransitions = false;

  function getTransition(inOrOut: 'in' | 'out') {
    if (disableTransitions) return { x: 0, duration: 0 };

    let x;

    if (inOrOut === 'in') {
      x = direction === 'forward' ? 64 : -64;
    } else {
      x = direction === 'forward' ? -64 : 64;
    }

    return { x, duration: 300, easing: cubicInOut };
  }

  let transitioning = false;
  let transitionEndListener: (() => void) | undefined = undefined;

  function setTransitioning(newVal: boolean) {
    if (newVal === false) transitionEndListener?.();
    transitioning = newVal;
  }

  let containerHeight = tweened(0);

  let resizeObserver = new ResizeObserver(() => updateContainerHeight());
  let observedElement: HTMLDivElement | undefined;

  async function updateMutationObserver() {
    await tick();

    resizeObserver.disconnect();

    if (stepElement instanceof HTMLDivElement) {
      observedElement = stepElement;
      resizeObserver.observe(stepElement);
      updateContainerHeight();
    }
  }

  let firstHeightUpdate = true;
  async function updateContainerHeight() {
    if (!observedElement) return;

    const stepHeight = observedElement.offsetHeight;

    containerHeight.set(stepHeight, {
      duration: firstHeightUpdate || !transitioning ? 0 : 300,
      easing: cubicInOut,
    });

    firstHeightUpdate = false;
  }

  let awaiting: AwaitPendingPayload | undefined;
  let awaitError: Error | undefined;

  function handleGoForward(event: CustomEvent<MovePayload>) {
    move(event.detail?.by ?? 1);
  }

  function handleAwait(event: CustomEvent<AwaitPendingPayload>) {
    direction = 'forward';
    awaiting = event.detail;
  }

  function handleAwaitResult(event: CustomEvent<Result>) {
    if (event.detail.success) {
      move(1);
    } else {
      awaitError = event.detail.error;
    }

    awaiting = undefined;
  }

  function handleAwaitErrorRetry() {
    direction = 'backward';
    awaitError = undefined;
  }

  let sidestepConfig: SidestepPayload | undefined = undefined;
  let originalSteps: Steps | undefined = undefined;
  let originalStepIndex: number | undefined = undefined;

  async function handleSidestep(event: CustomEvent<SidestepPayload>) {
    originalStepIndex = currentStepIndex;
    sidestepConfig = event.detail;
    originalSteps = [...steps];

    /*
    Temporarily replace the steps array with one where the sidestep-triggering
    step is at index 0, followed by all side-steps.
    */
    internalSteps = [steps[currentStepIndex], ...event.detail.steps];
    currentStepIndex = 0;

    // Animate to the first side-step
    await move(1);

    /*
    Replace the step array with all side-steps only, while transitions are disabled.
    */
    disableTransitions = true;
    internalSteps = [...event.detail.steps];
    currentStepIndex = 0;

    await tick();

    disableTransitions = false;
  }

  async function handleConclusion() {
    if (sidestepConfig && originalStepIndex !== undefined && originalSteps) {
      // End the sidestep and go back to the main flow.

      // Temporarily add the sidestep-triggering step one index before the current side-step.
      internalSteps = [originalSteps[originalStepIndex], internalSteps[currentStepIndex]];
      currentStepIndex = 1;

      await tick();

      // Animate to the sidestep-triggering step.
      await move(-1);

      /* While transitions are disabled, restore the original state of the step array. */
      disableTransitions = true;

      internalSteps = originalSteps;
      currentStepIndex = originalStepIndex;

      await tick();

      sidestepConfig = undefined;
      originalSteps = undefined;
      originalStepIndex = undefined;
      disableTransitions = false;
    } else {
      modal.hide();
    }
  }

  $: {
    currentStep;
    awaitError;
    awaiting;
    updateMutationObserver();
  }

  onMount(() => {
    const windowResizeListener = () => updateContainerHeight();
    window.addEventListener('resize', windowResizeListener);

    return () => window.removeEventListener('resize', windowResizeListener);
  });

  onDestroy(() => resizeObserver.disconnect());
</script>

<div
  class="container"
  style:height={`${$containerHeight}px`}
  style:overflow={transitioning ? 'hidden' : 'visible'}
>
  {#key `${awaiting}${awaitError}${currentStepIndex}`}
    <div
      in:fly|local={(() => getTransition('in'))()}
      out:fly|local={(() => getTransition('out'))()}
      on:outrostart={() => setTransitioning(true)}
      on:introend={() => setTransitioning(false)}
      class="step-container"
    >
      <div class="step" bind:this={stepElement}>
        {#if awaiting}
          <AwaitStep {...awaiting} on:result={handleAwaitResult} />
        {:else if awaitError}
          <AwaitErrorStep message={awaitError.message} on:retry={handleAwaitErrorRetry} />
        {:else}
          <svelte:component
            this={currentStep.component}
            on:await={handleAwait}
            on:goForward={handleGoForward}
            on:goBackward={(e) => move(e.detail?.by ?? -1)}
            on:conclude={handleConclusion}
            on:sidestep={handleSidestep}
            {...currentStep.props}
            context={resolvedContext}
          />
        {/if}
      </div>
    </div>
  {/key}
</div>

<style>
  .container {
    position: relative;
  }

  .step-container {
    position: absolute;
    width: 100%;
  }

  .step {
    padding: 2.5rem;
    width: 100%;
  }

  @media only screen and (max-width: 54rem) {
    .step {
      padding: 1rem;
    }
  }
</style>
