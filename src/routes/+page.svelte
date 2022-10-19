<script lang="ts">
  import { goto } from '$app/navigation';
  import wallet from '$lib/stores/wallet';

  $: {
    if ($wallet.connected) goto('/dashboard');
  }
</script>

<h1>Welcome page</h1>
<p>
  This page will urge the user to connect their wallet if they haven't yet, wait for all the stores
  to be ready and then forward to the dashboard
</p>
<a href="/component-showcase" sveltekit:prefetch>Go to component showcase</a>
