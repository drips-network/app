<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import { createEventDispatcher } from 'svelte';
  import assert from '$lib/utils/assert';
  import Token from '$lib/components/token/token.svelte';
  import Button from '$lib/components/button/button.svelte';
  import type { CollectFlowState } from './collect-flow-state';
  import type { Writable } from 'svelte/store';
  import type { StepComponentEvents } from '$lib/components/stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CollectFlowState>;

  let selected: string[] = [];
  $: selectedToken = selected[0] ? tokens.getByAddress(selected[0]) : undefined;

  let tokenList: Items = {};
  $: tokenList = Object.fromEntries(
    $tokens?.map((token) => {
      const { address: tokenAddress } = token.info;

      return [
        tokenAddress,
        {
          type: 'selectable',
          label: token.info.name,
          image: {
            component: Token,
            props: {
              show: 'none',
              address: token.info.address,
              size: 'small',
            },
          },
        },
      ];
    }) ?? [],
  );

  async function updateContext() {
    assert(selectedToken);
    const { info } = selectedToken;

    context.update((c) => ({
      ...c,
      tokenAddress: info.address,
    }));
  }

  function submit() {
    updateContext();
    dispatch('goForward');
  }
</script>

<StepLayout>
  <StepHeader
    emoji="👛"
    headline="Collect"
    description="Select which token balance you'd like to collect earned funds from."
  />
  <FormField title="Token">
    <div class="list-container">
      <ListSelect bind:selected items={tokenList} />
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
    <Button variant="primary" disabled={selected.length !== 1} on:click={submit}
      >Select {selectedToken?.info.name ?? ''}</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    height: 24rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    border-radius: 0.5rem;
    overflow: scroll;
  }
</style>
