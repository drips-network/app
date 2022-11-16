<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onDestroy, onMount, tick } from 'svelte';
  import type { AwaitPendingPayload, Steps, MovePayload, SetStepsPayload } from './types';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import AwaitStep, { type Result } from './components/await-step.svelte';
  import AwaitErrorStep from './components/await-error-step.svelte';
  import type { Writable } from 'svelte/store';

  export let initialSteps: Steps;
  export let initialContext: Writable<unknown> | undefined = undefined;

  let context: Writable<unknown> | undefined = initialContext;
  let steps: Steps = initialSteps;
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

  let containerHeight = tweened(0);

  let mutationObserver = new MutationObserver(() => updateContainerHeight(true));
  let observedElement: HTMLDivElement | undefined;

  async function updateMutationObserver() {
    await tick();

    mutationObserver.disconnect();

    if (stepElement instanceof HTMLDivElement) {
      observedElement = stepElement;
      mutationObserver.observe(stepElement, { childList: true, subtree: true });
      updateContainerHeight();
    }
  }

  let firstHeightUpdate = true;
  async function updateContainerHeight(disableTransition = false) {
    await tick();

    if (!observedElement) return;

    const stepHeight = observedElement.clientHeight;

    containerHeight.set(stepHeight, {
      duration: firstHeightUpdate || disableTransition ? 0 : 300,
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

  function handleSetSteps(event: CustomEvent<SetStepsPayload>) {
    currentStepIndex = 0;
    steps = event.detail.steps;
  }

  $: {
    currentStep;
    awaitError;
    awaiting;
    updateMutationObserver();
  }

  onMount(() => {
    const windowResizeListener = () => updateContainerHeight(true);
    window.addEventListener('resize', windowResizeListener);

    return () => window.removeEventListener('resize', windowResizeListener);
  });

  onDestroy(() => mutationObserver.disconnect());
</script>

<div class="container" style:height={`${$containerHeight}px`}>
  {#key `${awaiting}${awaitError}${currentStepIndex}`}
    <div
      in:fly|local={(() => getTransition('in'))()}
      out:fly|local={(() => getTransition('out'))()}
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
            on:setSteps={handleSetSteps}
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
    height: 100%;
  }

  .step {
    width: 100%;
  }
</style>
