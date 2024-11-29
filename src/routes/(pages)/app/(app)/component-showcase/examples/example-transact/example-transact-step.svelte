<script lang="ts">
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  onMount(() => {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Test transaction',

        before: async () => {
          const { signer } = $walletStore;
          assert(signer, 'need to connect a wallet for test TX');

          const tx = await signer.populateTransaction({
            to: '0x0000000000000000000000000000000000000000',
            value: 0,
          });

          return { tx };
        },

        transactions: ({ tx }) => [
          {
            external: true,
            title: 'Waiting for something...',
            expectedDurationMs: 15000,
            expectedDurationText: 'Usually < 1.5 minutes',
            promise: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10000));
            },
          },
          {
            transaction: tx,
            applyGasBuffer: false,
            title: 'Send 0 ETH to 0x',
          },
          {
            external: true,
            title: 'Waiting for something else...',
            expectedDurationMs: 15000,
            expectedDurationText: 'Usually < 1.5 minutes',
            promise: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10000));
            },
          },
        ],
      }),
    );
  });
</script>
