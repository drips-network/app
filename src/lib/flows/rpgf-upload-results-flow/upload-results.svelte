<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import DropZone from '$lib/components/drop-zone/drop-zone.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import FileCSV from '$lib/components/icons/FileCSV.svelte';
  import FileXLSX from '$lib/components/icons/FileXLSX.svelte';
  import Sharrow from '$lib/components/icons/Sharrow.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import downloadUrl from '$lib/utils/download-url';
  import {
    getApplicationsCsv,
    getApplicationsXlsx,
    importResultsAsCsv,
    importResultsAsXlsx,
  } from '$lib/utils/rpgf/rpgf';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    round: Round;
  }

  let { round }: Props = $props();

  let downloading = $state(false);

  async function handleDownload(format: 'csv' | 'xlsx') {
    downloading = true;

    const content: Blob | string =
      format === 'csv'
        ? await getApplicationsCsv(undefined, round.id, true)
        : await getApplicationsXlsx(undefined, round.id, true);

    const fileType =
      format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const fileName =
      format === 'csv' ? `applications-${round.urlSlug}.csv` : `applications-${round.urlSlug}.xlsx`;

    downloadUrl(URL.createObjectURL(new Blob([content], { type: fileType })), fileName);

    downloading = false;
  }

  let loadedFile: File | null = $state(null);
  let fileData: ArrayBuffer | null = $state(null);
  let filetype: 'csv' | 'xlsx' | null = $state(null);

  function handleFileInput(e: CustomEvent<{ file: File }>) {
    const reader = new FileReader();

    reader.onload = () => {
      const { result } = reader;
      if (!result || !(result instanceof ArrayBuffer)) return;

      const { file } = e.detail;

      if (file.name.endsWith('.csv')) {
        filetype = 'csv';
      } else if (file.name.endsWith('.xlsx')) {
        filetype = 'xlsx';
      } else {
        // Unsupported file type
        return;
      }

      loadedFile = e.detail.file;
      fileData = result;
    };

    reader.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('Error reading file:', reader.error);
    };

    reader.readAsArrayBuffer(e.detail.file);
  }

  function handleSubmit() {
    dispatch('await', {
      message: 'Importing results...',
      promise: async () => {
        if (!loadedFile || !fileData || !filetype) return;

        if (filetype === 'csv') {
          await importResultsAsCsv(undefined, round.id, new TextDecoder().decode(fileData));
        } else {
          await importResultsAsXlsx(undefined, round.id, fileData);
        }

        await invalidateAll();
      },
    });
  }
</script>

<StepLayout center>
  <StepHeader headline="Upload results spreadsheet" />

  <div
    style:display="flex"
    style:flex-direction="column"
    style:align-items="flex-start"
    style:gap="1rem"
    style:text-align="left"
  >
    <p>
      You can manually import results for this round by uploading a spreadsheet containing the final
      allocations.
    </p>

    <Divider />

    <div class="step">
      <div class="step-number">1</div>
      <div class="content">
        <h4>Download the template</h4>
        <p>
          Download a sheet of all approved applications for the round as either CSV or Excel (XLSX).
        </p>

        <div class="actions">
          <Button disabled={downloading} onclick={() => handleDownload('csv')} icon={FileCSV}>
            Download CSV
          </Button>

          <Button disabled={downloading} onclick={() => handleDownload('xlsx')} icon={FileXLSX}>
            Download XLSX
          </Button>
        </div>
      </div>
    </div>

    <Divider />

    <div class="step">
      <div class="step-number">2</div>
      <div class="content">
        <h4>Enter allocations</h4>
        <p>
          The spreadsheet includes a blank "Allocation" column. Enter the final allocation amounts
          here, as integers. <span class="typo-text-bold">
            You must include at least the "ID" and "Allocation" columns.
          </span>
        </p>
      </div>
    </div>

    <Divider />

    <div class="step">
      <div class="step-number">3</div>
      <div class="content">
        <h4>Upload your result</h4>
        <p style:margin-bottom="0.5rem">
          Export your spreadsheet including final allocations as either CSV (recommended) or XLSX,
          then upload it below.
        </p>

        {#if loadedFile && filetype && fileData}
          <div
            style:display="flex"
            style:align-items="center"
            style:justify-content="space-between"
            style:gap="0.5rem"
          >
            <div style:display="flex" style:align-items="center" style:gap="0.5rem">
              {#if filetype === 'csv'}
                <FileCSV style="fill: var(--color-primary-level-6)" />
              {:else}
                <FileXLSX style="fill: var(--color-primary-level-6)" />
              {/if}

              <p>{loadedFile.name} ({(loadedFile.size / 1024).toFixed(2)} KB)</p>
            </div>

            <Button
              variant="ghost"
              circular
              icon={CrossCircle}
              ariaLabel="Remove loaded file"
              onclick={() => {
                loadedFile = null;
                fileData = null;
                filetype = null;
              }}
            />
          </div>
        {:else}
          <DropZone
            filetypes={[
              'text/csv',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]}
            on:input={handleFileInput}
          />
        {/if}

        <div class="actions" style:margin-top="1rem">
          <Button icon={Sharrow} disabled={!fileData} variant="primary" onclick={handleSubmit}
            >Import results</Button
          >
        </div>
      </div>
    </div>
  </div></StepLayout
>

<style>
  .step {
    display: flex;
    gap: 0.5rem;
  }

  .step .content {
    margin-top: 0.3rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .step-number {
    flex-shrink: 0;
    border-radius: 2rem;
    background-color: var(--color-primary-level-1);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }
</style>
