<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChevronDown from '../icons/ChevronDown.svelte';
  import { page } from '$app/stores';




  interface Props {
    dropdown?: boolean;
    tonedDown?: boolean;
    dropdownActive?: boolean;
    href?: string | null;
    elem?: HTMLAnchorElement | HTMLButtonElement | null;
    children?: import('svelte').Snippet;
  }

  let {
    dropdown = false,
    tonedDown = false,
    dropdownActive = false,
    href = null,
    elem = $bindable(null),
    children
  }: Props = $props();

  let element: HTMLDivElement = $state();

  const dispatch = createEventDispatcher<{ activate: Element; navigate: void }>();

  function handleHover() {
    dispatch('activate', element);
  }

  function handleClick() {
    if (href) {
      dispatch('navigate');
    }
  }

  let current = $derived(href && $page.url.pathname.includes(href));
  let externalLink = $derived(href && href.startsWith('http'));
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
  onmouseenter={handleHover}
  onfocus={handleHover}
  onclick={handleClick}
  target={externalLink ? '_blank' : undefined}
  rel={externalLink ? 'noopener noreferrer' : undefined}
>
  <div
    class="content"
    style:color={current ? 'var(--color-primary)' : 'var(--color-foreground)'}
    bind:this={element}
  >
    {@render children?.()}
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
