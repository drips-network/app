<script lang="ts">
  import { fly } from 'svelte/transition';
  import { tick } from 'svelte';
  import type { AwaitPendingPayload, Steps } from './types';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import AwaitStep, { type Result } from './components/await-step.svelte';
  import AwaitErrorStep from './components/await-error-step.svelte';

  export let steps: Steps;

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

  let firstHeightUpdate = true;
  async function updateContainerHeight() {
    await tick();

    const stepHeight = stepElement.getBoundingClientRect().height;

    containerHeight.set(stepHeight + 32, {
      duration: firstHeightUpdate ? 0 : 300,
      easing: cubicInOut,
    });

    firstHeightUpdate = false;
  }

  let awaiting: AwaitPendingPayload | undefined;
  let awaitError: Error | undefined;

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
    updateContainerHeight();
  }
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
            on:goForward={() => move(1)}
            on:goBackward={() => move(-1)}
            {...currentStep.props}
          />
        {/if}
      </div>
    </div>
  {/key}
</div>

<style>
  .container {
    overflow: hidden;
    padding: 1rem;
    position: relative;
  }

  .step-container {
    position: absolute;
    width: calc(100% - 2rem);
    height: calc(100% - 2rem);
  }

  .step {
    width: 100%;
  }
</style>
