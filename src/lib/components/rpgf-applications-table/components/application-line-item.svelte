<script lang="ts">
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import type { ComponentProps } from 'svelte';
  import ApplicationDecisionButtons from './application-decision-buttons.svelte';
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
  import CheckboxSimple from '$lib/components/checkbox/checkbox-simple.svelte';

  interface Props {
    round: Round;
    application: ListingApplication;
    hideState?: boolean;
    reviewMode: boolean;
    decision?: ComponentProps<typeof ApplicationDecisionButtons>['decision'];
    voteStep?: 'build-ballot' | 'assign-votes' | null;
    ballotStore: Writable<InProgressBallot>;
    ellipsis?: boolean;
  }

  let {
    round,
    application,
    hideState = false,
    reviewMode,
    decision = $bindable(),
    voteStep = null,
    ballotStore,
    ellipsis = false,
  }: Props = $props();

  let picked = $derived($ballotStore[application.id] === undefined ? false : true);

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

  function handleCheckboxInput(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    updateBallot(target.checked);
  }

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

<div
  class="application-line-item"
  class:active
  data-testid="application-line-item-{application.id}"
>
  <a href={link} class:ellipsis>
    <RpgfApplicationBadge {hideState} short {application} />
  </a>

  <div class="interactions">
    {#if reviewMode && application.state === 'pending'}
      <ApplicationDecisionButtons applicationId={application.id} bind:decision />
    {/if}

    {#if voteStep === 'build-ballot' && application.state === 'approved'}
      <CheckboxSimple checked={picked} oninput={handleCheckboxInput} />
    {/if}

    {#if voteStep === 'assign-votes' && application.state === 'approved'}
      <div class="vote-count-input">
        <TextInput
          bind:value={voteAmountInput}
          onclick={(e) => e.preventDefault()}
          validationState={voteAmountInputValidationState}
          variant={{ type: 'number', min: round.minVotesPerProjectPerVoter ?? 0 }}
          placeholder={votePlaceholder ?? '0+'}
          oninput={(e) => updateVoteAmount((e.target as HTMLInputElement).value)}
        />
      </div>
    {/if}

    {#if application.allocation !== null}
      <span class="typo-text-small-bold">
        {Math.round((application.allocation ?? 0) * 100) / 100}
      </span>
    {/if}
  </div>
</div>

<style>
  .application-line-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
    transition: background-color 0.2s ease;
  }

  a {
    padding: 0.5rem;
    flex-grow: 1;
  }

  .interactions {
    padding: 0.5rem;
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
    flex-shrink: 0;
  }
</style>
