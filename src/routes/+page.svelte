<script lang="ts">
  import { goto } from '$app/navigation';
  import wallet from '$lib/stores/wallet';
  import Emoji from 'radicle-design-system/Emoji.svelte';

  $: {
    if ($wallet.connected) goto('/dashboard');
  }
</script>

<div class="welcome-page">
  <Emoji size="huge" emoji="🌐" />
  <div class="content">
    <h1>Connect to Drips</h1>
    <p>Connect your wallet to view your Dashboard.</p>
  </div>
</div>

<style>
  .welcome-page {
    height: 100%;
    padding: 30vh 0;
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-direction: column;
    align-items: center;
  }

  .content {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-direction: column;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
