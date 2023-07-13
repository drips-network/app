<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import modal from '$lib/stores/modal';
  import CrossCircle from 'radicle-design-system/icons/CrossCircle.svelte';
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  export let message: string;

  const dispatch = createEventDispatcher<{ retry: never }>();

  onMount(() => modal.setHideable(true));
</script>

<div class="await-error-step">
  <CrossCircle style="height: 4rem; width: 4rem; fill: var(--color-negative)" />
  <h2>Woops</h2>
  <p>Something went wrong. Here's some additional information:</p>
  <p class="codeblock typo-text-mono">
    {message}
  </p>
  <Button on:click={() => dispatch('retry')}>Go back</Button>
  <a class="typo-text-small" target="_blank" href="https://discord.gg/BakDKKDpHF"
    >Ask for help on Discord ↗</a
  >
</div>

<style>
  .await-error-step {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1rem 0;
  }

  .codeblock {
    padding: 0.5rem;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 32rem;
    background-color: var(--color-foreground-level-2);
    text-align: left;
    overflow: scroll;
  }

  p {
    color: var(--color-foreground);
  }

  a {
    margin-top: 1rem;
    color: var(--color-foreground);
    text-decoration: underline;
  }
</style>
