<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import DropZone from '$lib/components/drop-zone/drop-zone.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Sharrow from '$lib/components/icons/Sharrow.svelte';
  import FileIcon from '$lib/components/icons/File.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { uploadCustomDatasetCsv } from '$lib/utils/rpgf/rpgf';
  import type { CustomDataset } from '$lib/utils/rpgf/types/customDataset';
  import { createEventDispatcher } from 'svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import CsvExample from '../import-from-csv/components/csv-example.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let customDataset: CustomDataset;

  let valid = false;
  $: valid = csvData.length > 0;

  let csvData: string = '';
  let loadedFile: File | null = null;

  let uploading = false;

  async function handleUpload() {
    dispatch('await', {
      message: 'Uploading dataset CSV…',
      promise: async () => {
        const res = await uploadCustomDatasetCsv(
          undefined,
          customDataset.roundId,
          customDataset.id,
          csvData,
        );

        if ('error' in res) {
          throw new Error(res.error);
        } else {
          await invalidate('rpgf:round:applications:custom-datasets');
        }
      },
    });
  }

  function handleFileInput(e: CustomEvent<{ file: File }>) {
    const reader = new FileReader();

    reader.onload = () => {
      const { result } = reader;
      if (!result || typeof result !== 'string') return;

      loadedFile = e.detail.file;
      csvData = result;
    };

    reader.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('Error reading file:', reader.error);
    };

    reader.readAsText(e.detail.file);
  }
</script>

<StandaloneFlowStepLayout
  headline="Upload dataset"
  description="Upload a CSV file to populate the custom dataset."
>
  {#if !loadedFile}
    <FormField title="Data*" type="div">
      <DropZone
        filetypes={['text/csv']}
        instructions="Drop a CSV file containing your dataset"
        on:input={handleFileInput}
      />
    </FormField>

    <FormField title="CSV example" type="div">
      <svelte:fragment slot="action">
        <a
          class="typo-text typo-link"
          href="https://docs.drips.network/rpgf/advanced/custom-datasets"
          target="_blank"
          rel="noreferrer"
        >
          Full documentation
        </a>
      </svelte:fragment>

      <PaddedHorizontalScroll>
        <CsvExample
          headers={['applicationId', 'Number of commits', 'Number of PRs']}
          data={[
            ['4f607fd3-45ea-4ea3-b091-c57b25fde5fe', '345', 'Many'],
            ['a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '120', 'Several'],
          ]}
        />
      </PaddedHorizontalScroll>
    </FormField>
  {:else}
    <FormField title="Loaded file">
      {#if loadedFile}
        <div
          style:display="flex"
          style:align-items="center"
          style:justify-content="space-between"
          style:gap="0.5rem"
        >
          <div style:display="flex" style:align-items="center" style:gap="0.5rem">
            <FileIcon style="fill: var(--color-primary)" />
            <p>{loadedFile.name} ({(loadedFile.size / 1024).toFixed(2)} KB)</p>
          </div>

          <Button
            variant="ghost"
            circular
            icon={CrossCircle}
            ariaLabel="Remove loaded file"
            on:click={() => {
              loadedFile = null;
              csvData = '';
            }}
          />
        </div>
      {:else}
        <p style:height="2rem">No file loaded yet.</p>
      {/if}
    </FormField>

    <AnnotationBox type="warning">
      Uploading a new CSV will <strong>replace</strong> all existing data in this custom dataset.
    </AnnotationBox>
  {/if}

  <svelte:fragment slot="actions">
    <Button
      variant="primary"
      disabled={valid === false}
      type="submit"
      icon={Sharrow}
      loading={uploading}
      on:click={handleUpload}>Upload data</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
