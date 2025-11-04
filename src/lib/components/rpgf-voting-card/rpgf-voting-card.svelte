<script lang="ts">
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Divider from '../divider/divider.svelte';
  import ArrowBoxUpRight from '../icons/ArrowBoxUpRight.svelte';
  import CheckCircle from '../icons/CheckCircle.svelte';
  import { page } from '$app/stores';
  import Proposals from '../icons/Proposals.svelte';
  import type { Writable } from 'svelte/store';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import submitRpgfBallotFlowSteps from '$lib/flows/submit-rpgf-ballot/submit-rpgf-ballot-flow-steps';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import type { InProgressBallot, WrappedBallot } from '$lib/utils/rpgf/types/ballot';
  import unreachable from '$lib/utils/unreachable';
  import OrDivider from '../rpgf-results-card/components/or-divider.svelte';
  import File from '../icons/File.svelte';
  import rpgfSpreadsheetVoteFlowSteps from '$lib/flows/rpgf-spreadsheet-vote-flow/rpgf-spreadsheet-vote-flow-steps';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import { goto, invalidate } from '$app/navigation';

  export let ballot: Writable<InProgressBallot> & {
    clear: () => void;
  };
  export let round: Round;
  export let previouslyCastBallot: WrappedBallot | null;

  const guidelinesDismissbleId = `rpgf-${round.urlSlug}-guidelines-seen`;
  $: voterGuidelinesSeen = round.voterGuidelinesLink
    ? $dismissablesStore.includes(guidelinesDismissbleId)
    : true;

  let voteStep: 'build-ballot' | 'assign-votes' | null = null;
  $: {
    if (!voterGuidelinesSeen) {
      voteStep = null;
    } else if ($page.url.pathname.includes('/applications/ballot')) {
      voteStep = 'assign-votes';
    } else if ($page.url.pathname.includes('/applications')) {
      voteStep = 'build-ballot';
    } else {
      voteStep = null;
    }
  }

  $: ballotHasEntries = Object.keys($ballot).length > 0;

  $: amountOfVotesAssigned = Object.values($ballot)
    .filter((vote) => vote !== null)
    .reduce<number>((acc, vote) => acc + Number(vote ?? 0), 0);
  $: percentageOfVotesAssigned = amountOfVotesAssigned / (round.maxVotesPerVoter ?? unreachable());

  async function handleSubmitBallot() {
    modal.show(Stepper, undefined, submitRpgfBallotFlowSteps(ballot, round));
  }

  $: localStoredBallotIsDifferentFromRemote =
    previouslyCastBallot === null
      ? ballotHasEntries
      : Object.keys($ballot).length !== Object.keys(previouslyCastBallot.ballot).length ||
        Object.entries($ballot).some(
          ([appId, votes]) => previouslyCastBallot.ballot[appId] !== votes,
        );

  let clearingLocalBallot = false;
  async function clearLocalBallotHandler() {
    await doWithConfirmationModal(
      previouslyCastBallot
        ? 'Are you sure you want to clear your changes and revert to your previously submitted ballot?'
        : 'Are you sure you want to clear your changes?',
      async () => {
        clearingLocalBallot = true;

        ballot.clear();
        await invalidate('rpgf:round:ownBallot');
        await goto(`/app/rpgf/rounds/${round.urlSlug}`);

        clearingLocalBallot = false;
      },
    );
  }
</script>

<div class="voting-card">
  <h5>Voting</h5>

  {#if !$dismissablesStore.includes('rpgf-we-save-ur-ballot')}
    <AnnotationBox type="info">
      We're saving your progress locally on your browser. You can leave this page and come back
      later to continue voting.
      <svelte:fragment slot="actions">
        <Button
          variant="primary"
          on:click={() => dismissablesStore.dismiss('rpgf-we-save-ur-ballot')}>Sounds good</Button
        >
      </svelte:fragment>
    </AnnotationBox>
  {/if}

  {#if localStoredBallotIsDifferentFromRemote}
    <AnnotationBox type="warning">
      Changes to your ballot have not yet been submitted.

      <svelte:fragment slot="actions">
        <Button on:click={() => clearLocalBallotHandler()} loading={clearingLocalBallot}
          >Clear changes</Button
        >
      </svelte:fragment>
    </AnnotationBox>
  {/if}

  <div class="steps">
    {#if round.voterGuidelinesLink}
      <div class="step">
        <div class="step-headline" class:active={voteStep === null}>
          <h6 class="typo-text-bold">
            {#if voteStep === 'assign-votes' || voteStep === 'build-ballot'}
              <CheckCircle style="fill: var(--color-primary)" />
            {/if}
            Step 1
          </h6>
          <span class="typo-text">Read guidelines</span>
        </div>

        {#if voteStep === null}
          <div class="description">
            <p class="typo-text-small">
              Please carefully read the round's badgeholder guidelines before proceeding. These
              guidelines outline the rules and expectations for badgeholders during the voting
              process.
            </p>
          </div>

          <div class="actions">
            <Button
              href={buildExternalUrl(round.voterGuidelinesLink)}
              target="_blank"
              variant="primary"
              icon={ArrowBoxUpRight}>Voter guidelines</Button
            >
            <Button
              variant="normal"
              on:click={() => dismissablesStore.dismiss(guidelinesDismissbleId)}
              >Confirm & continue</Button
            >
          </div>
        {:else}
          <Button variant="ghost" icon={ArrowBoxUpRight}>Review voter guidelines</Button>
        {/if}
      </div>

      <Divider sideMargin={-1} />
    {/if}

    <a class="step" href="/app/rpgf/rounds/{round.urlSlug}/applications?filter=approved">
      <div class="step-headline" class:active={voteStep === 'build-ballot'}>
        <h6 class="typo-text-bold">
          {#if voteStep === 'assign-votes'}
            <CheckCircle style="fill: var(--color-primary)" />
          {/if}
          Step {round.voterGuidelinesLink ? 2 : 1}
        </h6>
        <span class="typo-text">Pick applications</span>
      </div>

      {#if voteStep === 'build-ballot'}
        <div class="description">
          <p class="typo-text-small">
            Decide which applications you'd like to add to your ballot by selecting them on the
            left.
          </p>
          <p class="typo-text-small">
            Use this step to decide on which projects you believe are worthy of funding.
          </p>
          <p class="typo-text-small">Alternatively, you can vote by uploading a spreadsheet.</p>
        </div>

        <div class="actions">
          <span class="typo-text" style:text-align="center"
            >{Object.keys($ballot).length} selected</span
          >
          <Button
            disabled={!ballotHasEntries}
            variant="primary"
            href="/app/rpgf/rounds/{round.urlSlug}/applications/ballot"
            >Continue to assign votes</Button
          >

          <OrDivider />

          <Button
            icon={File}
            href="/app/rpgf/rounds/{round.urlSlug}/applications/ballot"
            on:click={(e) => {
              e.preventDefault();
              modal.show(Stepper, undefined, rpgfSpreadsheetVoteFlowSteps(round, ballot));
            }}>Vote using spreadsheet</Button
          >
        </div>
      {/if}
    </a>

    <Divider sideMargin={-1} />

    <a class="step" href="/app/rpgf/rounds/{round.urlSlug}/applications/ballot">
      <div class="step-headline" class:active={voteStep === 'assign-votes'}>
        <h6 class="typo-text-bold">Step {round.voterGuidelinesLink ? '3' : '2'}</h6>
        <span class="typo-text">Assign votes</span>
      </div>

      {#if voteStep === 'assign-votes'}
        <div class="description">
          <p class="typo-text-small">Assign votes to the selected applications.</p>
          <p class="typo-text-small">Once you're done, cast your ballot below.</p>
        </div>

        <div class="actions">
          <span class="typo-text" style:text-align="center">
            {amountOfVotesAssigned} of {round.maxVotesPerVoter} votes assigned
          </span>
          <div class="assignment-progress-bar">
            <div class="progress-bar" style:width="{percentageOfVotesAssigned * 100}%"></div>
          </div>
          <div
            style:margin-top="1rem"
            style:display="flex"
            style:flex-direction="column"
            style:gap="0.5rem"
          >
            <Button
              size="large"
              icon={Proposals}
              disabled={!ballotHasEntries ||
                amountOfVotesAssigned === 0 ||
                (Boolean(previouslyCastBallot) && !localStoredBallotIsDifferentFromRemote)}
              on:click={(e) => {
                e.preventDefault();
                handleSubmitBallot();
              }}
              variant="primary"
            >
              {#if previouslyCastBallot}
                Confirm changes to ballot
              {:else}
                Submit your ballot
              {/if}
            </Button>

            <OrDivider />

            <Button
              icon={File}
              href="/app/rpgf/rounds/{round.urlSlug}/applications/ballot"
              on:click={(e) => {
                e.preventDefault();
                modal.show(Stepper, undefined, rpgfSpreadsheetVoteFlowSteps(round, ballot));
              }}
              >{#if previouslyCastBallot}
                Update using spreadsheet
              {:else}
                Vote using spreadsheet
              {/if}</Button
            >
          </div>
        </div>
      {/if}
    </a>
  </div>
</div>

<style>
  .voting-card {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .step-headline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    opacity: 0.75;
  }

  .step-headline.active {
    opacity: 1;
  }

  .step-headline h6 {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .step-headline span {
    color: var(--color-foreground-level-5);
  }

  .description {
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    gap: 0.5rem;
  }

  .description {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .assignment-progress-bar {
    width: 100%;
    height: 0.5rem;
    background-color: var(--color-foreground-level-3);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    transition: width 0.3s;
  }
</style>
