<script>
  import wallet from '$lib/stores/wallet';
  import CrossIcon from 'radicle-design-system/icons/CrossSmall.svelte';
  import Button from '../button/button.svelte';
</script>

Account menu placeholder
<Button icon={CrossIcon} on:click={wallet.disconnect}>Disconnect wallet</Button>
