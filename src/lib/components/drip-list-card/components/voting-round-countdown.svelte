<script lang="ts">
  import Countdown from '$lib/components/countdown/countdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import formatDate from '$lib/utils/format-date';
  import { getVotingRoundStatusReadable } from '$lib/utils/multiplayer';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';

  export let votingRound: VotingRound;

  const status = getVotingRoundStatusReadable(votingRound);
</script>

<FormField title={votingRound.status === 'completed' ? 'Voting ended' : 'Voting ends'} type="div">
  {#if $status === 'completed'}
    <p class="typo-text">
      Voting has ended at {formatDate(new Date(votingRound.endsAt), 'verbose')} your time.
    </p>
  {:else}
    <p style:margin-bottom="0.25rem" class="typo-text tabular-nums">
      <Countdown targetDate={new Date(votingRound.endsAt)} />
    </p>
    <p class="typo-text-small">
      That's {formatDate(new Date(votingRound.endsAt), 'verbose')} your time.
    </p>
  {/if}
</FormField>
