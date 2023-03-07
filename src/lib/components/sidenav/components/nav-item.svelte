<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let title: string;
  export let path: string;
  export let icon: typeof SvelteComponent;
  export let selected = false;
  export let collapsed = false;

  let hover = false;
</script>

<a
  class="nav-item"
  class:collapsed
  href={path}
  class:selected={selected || hover}
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => (hover = false)}
>
  <div class="background" />
  <div class="content">
    <svelte:component
      this={icon}
      style={(selected || hover ? 'fill: #fff;' : 'fill: var(--color-foreground-level-5);') +
        ' transition: fill 0.3s;'}
    />
    <h4>{title}</h4>
  </div>
</a>

<style>
  .nav-item {
    display: block;
    border-radius: 2rem 0 2rem 2rem;
    padding: 0 12px;
    align-items: center;
    transition: background 0.3s;
    height: 48px;
    width: 208px;
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
    transition: width 0.3s;
  }

  .nav-item.collapsed {
    width: 48px;
  }

  .nav-item > .content {
    display: flex;
    gap: 12px;
    z-index: 1;
    align-items: center;
  }

  .nav-item > .background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: var(--color-primary);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 0;
  }

  .nav-item.selected > .background {
    opacity: 1;
  }

  .nav-item h4 {
    color: var(--color-foreground-level-5);
    transition: color 0.3s;
    width: 148px;
  }

  .nav-item.selected h4 {
    color: #fff;
  }
</style>
