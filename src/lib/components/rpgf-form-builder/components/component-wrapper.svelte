<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import type { ApplicationFormat } from '$lib/utils/rpgf/schemas';
  import { createEventDispatcher, type ComponentType } from 'svelte';

  export const dispatch = createEventDispatcher<{
    moveUp: void;
    moveDown: void;
    deleteItem: void;
    editItem: void;
  }>();

  export let component: ComponentType;
  export let fieldProp: ApplicationFormat[number];
</script>

<div class="component-wrapper">
  <div class="content">
    <svelte:component this={component} field={fieldProp} blockInteraction />
  </div>
  <div class="bottom-row">
    <h5>{fieldProp.type}</h5>
    <div class="settings">
      {#if fieldProp.type !== 'divider'}
        <div>
          <Button size="small" variant="ghost" icon={Pen} on:click={() => dispatch('editItem')} />
        </div>
      {/if}
      <div>
        <Button size="small" variant="ghost" icon={Trash} on:click={() => dispatch('deleteItem')} />
      </div>
      <div>
        <Button size="small" variant="ghost" icon={ArrowUp} on:click={() => dispatch('moveUp')} />
      </div>
      <div>
        <Button
          size="small"
          variant="ghost"
          icon={ArrowDown}
          on:click={() => dispatch('moveDown')}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .component-wrapper {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    user-select: none;
    width: 100%;
    background: var(--color-background);
  }

  .content {
    padding: 1rem;
    pointer-events: none;
  }

  .bottom-row {
    color: var(--color-foreground-level-5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--color-foreground-level-3);
  }

  .bottom-row .settings {
    display: flex;
  }
</style>
