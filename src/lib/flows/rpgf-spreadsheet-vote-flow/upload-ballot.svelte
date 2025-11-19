<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import DropZone from '$lib/components/drop-zone/drop-zone.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import FileCSV from '$lib/components/icons/FileCSV.svelte';
  import FileXLSX from '$lib/components/icons/FileXLSX.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import downloadUrl from '$lib/utils/download-url';
  import {
    castBallotAsCsv,
    castBallotAsXlsx,
    getApplicationsCsv,
    getApplicationsXlsx,
  } from '$lib/utils/rpgf/rpgf';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let inProgressBallot: Writable<InProgressBallot> & {
    clear: () => void;
  };

  export let round: Round;

  let downloading = false;

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

  let loadedFile: File | null = null;
  let fileData: ArrayBuffer | null = null;
  let filetype: 'csv' | 'xlsx' | null = null;

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
      message: 'Please confirm your ballot in your wallet...',
      promise: async () => {
        if (!loadedFile || !fileData || !filetype) return;

        if (filetype === 'csv') {
          await castBallotAsCsv(undefined, round.id, new TextDecoder().decode(fileData));
        } else {
          await castBallotAsXlsx(undefined, round.id, fileData);
        }

        inProgressBallot.clear();
        await invalidate('rpgf:round');
      },
    });
  }
</script>

<StepLayout center>
  <StepHeader headline="Submit spreadsheet ballot" emoji="🗳️" />

  <div
    style:display="flex"
    style:flex-direction="column"
    style:align-items="flex-start"
    style:gap="1rem"
    style:text-align="left"
  >
    <p>
      You can vote by filling your allocations into a spreadsheet and uploading it here. Follow the
      steps below to get started.
    </p>

    <Divider />

    <div class="step">
      <div class="step-number">1</div>
      <div class="content">
        <h4>Download the ballot template</h4>
        <p>
          Download a sheet of all approved applications for the round as either CSV or Excel (XLSX).
        </p>

        <div class="actions">
          <Button disabled={downloading} on:click={() => handleDownload('csv')} icon={FileCSV}>
            Download CSV
          </Button>

          <Button disabled={downloading} on:click={() => handleDownload('xlsx')} icon={FileXLSX}>
            Download XLSX
          </Button>
        </div>
      </div>
    </div>

    <Divider />

    <div class="step">
      <div class="step-number">2</div>
      <div class="content">
        <h4>Make your vote allocations</h4>
        <p>
          The spreadsheet includes a blank "Allocation" column. Enter your vote allocation here, as
          integers (no fractions). <span class="typo-text-bold">
            You must include at least the "ID" and "Allocation" columns.
          </span>
        </p>
        <p>As per the round configuration:</p>

        <ul>
          {#if round.minVotesPerProjectPerVoter !== null}
            <li>
              You must assign
              <span class="typo-text-bold">at least {round.minVotesPerProjectPerVoter} votes</span>
              to any application you include.
            </li>
          {/if}
          {#if round.maxVotesPerProjectPerVoter !== null}
            <li>
              You can assign
              <span class="typo-text-bold"
                >a maximum of {round.maxVotesPerProjectPerVoter} votes</span
              >
              for a given application.
            </li>
          {/if}
          {#if round.maxVotesPerVoter !== null}
            <li>
              You can allocate a
              <span class="typo-text-bold">total of {round.maxVotesPerVoter} votes</span>
              across all applications.
            </li>
          {/if}
        </ul>

        {#if round.voterGuidelinesLink}
          <p>
            Refer to the round's <a
              href={buildExternalUrl(round.voterGuidelinesLink)}
              class="typo-link"
              target="_blank"
              rel="noopener noreferrer">voter guidelines</a
            > for more information on how to allocate your votes.
          </p>
        {/if}
      </div>
    </div>

    <Divider />

    <div class="step">
      <div class="step-number">3</div>
      <div class="content">
        <h4>Upload your result</h4>
        <p style:margin-bottom="0.5rem">
          Export your spreadsheet including allocated votes as either CSV (recommended) or XLSX,
          then upload it below.
        </p>

        <div style:margin-bottom="1rem">
          <AnnotationBox>
            If you already submitted a ballot previously, it will be overwritten with data from this
            upload.
          </AnnotationBox>
        </div>

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
              on:click={() => {
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
          <Button icon={Wallet} disabled={!fileData} variant="primary" on:click={handleSubmit}
            >Submit ballot</Button
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

  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }
</style>
