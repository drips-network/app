<script lang="ts" module>
  type Actions = { icon: Component; handler: () => void }[];

  export type ActionsCellProps = {
    actions: Actions;
  };
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { Component } from 'svelte';

  interface Props {
    actions: Actions;
  }

  let { actions }: Props = $props();
</script>

<div class="actions">
  {#each actions as action}
    <Button onclick={action.handler} icon={action.icon} />
  {/each}
</div>

<style>
  .actions {
    width: 100%;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
