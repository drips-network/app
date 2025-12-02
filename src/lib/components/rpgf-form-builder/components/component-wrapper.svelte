<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import type { ApplicationFieldDto } from '$lib/utils/rpgf/types/application';
  import { createEventDispatcher, type Component } from 'svelte';

  export const dispatch = createEventDispatcher<{
    moveUp: void;
    moveDown: void;
    deleteItem: void;
    editItem: void;
  }>();

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: Component<any>;
    fieldProp: ApplicationFieldDto;
  }

  let { component: PassedComponent, fieldProp }: Props = $props();
</script>

<div class="component-wrapper">
  <div class="content">
    <PassedComponent field={fieldProp} blockInteraction></PassedComponent>
  </div>
  <div class="bottom-row">
    <h5>{fieldProp.type}</h5>
    <div class="settings">
      {#if fieldProp.type !== 'divider'}
        <div>
          <Button size="small" variant="ghost" icon={Pen} onclick={() => dispatch('editItem')} />
        </div>
      {/if}
      <div>
        <Button size="small" variant="ghost" icon={Trash} onclick={() => dispatch('deleteItem')} />
      </div>
      <div>
        <Button size="small" variant="ghost" icon={ArrowUp} onclick={() => dispatch('moveUp')} />
      </div>
      <div>
        <Button
          size="small"
          variant="ghost"
          icon={ArrowDown}
          onclick={() => dispatch('moveDown')}
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
