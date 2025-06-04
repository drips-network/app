<script lang="ts">
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import type {
    Application,
    InProgressBallot,
    WrappedRoundAdmin,
    WrappedRoundPublic,
  } from '$lib/utils/rpgf/schemas';
  import type { ComponentProps } from 'svelte';
  import ApplicationDecisionButtons from './application-decision-buttons.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import type { Writable } from 'svelte/store';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';

  export let round: WrappedRoundPublic['round'] | WrappedRoundAdmin['round'];
  export let application: Application;

  export let reviewMode: boolean;
  export let decision: ComponentProps<ApplicationDecisionButtons>['decision'] = null;

  export let voteStep: 'build-ballot' | 'assign-votes' | null = null;
  export let ballotStore: Writable<InProgressBallot>;

  let picked = $ballotStore[application.id] !== undefined;

  function updateBallot(picked: boolean) {
    if (voteStep !== 'build-ballot') return;

    if (picked) {
      ballotStore.update((store) => ({
        ...store,
        [application.id]: store[application.id] ?? null, // Keep existing vote amount if it exists
      }));
    } else {
      ballotStore.update((store) => {
        const updatedBallot = { ...store };
        delete updatedBallot[application.id];
        return updatedBallot;
      });
    }
  }
  $: updateBallot(picked);

  let voteAmountInput: string | undefined = String($ballotStore[application.id]);
  let voteAmountInputValidationState: TextInputValidationState;

  function updateVoteAmount(voteAmountInput: string | undefined) {
    if (voteStep !== 'assign-votes') return;
    if (!picked) return;

    if (voteAmountInput == undefined || Number.isNaN(Number(voteAmountInput))) {
      voteAmountInputValidationState = { type: 'unvalidated' };
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else if (Number(voteAmountInput) < 0) {
      voteAmountInputValidationState = {
        type: 'invalid',
        message: 'Vote amount must be a positive number.',
      };
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else if (Number(voteAmountInput) > round.votingConfig.maxVotesPerProjectPerVoter) {
      voteAmountInputValidationState = {
        type: 'invalid',
        message: `Vote amount must not exceed ${round.votingConfig.maxVotesPerProjectPerVoter}.`,
      };
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else {
      voteAmountInputValidationState = { type: 'valid' };
      $ballotStore = {
        ...$ballotStore,
        [application.id]: Number(voteAmountInput),
      };
    }
  }
  $: updateVoteAmount(voteAmountInput);
</script>

<div class="application-line-item">
  <a href="/app/rpgf/rounds/{round.urlSlug}/applications/{application.id}">
    <RpgfApplicationBadge {application} />
  </a>

  {#if reviewMode && application.state === 'pending'}
    <ApplicationDecisionButtons applicationId={application.id} bind:decision />
  {/if}

  {#if voteStep === 'build-ballot' && application.state === 'approved'}
    <Checkbox bind:checked={picked} />
  {/if}

  {#if voteStep === 'assign-votes' && application.state === 'approved'}
    <div class="vote-count-input">
      <TextInput
        validationState={voteAmountInputValidationState}
        bind:value={voteAmountInput}
        variant={{ type: 'number', min: 0 }}
        placeholder="0-{round.votingConfig.maxVotesPerProjectPerVoter}"
      />
    </div>
  {/if}
</div>

<style>
  .application-line-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .application-line-item:last-child {
    border-bottom: none;
  }

  .vote-count-input {
    width: 8rem;
  }
</style>
