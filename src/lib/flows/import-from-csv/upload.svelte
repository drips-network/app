<script lang="ts">
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
  import { parseFile } from '$lib/flows/import-from-csv/parse-csv';

  const dispatch = createEventDispatcher<StepComponentEvents>();
  const DEFAULT_MAX_ENTRIES = 200;
  const MAX_DECIMALS = 4;

  export let context: Writable<State>;
  export let headline: string;
  export let description: string;
  export let allowProjects: boolean = true;
  export let allowAddresses: boolean = true;
  export let allowDripLists: boolean = true;
  // csvHeaders[0] should always be an address
  export let csvHeaders: Array<string> = ['recipient', 'percentage'];
  export let csvMaxEntries: number = DEFAULT_MAX_ENTRIES;
  export let exampleTableHeaders: Array<string> | undefined = csvHeaders;
  export let exampleTableData: Array<Array<unknown>> | undefined = undefined;
  export let exampleTableCaption: string | undefined = undefined;
  export let addItem: (
    key: AccountId,
    item: ListEditorItem,
    weight: number | undefined,
  ) => undefined = () => undefined;
  export let clearItems: () => undefined = () => undefined;
  export let onItemsError: (errors: Array<AddItemSuberror>) => AddItemError = (errors) => {
    return new AddItemError(
      'Some of your imported recipients were invalid',
      'error',
      'They won’t be included in your splits.',
      errors,
    );
  };

  let uploadForm: HTMLFormElement | undefined = undefined;
  let parsedFile: Array<Array<string>> = [];
  let loading: boolean = false;
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
  <form id="upload-form" bind:this={uploadForm} on:submit|preventDefault={submit}>
    <DropZone
      validateCustom={validateFile}
      filetypes={['text/csv']}
      instructions="Drop a CSV here to upload"
      {loading}
      on:input={handleDropZoneInput}
    >
      <svelte:fragment slot="loading">
        <Spinner />
        <p class="typo-text">We’re parsing your CSV and building your list…</p>
      </svelte:fragment>
      <svelte:fragment slot="error" let:error let:defaultContent>
        {#if error && customErrors.includes(error)}
          <p class="typo-text-bold">{customErrorMessages[error]}</p>
        {:else}
          {@html defaultContent}
        {/if}
      </svelte:fragment>
    </DropZone>
  </form>
  <svelte:fragment slot="left-actions">
    <Button
      disabled={loading}
      variant="ghost"
      icon={ArrowLeft}
      on:click={() => dispatch('conclude')}>Back</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
</style>
