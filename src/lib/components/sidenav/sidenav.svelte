<script lang="ts">
  import NavItem from './components/nav-item.svelte';
  import type { SvelteComponent } from 'svelte';
  import { page } from '$app/stores';

  interface Item {
    title: string;
    path: string;
    icon: typeof SvelteComponent;
  }

  export let navItems: {
    top: Item[];
    bottom: Item[];
  };

  function isSelected(path: string): boolean {
    return $page.url.pathname.startsWith(path);
  }

  export let collapsed = false;
</script>

<div class="sidebar">
  <nav>
    <div class="top">
      {#each navItems.top as item}
        <NavItem
          title={item.title}
          path={item && item.path}
          icon={item.icon}
          selected={$page && isSelected(item.path)}
          {collapsed}
        />
      {/each}
    </div>
    <div class="bottom">
      {#each navItems.bottom as item}
        <NavItem
          title={item.title}
          path={item && item.path}
          icon={item.icon}
          selected={$page.url.pathname === item.path}
          {collapsed}
        />
      {/each}
    </div>
  </nav>
</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  nav > * {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
