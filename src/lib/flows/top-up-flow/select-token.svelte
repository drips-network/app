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
  import wallet from '$lib/stores/wallet/wallet.store';
  import { fetchBalance } from '$lib/utils/erc20';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';
  import assert from '$lib/utils/assert';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import addCustomTokenFlowSteps from '../add-custom-token/add-custom-token-flow-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  let tokenList: Items;
  $: tokenList = {
    ...Object.fromEntries(
      $tokens?.map((token) => [
        token.info.address,
        {
          type: 'selectable',
          searchString: [token.info.name, token.info.symbol],
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
    ),
    'add-custom-token': {
      type: 'action',
      label: 'Add custom token',
      handler: () =>
        dispatch('sidestep', {
          steps: addCustomTokenFlowSteps().steps,
        }),
      image: {
        component: Plus,
        props: {},
      },
    },
  };

  let selected: string[] = [];
  $: selectedToken = selected[0] ? tokens.getByAddress(selected[0]) : undefined;

  async function updateContext() {
    const tokenAddress = selected[0];

    const { address, provider } = $wallet;
    assert(address);

    const allowance = await (await getAddressDriverClient()).getAllowance(tokenAddress);
    const balance = await fetchBalance(tokenAddress, address, provider);

    context.update((c) => ({
      ...c,
      tokenAddress,
      tokenAllowance: allowance,
      tokenBalance: balance,
    }));
  }

  function submit() {
    dispatch('await', {
      message: `Fetching your ${selectedToken?.info.name ?? ''} balance...`,
      promise: () => updateContext(),
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💸"
    headline="Add funds"
    description="Add any ERC-20 token to your Drips account in order to start streaming."
  />
  <FormField title="Select token">
    <div class="list-container">
      <ListSelect bind:selected items={tokenList} />
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" disabled={selected.length !== 1} on:click={submit}
      >Add {selectedToken?.info.name ?? ''}</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    height: 24rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
  }
</style>
