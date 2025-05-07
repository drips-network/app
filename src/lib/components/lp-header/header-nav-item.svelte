<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChevronDown from '../icons/ChevronDown.svelte';
  import { page } from '$app/stores';

  export let dropdown = false;
  export let tonedDown: boolean = false;
  export let dropdownActive = false;

  export let href: string | null = null;

  $: current = href && $page.url.pathname.includes(href);

  export let elem: HTMLAnchorElement | HTMLButtonElement | null = null;

  let element: HTMLDivElement;

  const dispatch = createEventDispatcher<{ activate: Element; navigate: void }>();

  function handleHover() {
    dispatch('activate', element);
  }

  function handleClick() {
    if (href) {
      dispatch('navigate');
    }
  }

  $: externalLink = href && href.startsWith('http');
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  bind:this={elem}
  role="button"
  tabindex="0"
  {href}
  class:toned-down={tonedDown}
  class:dropdown-active={dropdownActive}
  class="wrapper typo-text"
  on:mouseenter={handleHover}
  on:focus={handleHover}
  on:click={handleClick}
  target={externalLink ? '_blank' : undefined}
  rel={externalLink ? 'noopener noreferrer' : undefined}
>
  <div
    class="content"
    style:color={current ? 'var(--color-primary)' : 'var(--color-foreground)'}
    bind:this={element}
  >
    <slot />
  </div>
  {#if dropdown}
    <div class="chevron" class:rotate={dropdownActive}>
      <ChevronDown />
    </div>
  {/if}
</svelte:element>

<style>
  .wrapper {
    display: flex;
    gap: 0.125rem;
    transition: opacity 0.3s;
  }

  .wrapper.toned-down {
    opacity: 0.5;
  }

  .wrapper .content {
    transition: color 0.3s;
  }

  .wrapper:hover .content {
    text-decoration: underline;
  }

  .dropdown-active {
    color: var(--color-primary-level-6);
  }

  .chevron {
    transition: transform 0.3s;
  }

  .chevron.rotate {
    transform: rotate(180deg);
  }
</style>
