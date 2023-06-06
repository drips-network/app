<script lang="ts">
  import CodeBox from '$lib/components/code-box/code-box.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import dripsJsonTemplate from './drips-json-template';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import VerifiedIcon from 'radicle-design-system/icons/Registered.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  const formValid = true;

  function verify() {
    dispatch('await', {
      promise: () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        }),
      message: 'Verifying...',
      subtitle:
        'We’re scanning your git project’s main branch for a drips.json file with your Ethereum address',
    });
  }
</script>

<StandaloneFlowStepLayout
  headline="Verify project ownership"
  description="To verify you are the owner of this project, please add a funding.json file with your Ethereum address to the root of your code repo. "
>
  <CodeBox path="./funding.json" code={dripsJsonTemplate($walletStore.address ?? unreachable())} />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={VerifiedIcon} variant="primary" on:click={verify}
      >Verify now</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
