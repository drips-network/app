<script lang="ts">
  import SearchIcon from '$lib/components/icons/MagnifyingGlass.svelte';
  import CloseIcon from '$lib/components/icons/CrossSmall.svelte';

  import { sineInOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ closeSearch: void }>();

  let searchTerm: string | undefined;

  let searchElem: HTMLDivElement;

  export let small: boolean = false;
  export let searchOpen: boolean = false;
  export let placeholder: string = 'Search claimed projects, Drip Lists and addresses';
</script>

<div
  class="search-bar"
  class:focus={searchOpen}
  class:small
  transition:fly={{ duration: 300, x: 64, easing: sineInOut }}
>
  <div class="search-bar-input-wrapper">
    <SearchIcon style="fill: var(--color-foreground)" />
    <input
      type="text"
      {placeholder}
      bind:this={searchElem}
      bind:value={searchTerm}
      autocomplete="off"
    />
    {#if searchOpen}<div transition:fly={{ duration: 300, y: 4 }}>
        <CloseIcon style="cursor: pointer;" on:click={() => dispatch('closeSearch')} />
      </div>{/if}
  </div>
</div>

<style>
  input {
    height: 2rem;
    width: 100%;
    text-overflow: ellipsis;
  }

  input:focus {
    outline: none;
    text-overflow: ellipsis;
  }

  .search-bar {
    display: block;
    display: flex;
    align-items: center;
    height: 2rem;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    max-width: 32rem;
    width: 100%;
    border: 1px solid var(--color-foreground);
    transition: border 0.3s;
    z-index: 100;
    position: relative;
    transition:
      border 0.3s,
      background-color 0.3s,
      box-shadow 0.3s;
    background-color: var(--color-background);
  }

  .search-bar.focus {
    background-color: var(--color-foreground-level-1);
    box-shadow: var(--elevation-medium);
  }

  .search-bar.small {
    width: 101px;
  }

  .search-bar:hover:not(.focus) {
    box-shadow: var(--elevation-low);
  }

  .search-bar-input-wrapper {
    width: 100%;
    display: flex;
    padding: 0 0.5rem;
    align-items: center;
    gap: 4px;
  }

  @media (max-width: 768px) {
    .search-bar {
      width: calc(100vw - 1rem);
      left: 0.5rem;
    }

    .search-bar-input-wrapper {
      padding: 1rem 0.5rem;
      gap: 0.25rem;
    }
  }
</style>
