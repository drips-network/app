<script lang="ts">
  import { run } from 'svelte/legacy';

  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import type { ComponentProps } from 'svelte';
  import ApplicationDecisionButtons from './application-decision-buttons.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import type { Writable } from 'svelte/store';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import type { ListingApplication } from '$lib/utils/rpgf/types/application';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import { page } from '$app/stores';
  import { getContext, onDestroy } from 'svelte';
  import {
    ballotValidationContextKey,
    type BallotValidationErrorsStore,
  } from '$lib/utils/rpgf/ballot-validation-context';

  interface Props {
    round: Round;
    application: ListingApplication;
    reviewMode: boolean;
    decision?: ComponentProps<typeof ApplicationDecisionButtons>['decision'];
    voteStep?: 'build-ballot' | 'assign-votes' | null;
    ballotStore: Writable<InProgressBallot>;
    ellipsis?: boolean;
  }

  let {
    round,
    application,
    reviewMode,
    decision = $bindable(),
    voteStep = null,
    ballotStore,
    ellipsis = false,
  }: Props = $props();

  /** If true, only the application name and icon are clickable, otherwise entire row.
   * Needed for voting mode bc otherwise the input becomes really buggy
   */
  let smallLink = $derived(voteStep === 'assign-votes');

  let picked = $state($ballotStore[application.id] !== undefined);

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
  run(() => {
    updateBallot(picked);
  });

  let voteAmountInput: string | undefined = $state(
    $ballotStore[application.id] == null ? undefined : String($ballotStore[application.id]),
  );
  let voteAmountInputValidationState: TextInputValidationState = $state({ type: 'unvalidated' });

  const ballotValidationErrors = getContext<BallotValidationErrorsStore | undefined>(
    ballotValidationContextKey,
  );

  function updateValidationErrors(state: TextInputValidationState) {
    if (!ballotValidationErrors) return;

    ballotValidationErrors.update((current) => {
      const next = new Set(current);

      if (state.type === 'invalid') {
        next.add(application.id);
      } else {
        next.delete(application.id);
      }

      return next;
    });
  }

  function setValidationState(state: TextInputValidationState) {
    voteAmountInputValidationState = state;
    updateValidationErrors(state);
  }

  let votePlaceholder = $derived(
    round.minVotesPerProjectPerVoter !== null && round.maxVotesPerProjectPerVoter !== null
      ? `${round.minVotesPerProjectPerVoter}-${round.maxVotesPerProjectPerVoter}`
      : round.minVotesPerProjectPerVoter !== null
        ? `${round.minVotesPerProjectPerVoter}+`
        : round.maxVotesPerProjectPerVoter !== null
          ? `0-${round.maxVotesPerProjectPerVoter}`
          : undefined,
  );

  function updateVoteAmount(voteAmountInput: string | undefined) {
    if (voteStep !== 'assign-votes') {
      setValidationState({ type: 'unvalidated' });
      return;
    }

    if (!picked) {
      setValidationState({ type: 'unvalidated' });
      return;
    }

    const parsedValue = Number(voteAmountInput);

    if (!voteAmountInput || !parsedValue || Number.isNaN(parsedValue)) {
      setValidationState({ type: 'unvalidated' });
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else if (parsedValue < 0) {
      setValidationState({
        type: 'invalid',
        message: 'Vote amount must be a positive number.',
      });
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else if (
      !!round.minVotesPerProjectPerVoter &&
      parsedValue < round.minVotesPerProjectPerVoter
    ) {
      setValidationState({
        type: 'invalid',
        message: `Vote amount must be at least ${round.minVotesPerProjectPerVoter}.`,
      });
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else if (
      !!round.maxVotesPerProjectPerVoter &&
      parsedValue > round.maxVotesPerProjectPerVoter
    ) {
      setValidationState({
        type: 'invalid',
        message: `Vote amount must not exceed ${round.maxVotesPerProjectPerVoter}.`,
      });
      $ballotStore = {
        ...$ballotStore,
        [application.id]: null,
      };
    } else {
      setValidationState({ type: 'valid' });
      $ballotStore = {
        ...$ballotStore,
        [application.id]: parsedValue,
      };
    }
  }
  run(() => {
    updateVoteAmount(voteAmountInput);
  });

  onDestroy(() => {
    updateValidationErrors({ type: 'unvalidated' });
  });

  let active = $derived($page.url.href.includes(`/applications/${application.id}`));

  let link = $derived(
    `/app/rpgf/rounds/${round.urlSlug}/applications/${application.id}${
      voteStep === 'assign-votes' ? '?backToBallot' : ''
    }${$page.url.search}`,
  );
</script>

<svelte:element
  this={smallLink ? 'div' : 'a'}
  href={link}
  class="application-line-item"
  class:active
  class:small-link={smallLink}
  data-testid="application-line-item-{application.id}"
>
  <svelte:element this={smallLink ? 'a' : 'div'} href={link} class:ellipsis>
    <RpgfApplicationBadge short {application} />
  </svelte:element>

  {#if reviewMode && application.state === 'pending'}
    <ApplicationDecisionButtons applicationId={application.id} bind:decision />
  {/if}

  {#if voteStep === 'build-ballot' && application.state === 'approved'}
    <Checkbox bind:checked={picked} />
  {/if}

  {#if voteStep === 'assign-votes' && application.state === 'approved'}
    <div class="vote-count-input">
      <TextInput
        onclick={(e) => e.preventDefault()}
        validationState={voteAmountInputValidationState}
        bind:value={voteAmountInput}
        variant={{ type: 'number', min: round.minVotesPerProjectPerVoter ?? 0 }}
        placeholder={votePlaceholder ?? '0+'}
      />
    </div>
  {/if}

  {#if application.allocation !== null}
    <span class="typo-text-small-bold">
      {application.allocation}
    </span>
  {/if}
</svelte:element>

<style>
  .application-line-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .application-line-item.active {
    background-color: var(--color-primary-level-1);
  }

  .application-line-item:not(.small-link):hover {
    background-color: var(--color-foreground-level-1);
  }

  .ellipsis {
    min-width: 0;
  }

  .application-line-item:last-child {
    border-bottom: none;
  }

  .vote-count-input {
    width: 8rem;
  }
</style>
