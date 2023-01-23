<script lang="ts">
  import CheckIcon from 'radicle-design-system/icons/CheckSmall.svelte';
  import { scale } from 'svelte/transition';
  export let selected: boolean;
  export let type: 'radio' | 'check' = 'radio';
</script>

{#if type === 'radio'}
  <div class="selected-dot" on:click={() => (selected = !selected)}>
    <div class="inner" class:selected />
    <div class="outer" class:selected />
  </div>
{:else}
  <div class="selected-dot check" on:click={() => (selected = !selected)}>
    <div class="inner check" class:selected>
      {#if selected}
        <div class="check-icon" transition:scale={{ start: 1.5, duration: 300 }}>
          <CheckIcon style="fill: white" />
        </div>
      {/if}
    </div>
    <div class="outer check" class:selected />
  </div>
{/if}

<style>
  .selected-dot {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1.5rem;
    width: 1.5rem;
    position: relative;
  }

  .inner {
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground-level-4);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 1.25rem;
    transition: width 0.3s, height 0.3s, background-color 0.3s, box-shadow 0.3s;
  }

  .check.inner {
    border-radius: 0.25rem 0 0.25rem 0.25rem;
  }

  .check.inner > .check-icon {
    position: absolute;
    top: 0;
    left: 0;
  }

  .inner.selected {
    width: 0.875rem;
    height: 0.875rem;
    background-color: var(--color-primary);
    box-shadow: none;
  }

  .check.inner.selected {
    width: 1rem;
    height: 1rem;
  }

  .outer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2rem;
    height: 2rem;
    border-radius: 1.5rem;
    box-shadow: red;
    transition: width 0.3s, height 0.3s, box-shadow 0.3s;
  }

  .check.outer {
    border-radius: 0.375rem 0 0.375rem 0.375rem;
  }

  .outer.selected {
    width: 1.5rem;
    height: 1.5rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
  }
</style>
