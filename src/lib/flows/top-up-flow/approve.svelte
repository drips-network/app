<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import { ethers, MaxUint256 } from 'ethers';
  import Button from '$lib/components/button/button.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import unreachable from '$lib/utils/unreachable';
  import { populateApproveTx } from '$lib/utils/sdk/erc20/erc20';
  import type { OxString } from '$lib/utils/sdk/sdk-types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  $: tokenAddress = $context.tokenAddress;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) : undefined;

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        transactions: async () => {
          return [
            {
              transaction: await populateApproveTx(
                (tokenAddress as OxString) ?? unreachable(),
                (tokenAddress as OxString) ?? unreachable(),
                MaxUint256,
              ),
              applyGasBuffer: false,
            },
          ];
        },
        after: async () => {
          context.update((c) => ({
            ...c,
            tokenAllowance: ethers.MaxUint256,
          }));
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🔐"
    headline="Approve token spend"
    description={`Please grant your Drips account access to your ${
      tokenInfo?.info.name ?? ''
    } funds by executing this transaction.`}
  />
  <svelte:fragment slot="actions">
    <Button variant="primary" on:click={submit}>Trigger approve transaction</Button>
  </svelte:fragment>
</StepLayout>
