<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onDestroy, onMount, tick } from 'svelte';
  import type { AwaitPendingPayload, Steps, MovePayload } from './types';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import AwaitStep, { type Result } from './components/await-step.svelte';
  import AwaitErrorStep from './components/await-error-step.svelte';
  import type { Writable } from 'svelte/store';

  export let steps: Steps;
  export let context: Writable<unknown> | undefined = undefined;

  let stepElement: HTMLDivElement;

  $: resolvedSteps = steps.map((someStep) => someStep((i) => i));

  let currentStepIndex = 0;
  $: currentStep = resolvedSteps[currentStepIndex];

  let direction: 'forward' | 'backward' = 'forward';

  function move(by: number) {
    if (!resolvedSteps[currentStepIndex + by]) return;

    direction = by > 0 ? 'forward' : 'backward';

    currentStepIndex += by;
  }

  function getTransition(inOrOut: 'in' | 'out') {
    let x;

    if (inOrOut === 'in') {
      x = direction === 'forward' ? 64 : -64;
    } else {
      x = direction === 'forward' ? -64 : 64;
    }

    return { x, duration: 300, easing: cubicInOut };
  }

  let transitioning = false;
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
      on:outrostart={() => (transitioning = true)}
      on:introend={() => (transitioning = false)}
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
            on:goBackward={() => move(-1)}
            {...currentStep.props}
            {context}
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
