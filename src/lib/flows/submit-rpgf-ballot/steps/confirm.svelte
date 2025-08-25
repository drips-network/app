<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { castBallot, patchBallot } from '$lib/utils/rpgf/rpgf';
  import type { Ballot, InProgressBallot } from '$lib/utils/rpgf/schemas';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let ballot: Writable<InProgressBallot> & {
    clear: () => void;
  };
  export let previouslyCastBallot: boolean;
  export let roundSlug: string;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  function assertValidBallot(
    inProgressBallot: InProgressBallot,
  ): asserts inProgressBallot is Ballot {
    // check that there is at least one entry in the ballot, and no null values
    if (
      Object.keys(inProgressBallot).length === 0 ||
      Object.values(inProgressBallot).includes(null)
    ) {
      throw new Error('Invalid ballot: must have at least one entry and no null values');
    }
  }

  function handleConfirm() {
    dispatch('await', {
      promise: async () => {
        const strippedBallot = Object.fromEntries(
          Object.entries($ballot).filter(
            (v) => v[1] !== null && v[1] !== undefined && v[1] !== 0 && v[1] !== '',
          ),
        ) as Ballot;

        assertValidBallot(strippedBallot);

        if (previouslyCastBallot) {
          await patchBallot(undefined, roundSlug, strippedBallot);
        } else {
          await castBallot(undefined, roundSlug, strippedBallot);
        }

        ballot.clear();
        await invalidateAll();
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
