<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import createRpgfRoundDripListFlow from '$lib/flows/create-rpgf-round-drip-list/create-rpgf-round-drip-list-flow';
  import editRpgfRoundLinkedDripListsFlow from '$lib/flows/edit-rpgf-round-linked-drip-lists/edit-rpgf-round-linked-drip-lists-flow';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { publishResults, recalculateResults } from '$lib/utils/rpgf/rpgf';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Dropdown from '../dropdown/dropdown.svelte';
  import ArrowLeft from '../icons/ArrowLeft.svelte';
  import DripList from '../icons/DripList.svelte';
  import Stepper from '../stepper/stepper.svelte';
  import OrDivider from './components/or-divider.svelte';
  import File from '../icons/File.svelte';
  import rpgfUploadResultsFlowSteps from '$lib/flows/rpgf-upload-results-flow/rpgf-upload-results-flow-steps';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import unreachable from '$lib/utils/unreachable';

  export let round: Round;

  let calcMethod = 'avg';

  let forceRecalculate = false;

  let loading = false;
  async function handleCalculateResults() {
    await doWithErrorModal(
      async () => {
        if (loading) return;
        loading = true;

        await recalculateResults(undefined, round.id, calcMethod as 'avg' | 'median' | 'sum');

        await invalidateAll();

        loading = false;
        forceRecalculate = false;
      },
      () => {
        loading = false;
      },
    );
  }

  async function handlePublishResults() {
    await doWithConfirmationModal(
      "Are you sure you want to publish the round's results? They will immediately become visible to the public.",
      async () => {
        await doWithErrorModal(
          async () => {
            if (loading) return;
            loading = true;

            await publishResults(undefined, round.id);
            await invalidateAll();

            loading = false;
          },
          () => {
            loading = false;
          },
        );
      },
    );
  }

  let step: 'calculate' | 'publish' | 'published' | 'linked';
  $: if (round.resultsPublished) {
    step = 'published';
  } else if (round.resultsCalculated && !forceRecalculate) {
    step = 'publish';
  } else {
    step = 'calculate';
  }
</script>

<div class="rpgf-results-card">
  {#if step === 'calculate'}
    <h2 class="pixelated">Calculate results</h2>

    <p class="typo-text-small">
      As an admin, you can calculate results for the round based on submitted ballots. Select the
      method, then start the calculation to see the results.
    </p>

    <p class="typo-text-small">
      Once results have been calculated, you can choose to publish them, and later create a Drip
      List to distribute funds accordingly.
    </p>

    <h5>Calculation method</h5>

    <Dropdown
      options={[
        { title: 'Average', value: 'avg' },
        { title: 'Median', value: 'median' },
        { title: 'Sum', value: 'sum' },
      ]}
      bind:value={calcMethod}
    />

    <Button on:click={handleCalculateResults} {loading} size="large" variant="primary">
      Calculate results
    </Button>

    <OrDivider />

    <Button
      icon={File}
      on:click={() => modal.show(Stepper, undefined, rpgfUploadResultsFlowSteps(round))}
    >
      Manually upload results
    </Button>
  {:else if step === 'publish'}
    <h2 class="pixelated">Publish results</h2>

    <p class="typo-text-small">
      The allocation amounts have been calculated. Publish the results to make them visible to the
      public.
    </p>

    <AnnotationBox type="info">
      Filter the view by allocation amount or download a CSV of the results for review on the left.
    </AnnotationBox>

    <Button on:click={handlePublishResults} {loading} size="large" variant="primary">
      Publish results
    </Button>

    <OrDivider />

    <Button icon={ArrowLeft} on:click={() => (forceRecalculate = true)} variant="ghost"
      >Recalculate results</Button
    >
  {:else if step === 'published'}
    <h2 class="pixelated">Results published</h2>

    <p class="typo-text-small">
      The results for this round have been published. You can now create a Drip List to distribute
      funds accordingly.
    </p>

    <Button
      on:click={() =>
        modal.show(
          Stepper,
          undefined,
          createRpgfRoundDripListFlow(round.id, round.name ?? unreachable()),
        )}
      icon={DripList}
      size="large"
      variant="primary">Prepare Drip List</Button
    >

    <OrDivider />

    <Button
      on:click={() =>
        modal.show(Stepper, undefined, editRpgfRoundLinkedDripListsFlow(round.id, []))}
      >Manually link Drip Lists</Button
    >
  {/if}
</div>

<style>
  .rpgf-results-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
