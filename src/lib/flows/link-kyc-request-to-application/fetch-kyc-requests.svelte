<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getKycRequestsForRound } from '$lib/utils/rpgf/rpgf';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './link-kyc-request-to-application-flow';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
    roundId: string;
  }

  let { context, roundId }: Props = $props();

  onMount(() => {
    dispatch('await', {
      message: 'Fetching KYC information...',
      promise: async () => {
        const requests = await getKycRequestsForRound(undefined, roundId);

        $context.kycRequests = requests;
      },
    });
  });
</script>
