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
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';

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
            hideName: true,
            address: token.info.address,
            small: true,
          },
        },
      },
    ]) ?? [],
  );

  let selected: string[] = [];
  $: selectedToken = selected[0] ? tokens.getByAddress(selected[0]) : undefined;

  async function updateContext() {
    const tokenAddress = selected[0];

    const allowance = await (await getAddressDriverClient()).getAllowance(tokenAddress);

    context.update((c) => ({
      ...c,
      tokenAddress,
      tokenAllowance: allowance,
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
    headline="Top up"
    description="Add funds to your Drips account in order to start streaming."
  />
  <FormField title="Select token">
    <div class="list-container">
      <ListSelect bind:selected items={tokenList} />
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button disabled={selected.length !== 1} on:click={submit}
      >Top up {selectedToken?.info.name ?? ''}</Button
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
