<script lang="ts">
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';

  import ConnectButton from '$lib/components/connect-button/connect-button.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import ens from '$lib/stores/ens';
  import walletStore from '$lib/stores/wallet';
  import type { Items as ListItems } from '$lib/components/list-select/list-select.types';
  import Button from '$lib/components/button/button.svelte';

  // Button
  let disabled = false;

  // List Select
  let selectedTokens: string[];
  let searchable = true;
  let multiselect = false;
  let exampleListItems: ListItems = {
    radicle: {
      type: 'selectable',
      label: 'Radicle',
      text: 'RAD',
      image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/6843.png',
    },
    uniswap: {
      type: 'selectable',
      label: 'Uniswap',
      text: 'UNI',
      image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7083.png',
    },
    dai: {
      type: 'selectable',
      label: 'DAI',
      text: 'DAI',
      image: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    'test-action': {
      type: 'action',
      label: 'Add a custom token',
      image: PlusIcon,
      handler: () => undefined,
    },
  };
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

<h2>List Select</h2>
<div>
  <input id="searchable-checkbox" type="checkbox" bind:checked={searchable} />
  <label for="searchable-checkbox">Searchable</label>
</div>
<div>
  <input id="multiselect-checkbox" type="checkbox" bind:checked={multiselect} />
  <label for="multiselect-checkbox">Multi-select</label>
</div>
<p>
  Selected tokens: {selectedTokens}
</p>
<div class="list-container">
  <ListSelect items={exampleListItems} bind:selected={selectedTokens} {searchable} {multiselect} />
</div>

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

  .list-container {
    margin: 3rem;
    width: 32rem;
    height: 32rem;
    overflow: scroll;
    border: 0.125rem solid var(--color-foreground-level-2);
    border-radius: 0.5rem;
  }
</style>
