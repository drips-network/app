<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../button/button.svelte';
  import Emoji from '../emoji/emoji.svelte';
  import StepHeader from '../step-header/step-header.svelte';
  import StepLayout from '../step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '../stepper/types';
  import modal from '$lib/stores/modal';
  import Confetti from 'svelte-confetti';
  import ConfettiOnClick from '../confetti-on-click/confetti-on-click.svelte';
  import CoinAnimation from '../coin-animation/coin-animation.svelte';
  import ArrowRight from '../icons/ArrowRight.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    message: string | (() => string);
    action?: 'close' | 'hide-modal' | 'continue' | 'none' | 'link';
    href?: string | (() => string);
    linkText?: string;
    onAction?: (() => void) | undefined;
    safeAppMode?: boolean;
    safeDescription?: string | (() => string) | undefined;
    padding?: boolean;
    confetti?: boolean;
  }

  let {
    message,
    action = 'close',
    href = '',
    linkText = 'Continue',
    onAction = undefined,
    safeAppMode = false,
    safeDescription = undefined,
    padding = false,
    confetti = true,
  }: Props = $props();

  function handleConfirm() {
    if (action === 'continue') {
      dispatch('goForward');
    } else if (action === 'hide-modal') {
      modal.hide();
    } else {
      dispatch('conclude');
    }

    onAction?.();
  }
</script>

<div class="success-step" class:with-padding={padding}>
  <StepLayout center>
    {#if safeAppMode}
      <Emoji size="huge" emoji="⏳" />
      <StepHeader
        headline="Continue in your Safe"
        description={typeof safeDescription === 'function'
          ? safeDescription()
          : (safeDescription ??
            'Please execute the proposed transaction(s) in your Safe. Once executed, come back to see the result.')}
      />
    {:else}
      {#if confetti}
        <ConfettiOnClick alsoOnMount>
          {#snippet label()}
            <CoinAnimation animateOnMount>
              <div class="circle">
                <Emoji size="huge" emoji="🎉" />
              </div>
            </CoinAnimation>
          {/snippet}

          <Confetti
            x={[-1, 1]}
            y={[-0.25, 1]}
            colorArray={[
              'var(--color-primary)',
              'var(--color-primary-level-2)',
              'var(--color-primary-level-6)',
            ]}
          />
        </ConfettiOnClick>
      {/if}

      <StepHeader
        headline="Success"
        description={typeof message === 'function' ? message() : message}
      />
    {/if}
    {#snippet actions()}
      {#if action === 'link'}
        <Button
          variant="primary"
          href={typeof href === 'function' ? href() : href}
          icon={ArrowRight}
          onclick={() => {
            onAction?.();
            dispatch('conclude');
          }}
        >
          {linkText}
        </Button>
      {:else if action !== 'none'}
        <Button variant="primary" onclick={handleConfirm}
          >{action === 'close' || action === 'hide-modal' ? 'Got it' : 'Continue'}</Button
        >
      {/if}
    {/snippet}
  </StepLayout>
</div>

<style>
  .circle {
    padding: 1rem;
    border-radius: 50%;
    border: 2px solid var(--color-primary-level-2);
  }

  .success-step.with-padding {
    padding: 1rem;
  }
</style>
