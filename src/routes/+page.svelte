<script lang="ts">
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';

  import ConnectButton from '$lib/components/connect-button/connect-button.svelte';
  import ens from '$lib/stores/ens';
  import walletStore from '$lib/stores/wallet';
  import Button from '$lib/components/button/button.svelte';

  // Button
  let disabled = false;
</script>

<h1 class="typo-header-1">Hello new Drips app!</h1>
<ConnectButton />
{#if $walletStore?.connected}
  <p>Current address: {$walletStore.address}</p>
  <p>ENS: {$ens[$walletStore.address]?.name ?? 'None'}</p>
{/if}

<h1>Component showcase</h1>

<h2>Button</h2>
<div>
  <input id="button-disabled-checkbox" type="checkbox" bind:checked={disabled} />
  <label for="button-disabled-checkbox">Disabled</label>
</div>
<Button {disabled} icon={PlusIcon}>Example button</Button>

<style>
  h1 {
    color: var(--color-primary);
    margin-top: 4rem;
  }

  h2 {
    color: var(--color-primary);
    margin-top: 2rem;
  }

  p,
  label {
    color: var(--color-foreground-level-6);
  }
</style>
