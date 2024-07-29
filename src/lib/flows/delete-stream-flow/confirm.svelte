<script lang="ts" context="module">
  export const DELETE_STREAM_CONFIRM_STEP_STREAM_FRAGMENT = gql`
    fragment DeleteStreamConfirmStep on Stream {
      id
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { buildStreamDeleteBatchTx } from '$lib/utils/streams/streams';
  import { gql } from 'graphql-request';
  import type { DeleteStreamConfirmStepFragment } from './__generated__/gql.generated';
  import assert from '$lib/utils/assert';
  import { waitForAccountMetadata } from '$lib/utils/ipfs';
  import { goto } from '$app/navigation';
  import { populateCallerWriteTx } from '$lib/utils/sdk/caller/caller';
  import txToCallerCall from '$lib/utils/sdk/utils/tx-to-caller-call';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: DeleteStreamConfirmStepFragment;

  function startDeleting() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { signer } = $walletStore;
          assert(signer);

          const { batch, newHash } = await buildStreamDeleteBatchTx(signer, stream.id);

          return {
            batch,
            newHash,
          };
        },

        transactions: async ({ batch }) => [
          {
            transaction: await populateCallerWriteTx({
              functionName: 'callBatched',
              args: [batch.map(txToCallerCall)],
            }),
            applyGasBuffer: true,
          },
        ],

        after: async (_, { newHash }) => {
          const { dripsAccountId } = $walletStore;
          assert(dripsAccountId);

          await waitForAccountMetadata(dripsAccountId, newHash);

          await goto('/funds');
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💀"
    headline="Delete stream"
    description="Are you sure that you want to delete this stream? It will immediately stop streaming, and be irreversibly erased."
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button on:click={startDeleting} variant="destructive">Delete stream</Button>
  </svelte:fragment>
</StepLayout>
