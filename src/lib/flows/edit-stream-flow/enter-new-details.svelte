<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const EDIT_STREAM_FLOW_STREAM = gql`
    fragment EditStreamFlowStream on Stream {
      id
      name
      isPaused
      config {
        dripId
        startDate
        durationSeconds
        amountPerSecond {
          tokenAddress
          amount
        }
      }
      receiver {
        ... on User {
          account {
            accountId
          }
        }
        ... on DripList {
          account {
            accountId
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { createEventDispatcher } from 'svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import modal from '$lib/stores/modal';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import type { EditStreamFlowState } from './edit-stream-flow-state';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import type { EditStreamFlowStreamFragment } from './__generated__/gql.generated';
  import { buildEditStreamBatch } from '$lib/utils/streams/streams';
  import assert from '$lib/utils/assert';
  import { waitForAccountMetadata } from '$lib/utils/ipfs';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { populateCallerWriteTx } from '$lib/utils/sdk/caller/caller';
  import txToCallerCall from '$lib/utils/sdk/utils/tx-to-caller-call';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: EditStreamFlowStreamFragment;

  export let context: Writable<EditStreamFlowState>;

  const token = tokens.getByAddress(stream.config.amountPerSecond.tokenAddress) ?? unreachable();

  $: amountLocked = stream.isPaused === true;

  $: newAmountValueParsed = $context.newAmountValue
    ? parseTokenAmount(
        $context.newAmountValue,
        token.info.decimals + contractConstants.AMT_PER_SEC_EXTRA_DECIMALS,
      )
    : undefined;

  $: newAmountPerSecond = newAmountValueParsed
    ? newAmountValueParsed / BigInt($context.newSelectedMultiplier)
    : undefined;

  $: amountValidationState = validateAmtPerSecInput(newAmountPerSecond);

  $: nameUpdated = $context.newName !== stream.name;
  $: amountUpdated =
    newAmountPerSecond?.toString() !== stream.config.amountPerSecond.amount.toString();
  $: canUpdate =
    newAmountValueParsed &&
    $context.newName &&
    (nameUpdated || amountUpdated) &&
    amountValidationState?.type === 'valid';

  function updateStream() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Edit stream',
        before: async () => {
          const { newHash, batch } = await buildEditStreamBatch(stream.id, {
            name: nameUpdated ? $context.newName : undefined,
            amountPerSecond: amountUpdated ? newAmountPerSecond : undefined,
          });

          return {
            batch,
            newHash,
            needGasBuffer: amountUpdated,
          };
        },

        transactions: async ({ batch, needGasBuffer }) => [
          {
            transaction:
              batch.length === 1
                ? batch[0]
                : await populateCallerWriteTx({
                    functionName: 'callBatched',
                    args: [batch.map(txToCallerCall)],
                  }),
            applyGasBuffer: needGasBuffer,
            title: 'Edit the stream',
          },
        ],

        after: async (_, { newHash }) => {
          if (!newHash) return;

          const { dripsAccountId } = $walletStore;
          assert(dripsAccountId);

          await waitForAccountMetadata(dripsAccountId, newHash);

          await invalidateAll();
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader headline="Edit stream" description="Set a new name or edit the stream rate." />
  <FormField title="New name*">
    <TextInput bind:value={$context.newName} />
  </FormField>
  <div class="form-row">
    <FormField title="New stream rate*" disabled={amountLocked}>
      <TextInput
        suffix={token.info.symbol}
        bind:value={$context.newAmountValue}
        variant={{ type: 'number', min: 0 }}
        placeholder="Amount"
        validationState={amountValidationState}
        disabled={amountLocked}
      />
    </FormField>
    <FormField title="Amount per*" disabled={amountLocked}>
      <Dropdown
        disabled={amountLocked}
        bind:value={$context.newSelectedMultiplier}
        options={[
          {
            value: '1',
            title: 'second',
          },
          {
            value: '60',
            title: 'minute',
          },
          {
            value: '3600',
            title: 'hour',
          },
          {
            value: '86400',
            title: 'day',
          },
          {
            value: '604800',
            title: 'week',
          },
          {
            value: '2592000',
            title: '30 days',
          },
          {
            value: '31536000',
            title: '365 days',
          },
        ]}
      />
    </FormField>
  </div>
  {#if amountLocked}
    <p class="typo-text">Currently, the stream rate can not be edited for paused streams.</p>
  {/if}
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide} variant="ghost">Cancel</Button>
    <Button variant="primary" icon={Wallet} on:click={updateStream} disabled={!canUpdate}
      >Confirm changes</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .form-row {
    display: flex;
    gap: 1rem;
  }

  p {
    color: var(--color-foreground-level-5);
    text-align: left;
  }
</style>
