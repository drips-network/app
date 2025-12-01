<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import DropZone from '$lib/components/drop-zone/drop-zone.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import FileCSV from '$lib/components/icons/FileCSV.svelte';
  import FileXLSX from '$lib/components/icons/FileXLSX.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { castBallotAsCsv, castBallotAsXlsx } from '$lib/utils/rpgf/rpgf';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import type { RpgfUser } from '$lib/utils/rpgf/types/user';
  import { createEventDispatcher } from 'svelte';
  import type { WrappedBallot } from '$lib/utils/rpgf/types/ballot';
  import AlreadyVotedBadge from './components/already-voted-badge.svelte';
  import Wallet from '../icons/Wallet.svelte';
  import buildExternalUrl from '$lib/utils/build-external-url';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    round: Round;
    existingBallots: WrappedBallot[];
    voters: RpgfUser[];
  }

  let { round, existingBallots, voters }: Props = $props();

  let selected: string[] = $state([]);
  let selectedVoter = $derived(voters.find((voter) => voter.id === selected[0]) ?? null);

  let voterItems = $derived(
    voters
      .sort((a, b) => {
        // those without existing ballot first
        const aHasBallot = existingBallots.some((ballot) => ballot.user.id === a.id);
        const bHasBallot = existingBallots.some((ballot) => ballot.user.id === b.id);
        return aHasBallot === bHasBallot ? 0 : aHasBallot ? 1 : -1;
      })
      .reduce((acc, voter) => {
        acc[voter.id] = {
          type: 'selectable',
          label: {
            component: IdentityBadge,
            props: {
              address: voter.walletAddress,
              showAvatar: true,
              showIdentity: true,
              disableLink: true,
              disableTooltip: true,
            },
          },
          text: existingBallots.some((ballot) => ballot.user.id === voter.id)
            ? { component: AlreadyVotedBadge, props: {} }
            : undefined,
          searchString: [voter.walletAddress],
        } satisfies Items[string];

        return acc;
      }, {} as Items),
  );

  let loadedFile: File | null = $state(null);
  let fileData: ArrayBuffer | null = $state(null);
  let filetype: 'csv' | 'xlsx' | null = $state(null);
  let submitting = $state(false);

  let hasVoteLimits = $derived(
    round.minVotesPerProjectPerVoter !== null ||
      round.maxVotesPerProjectPerVoter !== null ||
      round.maxVotesPerVoter !== null,
  );

  function resetFile() {
    loadedFile = null;
    fileData = null;
    filetype = null;
  }

  function handleFileInput(event: CustomEvent<{ file: File }>) {
    const reader = new FileReader();
    const { file } = event.detail;

    reader.onload = () => {
      const { result } = reader;
      if (!result || !(result instanceof ArrayBuffer)) {
        return;
      }

      if (file.name.endsWith('.csv')) {
        filetype = 'csv';
      } else if (file.name.endsWith('.xlsx')) {
        filetype = 'xlsx';
      } else {
        resetFile();
        return;
      }

      loadedFile = file;
      fileData = result;
    };

    reader.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('Error reading file:', reader.error);
      resetFile();
    };

    reader.readAsArrayBuffer(file);
  }

  function handleSubmit() {
    if (!selectedVoter || !fileData || !filetype || submitting) {
      return;
    }

    dispatch('await', {
      message: 'Waiting for you to confirm the ballot in your wallet…',
      promise: async () => {
        submitting = true;

        try {
          await doWithErrorModal(async () => {
            if (filetype === 'csv') {
              await castBallotAsCsv(
                undefined,
                round.id,
                new TextDecoder().decode(fileData as ArrayBuffer),
                selectedVoter.walletAddress,
              );
            } else {
              await castBallotAsXlsx(
                undefined,
                round.id,
                fileData as ArrayBuffer,
                selectedVoter.walletAddress,
              );
            }

            resetFile();
            selected = [];
            await invalidate('rpgf:round:ballots');
          });
        } finally {
          submitting = false;
        }
      },
    });
  }

  function handleCancel() {
    dispatch('conclude');
  }
</script>

<StepLayout>
  <StepHeader
    headline="Upload ballot"
    description="Submit a spreadsheet ballot on behalf of a badgeholder."
    emoji="🗳️"
  />
  <AnnotationBox type="warning">
    <p class="typo-text-small">
      <span class="typo-text-small-bold"
        >Uploading a ballot on behalf of someone else is going to cast the ballot as if they had
        submitted it.</span
      >
      Only do this with the badgeholder's consent. If the badgeholder has already submitted a ballot,
      uploading a new one will
      <span class="typo-text-small-bold"> overwrite their previous submission</span>.
    </p>
  </AnnotationBox>

  {#if voters.length === 0}
    <AnnotationBox type="warning">
      No badgeholders are configured for this round yet. Add badgeholders before uploading ballots
      on their behalf.
    </AnnotationBox>
  {:else}
    <FormField
      type="div"
      title="Badgeholder address"
      description="Pick the badgeholder for which you want to upload a ballot."
    >
      <div class="list-wrapper">
        <ListSelect bind:selected items={voterItems} showEmptyState={false} />
      </div>
    </FormField>

    <FormField
      type="div"
      title="Ballot spreadsheet"
      description="Upload a CSV or XLSX ballot template completed by the selected badgeholder."
    >
      <div style:margin-bottom="1rem">
        <AnnotationBox type="info">
          <p class="typo-text-small">
            Ensure the sheet includes at least the <span class="typo-text-small-bold">ID</span> and
            <span class="typo-text-small-bold">Allocation</span> columns, with allocations entered as
            whole numbers.
          </p>
          {#if hasVoteLimits}
            <p class="typo-text-small">As per the round's configuration:</p>
            <ul class="requirements typo-text-small">
              {#if round.minVotesPerProjectPerVoter !== null}
                <li>
                  Minimum of {round.minVotesPerProjectPerVoter} votes per selected application.
                </li>
              {/if}
              {#if round.maxVotesPerProjectPerVoter !== null}
                <li>Maximum of {round.maxVotesPerProjectPerVoter} votes per application.</li>
              {/if}
              {#if round.maxVotesPerVoter !== null}
                <li>Total allocation may not exceed {round.maxVotesPerVoter} votes.</li>
              {/if}
            </ul>
          {/if}
          {#if round.voterGuidelinesLink}
            <p class="typo-text-small">
              See the round's
              <a
                class="typo-link"
                href={buildExternalUrl(round.voterGuidelinesLink)}
                target="_blank"
                rel="noopener noreferrer">voter guidelines</a
              > for more details.
            </p>
          {/if}
        </AnnotationBox>
      </div>
      {#if loadedFile && filetype && fileData}
        <div class="file-preview">
          <div class="file-info">
            {#if filetype === 'csv'}
              <FileCSV style="fill: var(--color-primary-level-6)" />
            {:else}
              <FileXLSX style="fill: var(--color-primary-level-6)" />
            {/if}
            <span class="typo-text"
              >{loadedFile.name} ({(loadedFile.size / 1024).toFixed(2)} KB)</span
            >
          </div>
          <Button
            variant="ghost"
            circular
            icon={CrossCircle}
            ariaLabel="Remove loaded file"
            onclick={resetFile}
          />
        </div>
      {:else}
        <DropZone
          filetypes={[
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ]}
          loading={submitting}
          on:input={handleFileInput}
        />
      {/if}
    </FormField>
  {/if}

  {#snippet actions()}
    <Button variant="ghost" onclick={handleCancel}>Cancel</Button>
    <Button
      variant="primary"
      disabled={!selectedVoter || !fileData || submitting || voters.length === 0}
      loading={submitting}
      onclick={handleSubmit}
      icon={Wallet}
    >
      Submit ballot
    </Button>
  {/snippet}
</StepLayout>

<style>
  .list-wrapper {
    height: 16rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem;
    overflow: hidden;
  }

  .file-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .requirements {
    padding-left: 1.25rem;
    margin: 0.5rem 0;
  }

  .requirements li {
    margin: 0.125rem 0;
    list-style: disc;
  }
</style>
