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
  import {
    getAddressDriverClient,
    getDripsHubClient,
    getSubgraphClient,
  } from '$lib/utils/get-drips-clients';
  import tuple from '$lib/utils/tuple';

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

  async function fetchBalancesAndSplits() {
    assert(selectedToken);
    const { address } = selectedToken.info;

    const dripsHubClient = await getDripsHubClient();
    const driverClient = await getAddressDriverClient();
    const subgraphClient = getSubgraphClient();
    const userId = await driverClient.getUserId();

    const calls = tuple(
      await dripsHubClient.getReceivableBalanceForUser(userId, address, 100),
      dripsHubClient.getSplittableBalanceForUser(userId, address),
      dripsHubClient.getCollectableBalanceForUser(userId, address),
      subgraphClient.getSplitsConfigByUserId(userId),
    );

    const [receivable, splittable, collectable, splitsData] = await Promise.all(calls);

    return {
      splittable,
      collectable,
      receivable,
      ownSplitsWeight: 1000000n - splitsData.reduce<bigint>((acc, cur) => acc + cur.weight, 0n),
      splitsConfig: splitsData,
    };
  }

  async function updateContext() {
    assert(selectedToken);
    const { info } = selectedToken;

    const { splittable, collectable, receivable, ownSplitsWeight, splitsConfig } =
      await fetchBalancesAndSplits();

    context.update((c) => ({
      ...c,
      tokenAddress: info.address,
      balances: {
        splittable: splittable.splittableAmount,
        collectable: collectable.collectableAmount,
        receivable: receivable.receivableAmount,
      },
      ownSplitsWeight,
      splitsConfig,
    }));
  }

  function submit() {
    updateContext();
    dispatch('await', {
      promise: updateContext,
      message: 'Fetching collectable balances…',
    });
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
    <Button disabled={selected.length !== 1} on:click={submit}
      >Select {selectedToken?.info.name ?? ''}</Button
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
