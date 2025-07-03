<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { publishResults, recalculateResults } from '$lib/utils/rpgf/rpgf';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Dropdown from '../dropdown/dropdown.svelte';
  import ArrowLeft from '../icons/ArrowLeft.svelte';
  import DripList from '../icons/DripList.svelte';

  export let roundSlug: string;
  export let resultsCalculated: boolean;
  export let resultsPublished: boolean;

  let calcMethod = 'avg';

  let loading = false;
  async function handleCalculateResults() {
    await doWithErrorModal(
      async () => {
        if (loading) return;
        loading = true;

        await recalculateResults(undefined, roundSlug, calcMethod as 'avg' | 'median' | 'sum');

        await invalidateAll();

        loading = false;

        step = 'publish';
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

            await publishResults(undefined, roundSlug);
            await invalidateAll();

            loading = false;

            step = 'published';
          },
          () => {
            loading = false;
          },
        );
      },
    );
  }

  let step: 'calculate' | 'publish' | 'published';
  if (resultsPublished) {
    step = 'published';
  } else if (resultsCalculated) {
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

    <Button icon={ArrowLeft} on:click={() => (step = 'calculate')} variant="ghost"
      >Recalculate results</Button
    >
  {:else if step === 'published'}
    <h2 class="pixelated">Results published</h2>

    <p class="typo-text-small">
      The results for this round have been published. You can now create a Drip List to distribute
      funds accordingly.
    </p>

    <Button icon={DripList} size="large" variant="primary">Create Drip List</Button>
  {/if}
</div>

<style>
  .rpgf-results-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
