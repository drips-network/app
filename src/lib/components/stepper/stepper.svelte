<script lang="ts">
  import { fly } from 'svelte/transition';
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
  import type {
    AwaitPendingPayload,
    Steps,
    MovePayload,
    SidestepPayload,
    SomeTransactPayload,
  } from './types';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import AwaitStep, { type Result } from './components/await-step.svelte';
  import AwaitErrorStep from './components/await-error-step.svelte';
  import type { Writable } from 'svelte/store';
  import modal from '$lib/stores/modal';
  import { browser } from '$app/environment';
  import TransactStep from './components/transact-step.svelte';

  const dispatch = createEventDispatcher<{ stepChange: void }>();

  export let steps: Steps;
  export let context: (() => Writable<unknown>) | undefined = undefined;
  const resolvedContext = context?.();
  export let minHeightPx = 0;

  export let noTransitions = browser
    ? window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
    : false;

  let stepElement: HTMLDivElement;

  let internalSteps = steps;

  $: resolvedSteps = internalSteps.map((someStep) => someStep((i) => i));

  export let currentStepIndex = 0;
  $: currentStep = resolvedSteps[currentStepIndex];

  let prevStepIndex = 0;
  let direction: 'forward' | 'backward' = 'forward';
  $: {
    if (currentStepIndex > prevStepIndex) {
      direction = 'forward';
    } else if (currentStepIndex < prevStepIndex) {
      direction = 'backward';
    }

    prevStepIndex = currentStepIndex;
  }

  function nextValidStepIndex(startIndex: number, direction: 'forward' | 'backward') {
    let index = startIndex;

    while (true) {
      if (index < 0 || index >= resolvedSteps.length) {
        return startIndex;
      }

      const condition = resolvedSteps[index].condition?.();

      if (condition === undefined || condition === true) {
        return index;
      }

      if (direction === 'forward') {
        index++;
      } else {
        index--;
      }
    }
  }

  /**
   * Advances `by` amount of steps in the flow (or goes backwards with a negative number).
   * Resolves when the step transition has concluded fully.
   * @param by The amount of steps to move by.
   */
  async function move(by: number) {
    dispatch('stepChange');

    const direction = by > 0 ? 'forward' : 'backward';

    currentStepIndex = nextValidStepIndex(currentStepIndex + by, direction);

    // Wait for the old step to be fully out of view and unmounted.
    return new Promise<void>((resolve) => (transitionEndListener = resolve));
  }

  let disableTransitions = false;

  function getTransition(inOrOut: 'in' | 'out') {
    if (noTransitions || disableTransitions) return { x: 0, duration: 0 };

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

  let wrapperHeight = tweened(minHeightPx);

  let resizeObserver = browser ? new ResizeObserver(() => updateContainerHeight()) : undefined;
  let observedElement: HTMLDivElement | undefined;

  async function updateMutationObserver() {
    if (!resizeObserver) return;

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

    const stepHeight = Math.max(observedElement.offsetHeight, minHeightPx);

    wrapperHeight.set(stepHeight, {
      duration: firstHeightUpdate || noTransitions || !transitioning ? 0 : 300,
      easing: cubicInOut,
    });

    firstHeightUpdate = false;
  }

  function handleGoForward(event: CustomEvent<MovePayload>) {
    move(event.detail?.by ?? 1);
  }

  let awaiting: AwaitPendingPayload | undefined;
  let awaitError: Error | undefined;

  function handleAwait(event: CustomEvent<AwaitPendingPayload>) {
    if (transacting) {
      throw new Error('Cannot await while transacting.');
    }

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

  let transacting: SomeTransactPayload | undefined;

  function handleTransact(event: CustomEvent<SomeTransactPayload>) {
    if (awaiting) {
      throw new Error('Cannot transact while awaiting.');
    }

    direction = 'forward';
    transacting = event.detail;
  }

  function handleTransactResult(event: CustomEvent<Result>) {
    if (event.detail.success) {
      move(1);
    } else {
      // Handling transact errors as await errors.
      awaitError = event.detail.error;
    }

    transacting = undefined;
  }

  function handleTransactStartOver() {
    direction = 'backward';
    transacting = undefined;
    move(0);
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
    // move relies on resolvedSteps, so allow that computed property
    // to update
    await tick();

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
    transacting;
    updateMutationObserver();
  }

  onMount(() => {
    const windowResizeListener = () => updateContainerHeight();
    window.addEventListener('resize', windowResizeListener);

    return () => window.removeEventListener('resize', windowResizeListener);
  });

  onDestroy(() => resizeObserver?.disconnect());
</script>

<div
  class="wrapper w-full"
  style:height={`${$wrapperHeight}px`}
  style:overflow={transitioning ? 'hidden' : 'visible'}
>
  {#key `${awaiting}${transacting}${awaitError}${currentStepIndex}`}
    <div
      in:fly={(() => getTransition('in'))()}
      out:fly={(() => getTransition('out'))()}
      on:outrostart={() => setTransitioning(true)}
      on:introend={() => setTransitioning(false)}
      class="step-wrapper"
    >
      <div class="step" bind:this={stepElement}>
        {#if awaiting}
          <AwaitStep {...awaiting} on:result={handleAwaitResult} />
        {:else if awaitError}
          <AwaitErrorStep message={awaitError.message} on:retry={handleAwaitErrorRetry} />
        {:else if transacting}
          <TransactStep
            transactPayload={transacting}
            on:result={handleTransactResult}
            on:startOver={handleTransactStartOver}
          />
        {:else}
          <svelte:component
            this={currentStep.component}
            on:await={handleAwait}
            on:transact={handleTransact}
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
  .wrapper {
    position: relative;
    margin: 0 auto;
  }

  .step-wrapper {
    position: absolute;
    width: 100%;
  }

  .step {
    padding: 1.5rem;
    width: 100%;
  }

  @media only screen and (max-width: 54rem) {
    .step {
      padding: 1rem;
    }
  }
</style>
