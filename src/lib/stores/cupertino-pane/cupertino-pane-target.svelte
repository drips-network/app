<script lang="ts">
  import { onNavigate } from '$app/navigation';
  import cupertinoPaneStore from './cupertino-pane.store';

  onNavigate(() => {
    cupertinoPaneStore.closeSheet();
  });
</script>

<div id="cupertino-pane">
  <div class="inner">
    <div class="dragger"></div>
    {#if $cupertinoPaneStore.component}
      {@const SvelteComponent = $cupertinoPaneStore.component}
      <div class="content">
        <SvelteComponent {...$cupertinoPaneStore.props} />
      </div>
    {/if}
  </div>
</div>

<style>
  #cupertino-pane {
    display: none;
    background-color: var(--color-background);
    border-radius: 1rem 1rem 0 0;
    color: var(--color-foreground);
  }

  #cupertino-pane > .inner {
    padding: 0 0.5rem;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.cupertino-pane-wrapper .pane) {
    padding-bottom: 1rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
  }

  :global(.cupertino-pane-wrapper) {
    z-index: 200;
  }

  .dragger {
    width: 3rem;
    height: 0.25rem;
    background-color: var(--color-foreground-level-3);
    border-radius: 0.25rem;
    margin: 0 auto;
    margin-bottom: 0.75rem;
  }
</style>
