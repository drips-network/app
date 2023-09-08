<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: dependencyRepresentationalSplits = mapSplitsFromListEditorData(
    $context.dependencySplits.items,
    $context.dependencySplits.percentages,
    $context.highLevelPercentages['dependencies'],
  );

  $: maintainerRepresentationalSplits = mapSplitsFromListEditorData(
    $context.maintainerSplits.items,
    $context.maintainerSplits.percentages,
    $context.highLevelPercentages['maintainers'],
  );

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const batch = await gitProjectService.buildUpdateSplitsBatchTx(
            $context.project.repoDriverAccount.accountId,
            $context.highLevelPercentages,
            $context.maintainerSplits,
            $context.dependencySplits,
          );

          return {
            callerClient: await getCallerClient(),
            batch,
          };
        },
        transactions: ({ callerClient, batch }) => ({
          transaction: () => callerClient.callBatched(batch),
        }),
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    headline="Review"
    description="Please double-check your new Project Splits and confirm in your wallet."
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
              type: 'split-group',
              name: 'Dependencies',
              list: dependencyRepresentationalSplits,
            },
            {
              type: 'split-group',
              name: 'Maintainers',
              list: maintainerRepresentationalSplits,
            },
          ]}
        />
      </div>
    </div>
  </FormField>
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
  }

  .drip-icon {
    width: 1.5rem;
  }

  .splits-component {
    margin-left: 10px;
  }
</style>
