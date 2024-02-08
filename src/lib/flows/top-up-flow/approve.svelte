<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import { getERC20TxFactory } from '$lib/utils/get-drips-clients';
  import { constants, ethers } from 'ethers';
  import Button from '$lib/components/button/button.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import unreachable from '$lib/utils/unreachable';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  $: tokenAddress = $context.tokenAddress;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) : undefined;

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        transactions: async () => {
          const txFactory = await getERC20TxFactory(tokenAddress ?? unreachable());

          return [
            {
              transaction: await txFactory.approve(
                tokenAddress ?? unreachable(),
                constants.MaxUint256,
              ),
              applyGasBuffer: false,
            },
          ];
        },
        after: async () => {
          context.update((c) => ({
            ...c,
            tokenAllowance: ethers.constants.MaxUint256.toBigInt(),
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
