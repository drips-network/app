<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import type { Writable } from 'svelte/store';
  import Splits, { mapSplitsFromListEditorData } from '$lib/components/splits/splits.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { State } from '../edit-project-splits-steps';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { getCallerClient } from '$lib/utils/get-drips-clients';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: dependencyRepresentationalSplits = mapSplitsFromListEditorData(
    $context.dependencySplits.items,
    $context.dependencySplits.weights,
    $context.highLevelPercentages['dependencies'],
  );

  $: maintainerRepresentationalSplits = mapSplitsFromListEditorData(
    $context.maintainerSplits.items,
    $context.maintainerSplits.weights,
    $context.highLevelPercentages['maintainers'],
  );

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const batch = await gitProjectService.buildUpdateSplitsBatchTx(
            $context.projectAccountId,
            $context.highLevelPercentages,
            $context.maintainerSplits,
            $context.dependencySplits,
          );

          const callerClient = await getCallerClient();
          const tx = await callerClient.populateCallBatchedTx(batch);

          return {
            tx,
          };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: false,
          },
        ],
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    headline="Review"
    description="Double-check your new project splits then confirm in your wallet."
  />
  <FormField type="div" title="Split funds with">
    <div class="card">
      <div class="drip-icon">
        <Drip />
      </div>
      <div class="splits-component">
        <Splits
          list={[
            {
              __typename: 'SplitGroup',
              name: 'Dependencies',
              list: dependencyRepresentationalSplits,
            },
            {
              __typename: 'SplitGroup',
              name: 'Maintainers',
              list: maintainerRepresentationalSplits,
            },
          ]}
        />
      </div>
    </div>
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button icon={WalletIcon} variant="primary" on:click={submit}
      >Confirm changes in your wallet</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    overflow: scroll;
  }

  .drip-icon {
    width: 1.5rem;
  }

  .splits-component {
    margin-left: 10px;
  }
</style>
