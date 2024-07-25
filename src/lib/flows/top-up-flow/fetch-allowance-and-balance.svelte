<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet/wallet.store';
  import { fetchBalance } from '$lib/utils/erc20';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';
  import { getAllowance } from '$lib/utils/sdk/address-driver/address-driver';
  import type { OxString } from '$lib/utils/sdk/sdk-types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  async function updateContext() {
    const { tokenAddress } = $context;

    const { address, provider } = $wallet;
    assert(address && tokenAddress);

    const allowance = await getAllowance(tokenAddress as OxString);
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
