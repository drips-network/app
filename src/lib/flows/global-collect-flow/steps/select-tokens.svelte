<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Token from '$lib/components/token/token.svelte';
  import modal from '$lib/stores/modal';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import batchCollect from '../batch-collect';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let splittable: {
    tokenAddress: string;
    amount: bigint;
  }[];

  function getListItemDescription(amount: Amount) {
    const token = tokensStore.getByAddress(amount.tokenAddress);

    return token
      ? `${formatTokenAmount(amount.amount, token.info.decimals, 1n, false)} ${token.info.symbol}`
      : '';
  }

  $: selectorItems =
    $tokensStore &&
    Object.fromEntries(
      mapFilterUndefined(splittable ?? [], (s) => [
        s.tokenAddress,
        {
          type: 'selectable' as const,
          text: getListItemDescription(s),
          label: {
            component: Token,
            props: {
              address: s.tokenAddress,
            },
          },
        },
      ]),
    );

  let selected = splittable.map((s) => s.tokenAddress) ?? [];

  function submit() {
    batchCollect(selected, dispatch);
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🫗"
    headline="Collect funds"
    description="Choose which of your tokens you’d like to collect."
  />
  <div class="list-container">
    {#if selectorItems}
      <ListSelect bind:selected searchable={false} multiselect={true} items={selectorItems} />
    {/if}
  </div>
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide} variant="ghost">Never mind</Button>
    <Button on:click={submit} icon={Wallet} disabled={selected.length === 0} variant="primary"
      >Confirm in wallet</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    min-height: 3.5rem;
    max-height: 14rem;
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
    box-shadow: var(--elevation-low);
  }
</style>
