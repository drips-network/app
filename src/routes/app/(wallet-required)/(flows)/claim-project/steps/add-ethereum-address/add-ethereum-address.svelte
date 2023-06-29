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
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import assert from '$lib/utils/assert';
  import ethAddressItem from '$lib/components/list-editor/item-templates/eth-address';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  function verify() {
    dispatch('await', {
      promise: () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            const { address } = $walletStore;
            assert(address);

            const addressInMaintainers = $context.maintainerSplits.items[address];
            const maintainersListEmpty = Object.keys($context.maintainerSplits.items).length === 0;

            if (!addressInMaintainers && maintainersListEmpty) {
              $context.maintainerSplits.items = {
                [address]: ethAddressItem(address),
              };

              $context.maintainerSplits.selected = [address];

              $context.maintainerSplits.percentages = {
                [address]: 100,
              };
            }

            resolve();
          }, 1000);
        }),
      message: 'Verifying...',
      subtitle:
        'We’re scanning your git project’s main branch for a drips.json file with your Ethereum address',
    });
  }

  let checked = false;
  $: formValid = $walletStore.connected && checked;
</script>

<StandaloneFlowStepLayout
  headline="Verify project ownership"
  description="To verify you are the owner of this project, please add a funding.json file with your Ethereum address to the root of your code repo. "
>
  <CodeBox path="./funding.json" code={dripsJsonTemplate($walletStore.address ?? unreachable())} />
  <Checkbox bind:checked label="I added the funding.json file to the root of my repo." />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={VerifiedIcon} variant="primary" on:click={verify}
      >Verify now</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
