<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { castBallot } from '$lib/utils/rpgf/rpgf';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { prepareBallotForSubmission } from '$lib/utils/rpgf/validate-ballot';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  interface Props {
    ballot: Writable<InProgressBallot> & {
      clear: () => void;
    };
    roundId: string;
    round: Round;
  }

  let { ballot, roundId, round }: Props = $props();

  const dispatch = createEventDispatcher<StepComponentEvents>();
  function handleConfirm() {
    dispatch('await', {
      promise: async () => {
        const sanitizedBallot = prepareBallotForSubmission($ballot, round);

        await castBallot(undefined, roundId, sanitizedBallot);

        ballot.clear();
        await invalidate('rpgf:round');
      },
      message: 'Waiting for you to confirm the ballot in your wallet...',
    });
  }
</script>

<StepLayout>
  <StepHeader
    headline="Cast your ballot"
    description="Are you sure you want to cast your ballot now? After casting, you can view and make changes until voting for the round closes."
    emoji="🗳️"
  />

  <AnnotationBox>
    When you confirm, a wallet signature request will be triggered. Please review your ballot
    details and confirm.
  </AnnotationBox>
  {#snippet actions()}
    <Button onclick={() => dispatch('conclude')} variant="ghost">Never mind</Button>
    <Button icon={Wallet} onclick={handleConfirm} variant="primary">Yes, cast my ballot</Button>
  {/snippet}
</StepLayout>
