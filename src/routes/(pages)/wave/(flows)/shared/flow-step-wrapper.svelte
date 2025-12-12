<script lang="ts">
  import CoinAnimation from '$lib/components/coin-animation/coin-animation.svelte';
  import ConfettiOnClick from '$lib/components/confetti-on-click/confetti-on-click.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import type { Component } from 'svelte';
  import Confetti from 'svelte-confetti';

  interface Props {
    headline?: string | undefined;
    description?: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: Component<any> | undefined;
    children?: import('svelte').Snippet;
    leftActions?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
    confetti?: boolean;
  }

  let {
    headline = undefined,
    description = undefined,
    icon = undefined,
    confetti = false,
    children,
    leftActions,
    actions,
  }: Props = $props();
</script>

<div class="step-layout">
  <div class="top">
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
    {#if icon}
      {@const SvelteComponent = icon}
      <div class="icon">
        <SvelteComponent />
      </div>
    {/if}
    {#if headline}
      <h1 class="pixelated">{headline}</h1>
    {/if}
    {#if description}
      <div class="header">
        {#if description}
          <p>{description}</p>
        {/if}
      </div>
    {/if}
  </div>
  {@render children?.()}
  <div class="actions">
    <div class="left">
      {@render leftActions?.()}
    </div>
    <div class="right">
      {@render actions?.()}
    </div>
  </div>
</div>

<style>
  .step-layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-between;
    height: 100%;
    min-height: 8rem;
    width: 100%;
    flex: 1;
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
    max-width: 38rem;
    margin: 0 auto;
  }

  .top .icon {
    height: 6rem;
    width: 6rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
  }

  .actions > .right {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
