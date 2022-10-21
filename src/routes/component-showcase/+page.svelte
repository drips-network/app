<script lang="ts">
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import ThumbsUp from 'radicle-design-system/icons/ThumbsUp.svelte';
  import User from 'radicle-design-system/icons/User.svelte';
  import EyeOpen from 'radicle-design-system/icons/EyeOpen.svelte';

  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items as ListItems } from '$lib/components/list-select/list-select.types';
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Amount from '$lib/components/amount/amount.svelte';
  import ExampleTable from './examples/example-table.svelte';

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

  // Amount
  let amount = '1000000000000000000';
  let tokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
</script>

<h1>Component showcase</h1>

<div class="showcase-item">
  <h2>Button</h2>
  <div>
    <input id="button-disabled-checkbox" type="checkbox" bind:checked={disabled} />
    <label for="button-disabled-checkbox">Disabled</label>
  </div>
  <Button {disabled} icon={PlusIcon}>Example button</Button>
</div>

<div class="showcase-item">
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
    <ListSelect
      items={exampleListItems}
      bind:selected={selectedTokens}
      {searchable}
      {multiselect}
    />
  </div>
</div>

<div class="showcase-item">
  <h2>Section header</h2>
  <SectionHeader
    label="Hello"
    icon={ThumbsUp}
    actions={[
      {
        label: 'Trigger existential crisis',
        icon: User,
        handler: () => undefined,
      },
      {
        label: 'Witness',
        icon: EyeOpen,
        handler: () => undefined,
      },
    ]}
  />
</div>

<div class="showcase-item">
  <h2>Amount</h2>
  <p>Amount</p>
  <TextInput bind:value={amount} />
  <p>Token Address</p>
  <TextInput bind:value={tokenAddress} />
  <p>Output:</p>
  <Amount amount={BigInt(amount)} {tokenAddress} />
</div>

<div class="showcase-item">
  <h2>Table</h2>
  <ExampleTable />
</div>

<style>
  h1 {
    color: var(--color-primary);
    margin-bottom: 2rem;
  }

  h2 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  p,
  label {
    color: var(--color-foreground-level-6);
  }

  .list-container {
    margin-top: 1rem;
    width: 32rem;
    height: 32rem;
    overflow: scroll;
    border: 0.125rem solid var(--color-foreground-level-2);
    border-radius: 0.5rem;
  }

  .showcase-item {
    margin-bottom: 3rem;
  }
</style>
