<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { castBallot } from '$lib/utils/rpgf/rpgf';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { prepareBallotForSubmission } from '$lib/utils/rpgf/validate-ballot';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let ballot: Writable<InProgressBallot> & {
    clear: () => void;
  };
  export let roundId: string;
  export let round: Round;

  const dispatch = createEventDispatcher<StepComponentEvents>();
  function handleConfirm() {
    dispatch('await', {
      promise: async () => {
        const sanitizedBallot = prepareBallotForSubmission($ballot, round);

        await castBallot(undefined, roundId, sanitizedBallot);

        ballot.clear();
        await invalidate('rpgf:round');
      },
      message: 'Casting your ballot...',
    });
  }
</script>

<StepLayout>
  <StepHeader
    headline="Cast your ballot"
    description="Are you sure you want to cast your ballot now? After casting, you can view and make changes until voting for the round closes."
    emoji="🗳️"
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Never mind</Button>
    <Button icon={Check} on:click={handleConfirm} variant="primary">Yes, cast my ballot</Button>
  </svelte:fragment>
</StepLayout>
