<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet';
  import { fetchBalance } from '$lib/utils/erc20';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  async function updateContext() {
    const { tokenAddress } = $context;

    const { address, provider } = $wallet;
    assert(address && tokenAddress);

    const allowance = await (await getAddressDriverClient()).getAllowance(tokenAddress);
    const balance = await fetchBalance(tokenAddress, address, provider);

    context.update((c) => ({
      ...c,
      tokenAddress,
      tokenAllowance: allowance,
      tokenBalance: balance,
    }));
  }

  onMount(() =>
    dispatch('await', {
      message: `Fetching token allowance and balance…`,
      promise: () => updateContext(),
    }),
  );
</script>
