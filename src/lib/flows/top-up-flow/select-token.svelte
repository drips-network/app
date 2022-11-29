<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Token from '$lib/components/token/token.svelte';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet';
  import fetchErc20Balance from '$lib/utils/fetch-erc20-balance';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';
  import assert from '$lib/utils/assert';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  let tokenList: Items;
  $: tokenList = Object.fromEntries(
    $tokens?.map((token) => [
      token.info.address,
      {
        type: 'selectable',
        label: token.info.name,
        text: token.info.symbol,
        image: {
          component: Token,
          props: {
            show: 'none',
            address: token.info.address,
            size: 'small',
          },
        },
      },
    ]) ?? [],
  );

  let selected: string[] = [];
  $: selectedToken = selected[0] ? tokens.getByAddress(selected[0]) : undefined;

  async function updateContext() {
    const tokenAddress = selected[0];

    const { address, provider } = $wallet;
    assert(address);

    const allowance = await (await getAddressDriverClient()).getAllowance(tokenAddress);
    const balance = await fetchErc20Balance(tokenAddress, address, provider);

    context.update((c) => ({
      ...c,
      tokenAddress,
      tokenAllowance: allowance,
      tokenBalance: balance,
    }));
  }

  function submit() {
    dispatch('await', {
      message: `Checking ${selectedToken?.info.name ?? ''} allowance…`,
      promise: () => updateContext(),
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💸"
    headline="Add token"
    description="Add any ERC-20 token to your Drips account in order to start streaming."
  />
  <FormField title="Select token">
    <div class="list-container">
      <ListSelect bind:selected items={tokenList} />
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button disabled={selected.length !== 1} on:click={submit}
      >Add {selectedToken?.info.name ?? ''}</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    height: 24rem;
    border: 2px solid var(--color-foreground-level-1);
    border-radius: 0.5rem;
    overflow: scroll;
  }
</style>
