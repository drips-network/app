<script lang="ts">
  import { onMount } from 'svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';
  import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import { fly } from 'svelte/transition';
  import { confirmPhoneVerification } from '$lib/utils/wave/users';
  import { invalidate } from '$app/navigation';

  let { data } = $props();
  let { phoneVerificationStatus, phoneNumber, backTo } = $derived(data);

  type CellProps = PinInputRootSnippetProps['cells'][0];

  let value = $state('');

  // svelte-ignore state_referenced_locally
  let secondsLeftForRetry = $state(phoneVerificationStatus.canRetry ? 0 : 30);

  onMount(() => {
    const interval = setInterval(() => {
      if (secondsLeftForRetry > 0) {
        secondsLeftForRetry -= 1;
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  let retryCountdownReached = $derived(secondsLeftForRetry === 0);

  let verifying = $state(false);
  let wrongPin = $state(false);

  async function shake() {
    wrongPin = true;
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  async function verifyCode() {
    verifying = true;
    const result = await confirmPhoneVerification(undefined, phoneNumber.number, value);
    verifying = false;

    if (result.success) {
      await invalidate('wave:phone-verification-status');
      return;
    } else {
      await shake();
    }
  }
</script>

<FlowStepWrapper
  headline="Enter verification code"
  description="Please enter the verification code sent to {phoneNumber.formatInternational()}."
>
  <div class="pin-and-state">
    <div class="code-input" class:shake={wrongPin} class:disabled={verifying}>
      <PinInput.Root
        disabled={verifying}
        bind:value
        class="group/pininput text-foreground has-disabled:opacity-30 flex items-center"
        maxlength={6}
        oninput={() => (wrongPin = false)}
        onComplete={verifyCode}
        pattern={REGEXP_ONLY_DIGITS}
      >
        {#snippet children({ cells })}
          <div class="flex">
            {#each cells as cell, i (i)}
              {@render Cell(cell)}
            {/each}
          </div>
        {/snippet}
      </PinInput.Root>

      {#snippet Cell(cell: CellProps)}
        <PinInput.Cell
          {cell}
          class={[
            // Custom class to override global focus styles
            'focus-override',
            'relative h-14 w-10 text-[2rem]',
            'flex items-center justify-center',
            'transition-all duration-75',
            'border-foreground-level-3 border-y border-r first:rounded-l-md first:border-l last:rounded-r-md',
            'text-foreground group-focus-within/pininput:border-foreground/40 group-hover/pininput:border-foreground/40',
            'data-[active]:outline data-[active]:outline-foreground',
            wrongPin ? 'outline outline-red-500' : '',
          ].join(' ')}
        >
          {#if cell.char !== null}
            <div>
              {cell.char}
            </div>
          {/if}
          {#if cell.hasFakeCaret}
            <div
              class="caret-blink pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div class="h-8 w-px bg-foreground-level-5"></div>
            </div>
          {/if}
        </PinInput.Cell>
      {/snippet}
    </div>

    <div class="state">
      {#if verifying}
        <span
          in:fly={{ duration: 300, y: 10 }}
          out:fly={{ duration: 300, y: -10 }}
          class="typo-text-small">Verifying...</span
        >
      {:else if wrongPin}
        <span
          in:fly={{ duration: 300, y: 10 }}
          out:fly={{ duration: 300, y: -10 }}
          class="typo-text-small text-red-500">Incorrect code. Please try again.</span
        >
      {/if}
    </div>
  </div>

  <AnnotationBox type="info">
    <span class="typo-text-small-bold">Code not arriving?</span>

    {#if phoneVerificationStatus.attemptsRemaining === 0}
      You've reached the maximum number of attempts. Please try again later.
    {:else if retryCountdownReached}
      <span class="ml-1">You can request a new code.</span>
    {:else}
      <span class="ml-1">You can request a new code in {secondsLeftForRetry} seconds.</span>
    {/if}

    {#snippet actions()}
      <Button
        disabled={!retryCountdownReached || phoneVerificationStatus.attemptsRemaining === 0}
        href="/wave/verify-phone?retry=true&backTo={encodeURIComponent(backTo || '')}"
      >
        Try again
      </Button>
    {/snippet}
  </AnnotationBox>
</FlowStepWrapper>

<style>
  .pin-and-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 12rem;
    gap: 1rem;
  }

  .code-input.disabled {
    pointer-events: none;
    opacity: 0.8;
  }

  .state {
    height: 1.5rem;
    width: 100%;
    position: relative;
  }

  .state span {
    display: inline-block;
    width: 100%;
    left: 0;
    text-align: center;
    position: absolute;
  }

  .shake {
    animation: shake 0.5s;
  }

  .caret-blink {
    animation: caret-blink 1.2s ease-out infinite;
  }

  @keyframes caret-blink {
    0%,
    70%,
    100% {
      opacity: 1;
    }
    20%,
    50% {
      opacity: 0;
    }
  }

  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-10px);
    }
    100% {
      transform: translateX(0);
    }
  }
</style>
