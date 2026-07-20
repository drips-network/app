<script lang="ts">
  import ActionableEmptyState from './actionable-empty-state.svelte';

  interface Props {
    emoji?: string;
    headline?: string | undefined;
    text?: string | undefined;
    requireRpgfSignIn?: boolean;
  }

  let {
    emoji = '🫙',
    headline = 'You are disconnected',
    text = 'Please connect your wallet to see this section.',
    requireRpgfSignIn = false,
  }: Props = $props();
</script>

<ActionableEmptyState {emoji} {headline} description={text}>
  {#snippet actions()}
    <!-- Imported lazily: the actions need the wallet store, which must stay out
         of the static import graph of every page that renders a Section. -->
    {#await import('./disconnected-state-actions.svelte') then { default: Actions }}
      <Actions {requireRpgfSignIn} />
    {/await}
  {/snippet}
</ActionableEmptyState>
