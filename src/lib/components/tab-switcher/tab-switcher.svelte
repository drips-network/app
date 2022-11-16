<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let options: string[] = [];

  let selectedIndex = 0;

  $: {
    dispatch('change', selectedIndex);
  }
</script>

<div class="border-2 rounded p-1" style="border-color:var(--color-foreground-level-1)">
  <div class="relative flex w-full">
    {#each options as option, index}
      <button
        class="relative z-10 flex-1 h-10 flex items-center justify-center typo-text-bold"
        on:click={() => {
          selectedIndex = index;
        }}
      >
        {option}
      </button>
    {/each}
    <!-- highlighter -->
    <div
      class="absolute top-0 left-0 h-full rounded transition-transform duration-150"
      style="background: var(--color-primary); width:calc(100% / {options.length}); transform: translateX(calc(100% * {selectedIndex})"
    />
  </div>
</div>
