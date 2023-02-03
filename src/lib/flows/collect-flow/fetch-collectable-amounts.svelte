<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import {
    getAddressDriverClient,
    getDripsHubClient,
    getSubgraphClient,
  } from '$lib/utils/get-drips-clients';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { CollectFlowState } from './collect-flow-state';
  import balances from '$lib/stores/balances';
  import tuple from '$lib/utils/tuple';
  import unreachable from '$lib/utils/unreachable';
  import wallet from '$lib/stores/wallet/wallet.store';

  export let context: Writable<CollectFlowState>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  async function fetchBalancesAndSplits() {
    const dripsHubClient = await getDripsHubClient();
    const driverClient = await getAddressDriverClient();
    const subgraphClient = getSubgraphClient();
    const userId = await driverClient.getUserId();

    const calls = tuple(
      await dripsHubClient.getReceivableBalanceForUser(
        userId,
        $context.tokenAddress ?? unreachable(),
        100,
      ),
      dripsHubClient.getSplittableBalanceForUser(userId, $context.tokenAddress ?? unreachable()),
      dripsHubClient.getCollectableBalanceForUser(userId, $context.tokenAddress ?? unreachable()),
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
    const client = await getDripsHubClient();

    const cycleDurationMillis = (await client.cycleSecs()) * 1000;
    const currentCycleMillis = new Date().getTime() % cycleDurationMillis;
    const currentCycleStart = new Date().getTime() - currentCycleMillis;

    const { splittable, collectable, receivable, ownSplitsWeight, splitsConfig } =
      await fetchBalancesAndSplits();

    context.update((c) => ({
      ...c,
      currentDripsCycle: {
        start: new Date(currentCycleStart),
        durationMillis: cycleDurationMillis,
      },
      balances: {
        splittable: splittable.splittableAmount,
        collectable: collectable.collectableAmount,
        receivable: receivable.receivableAmount,
      },
      ownSplitsWeight,
      splitsConfig,
    }));
  }

  async function updateCollectable() {
    await balances.updateBalances($wallet.dripsUserId ?? unreachable());
  }

  async function promise() {
    await updateContext();
    await updateCollectable();
  }

  onMount(() =>
    dispatch('await', {
      promise,
      message: 'Fetching collectable amounts…',
    }),
  );
</script>
