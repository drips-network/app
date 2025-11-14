<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import CsvExample from './components/csv-example.svelte';
  import DropZone from '../../components/drop-zone/drop-zone.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '$lib/flows/create-drip-list-flow/create-drip-list-flow';
  import { classifyRecipient } from '$lib/components/list-editor/classifiers';
  import type { AccountId, ListEditorItem } from '$lib/components/list-editor/types';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { AddItemError, AddItemSuberror } from '$lib/components/list-editor/errors';
  import { createInvalidMessage } from '$lib/components/list-editor/validators';
  import { parseFile } from '$lib/flows/import-from-csv/parse-upload';
  import { DEFAULT_CSV_HEADERS, DEFAULT_MAX_ENTRIES } from './import-from-csv-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();
  const MAX_DECIMALS = 4;

  
  interface Props {
    context: Writable<State>;
    headline: string;
    description: string;
    allowProjects?: boolean;
    allowAddresses?: boolean;
    allowDripLists?: boolean;
    // csvHeaders[0] should always be an address
    csvHeaders?: Array<string>;
    csvMaxEntries?: number;
    exampleTableHeaders?: Array<string> | undefined;
    exampleTableData?: Array<Array<unknown>> | undefined;
    exampleTableCaption?: string | undefined;
    addItem?: (
    key: AccountId,
    item: ListEditorItem,
    weight: number | undefined,
  ) => undefined;
    clearItems?: () => undefined;
    onItemsError?: (errors: Array<AddItemSuberror>) => AddItemError;
    blockedAccountIds?: string[];
  }

  let {
    context,
    headline,
    description,
    allowProjects = true,
    allowAddresses = true,
    allowDripLists = true,
    csvHeaders = DEFAULT_CSV_HEADERS,
    csvMaxEntries = DEFAULT_MAX_ENTRIES,
    exampleTableHeaders = csvHeaders,
    exampleTableData = undefined,
    exampleTableCaption = undefined,
    addItem = () => undefined,
    clearItems = () => undefined,
    onItemsError = (errors) => {
    return new AddItemError(
      'Some of your imported recipients were invalid',
      'error',
      'They won’t be included in your splits.',
      errors,
    );
  },
    blockedAccountIds = []
  }: Props = $props();

  let uploadForm: HTMLFormElement | undefined = $state(undefined);
  let parsedFile: Array<Array<string>> = [];
  let loading: boolean = $state(false);
  let errors: Array<AddItemSuberror> = [];

  const customErrors: Array<string> = ['too-many-entries', 'wrong-filetype'] as const;
  let customErrorMessages: { [key: string]: string } = {
    'too-many-entries': 'There are more than 200 entries in the CSV.',
    'wrong-filetype': 'That’s not a CSV',
  };

  function roundToX(num: number | string, decimals: number | string): number {
    return +(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
  }

  function handleDropZoneInput() {
    uploadForm?.requestSubmit();
  }

  async function validateFile(file: File): Promise<string | false> {
    // sets global data used later in submit()
    parsedFile = await parseFile(file, csvHeaders);
    return parsedFile.length > csvMaxEntries ? 'too-many-entries' : false;
  }

  async function submit() {
    try {
      loading = true;

      // clear the existing recipient entries
      clearItems();

      for (const [index, [recipient, rawSplit]] of parsedFile.entries()) {
        if (!recipient.trim()) {
          continue;
        }

        const classification = classifyRecipient(recipient, {
          allowProjects,
          allowAddresses,
          allowDripLists,
        });

        // assume header, skip it
        if (!classification && index === 0) {
          continue;
        }

        // can't classify this input as something we recognize
        if (!classification) {
          const error = new AddItemSuberror(createInvalidMessage('unknown'), recipient, index + 1);
          errors.push(error);
          continue;
        }

        // a non-header entry with an invalid split should
        // produce an error. split will be undefined when there's no second
        // column in the file and null if there is a second column but the
        // value is not present.
        const split = parseFloat(rawSplit);
        // in the case of a list of collaborators, rawSplit will be undefined
        if (typeof rawSplit !== 'undefined' && !Number.isFinite(split)) {
          const error = new AddItemSuberror(
            'This has an invalid split value',
            recipient,
            index + 1,
          );
          errors.push(error);
          continue;
        }

        const isValid = await classification?.validate();
        // the input ain't valid
        if (!isValid) {
          const error = new AddItemSuberror(
            createInvalidMessage(classification.type),
            recipient,
            index + 1,
          );
          errors.push(error);
          continue;
        }

        const recipientResult = await classification?.fetch();
        // for some reason, we didn't get a good response
        if (!recipientResult) {
          const error = new AddItemSuberror(
            'We failed to get information for this.',
            recipient,
            index + 1,
          );
          errors.push(error);
          continue;
        }

        const { accountId, ...rest } = recipientResult;

        // Check if this accountId is blocked (already exists in another list)
        if (blockedAccountIds.includes(accountId)) {
          const error = new AddItemSuberror(
            'This recipient is already in another list',
            recipient,
            index + 1,
          );
          errors.push(error);
          continue;
        }

        const listEditorItem = { type: classification.type, ...rest } as ListEditorItem;
        const weight = typeof split === 'undefined' ? undefined : roundToX(split, MAX_DECIMALS);
        addItem(accountId, listEditorItem, weight);
      }

      // something happened during processing,
      // add a representative error
      if (errors.length) {
        const recipientError = onItemsError(errors);
        context.update((c) => {
          c.recipientErrors = [recipientError];
          return c;
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error processing csv', error);
      const fatalError = new AddItemError(
        'Something terrible happened',
        'error',
        (error as Error).message,
      );
      context.update((c) => {
        c.recipientErrors = [fatalError];
        return c;
      });
    } finally {
      loading = false;
      dispatch('conclude');
    }
  }
</script>

<StepLayout>
  <StepHeader {headline} {description}></StepHeader>
  <CsvExample
    headers={exampleTableHeaders ? exampleTableHeaders : undefined}
    data={exampleTableData ? exampleTableData : undefined}
    caption={exampleTableCaption}
  />
  <form id="upload-form" bind:this={uploadForm} onsubmit={preventDefault(submit)}>
    <DropZone
      validateCustom={validateFile}
      filetypes={['text/csv']}
      instructions="Drop a CSV here to upload"
      {loading}
      on:input={handleDropZoneInput}
    >
      <!-- @migration-task: migrate this slot by hand, `loading` would shadow a prop on the parent component -->
  <svelte:fragment slot="loading">
        <Spinner />
        <p class="typo-text">We’re parsing your CSV and building your list…</p>
      </svelte:fragment>
      {#snippet error({ error, defaultContent })}
          
          {#if error && customErrors.includes(error)}
            <p class="typo-text-bold">{customErrorMessages[error]}</p>
          {:else}
            {@html defaultContent}
          {/if}
        
          {/snippet}
    </DropZone>
  </form>
  <!-- @migration-task: migrate this slot by hand, `left-actions` is an invalid identifier -->
  <svelte:fragment slot="left-actions">
    <Button
      disabled={loading}
      variant="ghost"
      icon={ArrowLeft}
      onclick={() => dispatch('conclude')}>Back</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
</style>
