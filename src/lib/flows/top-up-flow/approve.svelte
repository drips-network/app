<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { ethers } from 'ethers';
  import Button from '$lib/components/button/button.svelte';
  import modal from '$lib/stores/modal';
  import Emoji from '$lib/components/emoji/Emoji.svelte';
  import etherscanLink from '$lib/utils/etherscan-link';
  import wallet from '$lib/stores/wallet';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  $: tokenAddress = $context.tokenAddress;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) : undefined;

  async function approve(updateAwaitStep: UpdateAwaitStepFn) {
    if (!tokenAddress) throw new Error('Undefined token address on approve step');
    const tx = await (await getAddressDriverClient()).approve(tokenAddress);

    updateAwaitStep({
      message: 'Waiting for the approval transaction to be confirmed…',
      link: {
        label: 'View on Etherscan',
        url: etherscanLink($wallet.network.name, tx.hash),
      },
    });

    await tx.wait();

    context.update((c) => ({
      ...c,
      tokenAllowance: ethers.constants.MaxUint256.toBigInt(),
    }));

    modal.setHideable(true);
  }

  function submit() {
    modal.setHideable(false);

    dispatch('await', {
      message: 'Waiting for you to confirm the approval transaction in your wallet',
      icon: {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      },
      promise: approve,
    });
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
