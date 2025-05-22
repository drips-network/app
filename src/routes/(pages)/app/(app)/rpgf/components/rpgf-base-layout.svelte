<div class="rpgf-base-layout">
  <aside>
    <div class="sidebar-inner">
      <slot name="sidebar" />
    </div>
  </aside>
  <div class="header">
    <slot name="header" />
  </div>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .rpgf-base-layout {
    display: grid;
    grid-template-columns: 3fr minmax(auto, 19rem);
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'header sidebar'
      'content sidebar';
    gap: 1.5rem;
  }

  aside {
    grid-area: sidebar;
    view-transition-name: rpgf-base-layout-sidebar;
  }

  .sidebar-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: 6.5rem;
  }

  .header {
    grid-area: header;
  }

  @media (max-width: 1024px) {
    .rpgf-base-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas:
        'header'
        'sidebar'
        'content';
    }
  }
</style>
