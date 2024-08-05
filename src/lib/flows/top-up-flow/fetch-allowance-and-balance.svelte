<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';
  import { getAddressDriverAllowance } from '$lib/utils/sdk/address-driver/address-driver';
  import type { OxString } from '$lib/utils/sdk/sdk-types';
  import { executeErc20ReadMethod } from '$lib/utils/sdk/erc20/erc20';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  async function updateContext() {
    const { tokenAddress } = $context;

    const { address } = $wallet;
    assert(address && tokenAddress);

    const allowance = await getAddressDriverAllowance(tokenAddress as OxString);
    const balance = await executeErc20ReadMethod({
      functionName: 'balanceOf',
      token: tokenAddress as OxString,
      args: [address as OxString],
    });

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
