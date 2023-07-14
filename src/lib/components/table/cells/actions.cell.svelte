<script lang="ts" context="module">
  type Actions = { icon: ComponentType; handler: () => void }[];

  export type ActionsCellProps = {
    actions: Actions;
  };
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { ComponentType } from 'svelte';

  export let actions: Actions;
</script>

<div class="actions">
  {#each actions as action}
    <Button on:click={action.handler} icon={action.icon} />
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
