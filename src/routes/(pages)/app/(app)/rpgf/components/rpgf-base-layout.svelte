<div class="rpgf-base-layout">
  <aside>
    <slot name="sidebar" />
  </aside>
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
  }
</style>
