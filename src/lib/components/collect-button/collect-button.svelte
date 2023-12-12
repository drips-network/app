<script lang="ts">
  import Download from 'radicle-design-system/icons/Download.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { onMount, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { tweened } from 'svelte/motion';
  import { quintInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';

  let loading = true;

  let amount: string | undefined = '$218.17';
  let amountElem: HTMLDivElement;
  let amountElemWidth = tweened(0, { duration: 400, easing: quintInOut });
  let amountTransitioning = false;
  let amountToShow: string | undefined = '$218.17';

  onMount(() => {
    // setInterval(() => {
    //   // For testing, change amount to amounts with different amount of digits every second
    //   amount = amount === '$218.1' ? undefined : '$218.1';
    // }, 1500);

    // For testing
    setTimeout(() => {
      loading = false;
    }, 1000);
  });

  async function updateAmountToShow() {
    await tick();

    amountTransitioning = true;

    setTimeout(async () => {
      amountToShow = amount;
      await tick();

      const newWidth = loading ? 0 : amountElem?.getBoundingClientRect().width ?? 0;

      if (newWidth === 24) {
        amountElemWidth.set(0);
      } else {
        amountElemWidth.set(newWidth);
      }
    }, 200);

    setTimeout(() => {
      amountTransitioning = false;
    }, 500);
  }

  $: {
    amount;
    loading;
    if (browser) {
      updateAmountToShow();
    }
  }
</script>

<button disabled={loading}>
  <div class="amount-wrapper" style:width="{$amountElemWidth}px">
    <div
      class="amount tabular-nums typo-text-bold"
      class:transitioning={amountTransitioning}
      bind:this={amountElem}
    >
      {amountToShow ?? ''}
    </div>
  </div>
  <div class="content">
    {#if loading}
      <div transition:fade class="loading-state">
        <Spinner />
      </div>
    {/if}
    <Download style="fill: var(--color-foreground)" />
    Collect funds
  </div>
</button>

<style>
  button {
    display: flex;
    justify-content: center;
    height: 2rem;
    padding: 0;
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    transition: background-color 0.3s, color 0.3s, transform 0.2s, box-shadow 0.2s, opacity 0.3s;
  }

  button .content {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    padding: 0.25rem 0.75rem 0.25rem 0.5rem;
    position: relative;
    background-color: var(--color-background);
  }

  button .amount-wrapper {
    height: 100%;
    background-color: var(--color-primary);
  }

  button .amount-wrapper .amount {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 0.75rem;
    color: white;
    width: fit-content;
    transition: opacity 0.2s;
  }

  button .amount.transitioning {
    opacity: 0;
  }

  button .content .loading-state {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background);
    top: 0;
    left: 0;
  }

  button:disabled {
    opacity: 0.5;
  }

  button:not(:disabled):hover,
  button:not(:disabled):focus-visible {
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 2px 0px 1px var(--color-foreground),
      inset 0 0px 0px 0px var(--color-foreground);
    transform: translateY(-2px);
  }

  button:not(:disabled):active {
    transform: translateY(0px);
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 0px 0px 0px var(--color-foreground);
  }
</style>
