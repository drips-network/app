<script lang="ts">
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import { slide } from 'svelte/transition';
  import type { AddItemError } from '../errors';

  export let error: AddItemError | undefined = undefined
</script>

{#if error}
  {@const color = error.severity === 'error' ? 'negative' : 'caution'}
  {@const textColor = `var(--color-${color}-level-6)`}
  <div
    transition:slide|global={{ duration: 300 }}
    class="error {error.severity}"
    style:background-color="var(--color-{color}-level-1)"
    style:color={textColor}
  >
    <ExclamationCircle style="fill: {textColor}" />
    {error.message}
  </div>
{/if}

<style>
  .error {
    height: 3.5rem;
    padding: 0.75rem;
    padding-left: 1rem;
    gap: 0.75rem;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-foreground);
  }
</style>