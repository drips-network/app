<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import CsvExample from './components/csv-example.svelte';
  import DropZone from './components/drop-zone.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import { parseFile } from '$lib/utils/csv';
  import type { Writable } from 'svelte/store';
  import type { State } from '$lib/flows/create-drip-list-flow/create-drip-list-flow';
  import { classifyRecipient } from '$lib/components/list-editor/classifiers';
  import type { AccountId, ListEditorItem } from '$lib/components/list-editor/types';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { AddItemError, AddItemSuberror } from '$lib/components/list-editor/errors';
  import { createInvalidMessage } from '$lib/components/list-editor/validators';

  const dispatch = createEventDispatcher<StepComponentEvents>();
  const MAX_ENTRIES = 200;
  const WEIGHT_FACTOR = 10_000;
  const MAX_DECIMALS = 4;

  export let context: Writable<State>;

  let uploadForm: HTMLFormElement | undefined = undefined;
  let file: File | undefined = undefined;
  let parsedFile: Array<[string, number]> = [];
  let loading: boolean = false;
  let errors: Array<AddItemSuberror> = [];

  const customErrors: Array<string> = ['too-many-entries', 'wrong-filetype'] as const;
  let customErrorMessages: { [key: string]: string } = {
    'too-many-entries': 'There are more than 200 entries in the CSV.',
    'wrong-filetype': 'That’s not a CSV',
  };

  $: formValid = !!file;

  function roundToX(num: number | string, decimals: number | string): number {
    return +(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
  }

  function clearItems() {
    context.update((c) => {
      c.dripList.items = {};
      c.dripList.weights = {};
      return c;
    });
  }

  function addItem(key: AccountId, item: ListEditorItem, weight: number) {
    context.update((c) => {
      c.dripList.items = {
        ...c.dripList.items,
        [key]: item,
      };

      c.dripList.weights[key] = weight * WEIGHT_FACTOR;

      return c;
    });
  }

  function handleDropZoneInput({ file: dropZoneFile }: { file: File }) {
    file = dropZoneFile;
    uploadForm?.requestSubmit();
  }

  async function validateFile(file: File): Promise<string | false> {
    parsedFile = (await parseFile(file)) as Array<[string, number]>;
    let headerAdjustment = 0;
    if (isNaN(parsedFile[0][1])) {
      headerAdjustment = 1;
    }

    return parsedFile.length > MAX_ENTRIES + headerAdjustment ? 'too-many-entries' : false;
  }

  async function submit() {
    try {
      loading = true;

      // clear the existing recipient entries
      clearItems();

      for (const [index, [recipient, split]] of parsedFile.entries()) {
        // assume header, skip
        if (isNaN(split) && index === 0) {
          continue;
        }

        // a non-header entry with an invalid split should
        // produce an error
        if (!Number.isFinite(split)) {
          const error = new AddItemSuberror(
            'This has an invalid split value',
            recipient,
            index + 1,
          );
          errors.push(error);
          continue;
        }

        const classification = classifyRecipient(recipient);
        // can't classify this input as something we recognize
        if (!classification) {
          const error = new AddItemSuberror(createInvalidMessage('unknown'), recipient, index + 1);
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
        addItem(accountId, listEditorItem, roundToX(split, MAX_DECIMALS));
      }

      // something happened during processing,
      // add a representative error
      if (errors.length) {
        const recipientError = new AddItemError(
          'Some of your imported recipients',
          'error',
          'They won’t be included in your splits.',
          errors,
        );

        context.update((c) => {
          c.recipientErrors = [recipientError];
          return c;
        });
      }

      dispatch('conclude');
    } catch (error) {
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
    }
  }
</script>

<StepLayout>
  <StepHeader
    headline="Import recipients from CSV"
    description="Your CSV file should simply be formatted by first listing the recipient, then listing the percentage allocation. For example:"
  ></StepHeader>
  <CsvExample />
  <form id="upload-form" bind:this={uploadForm} on:submit|preventDefault={submit}>
    <DropZone
      validateCustom={validateFile}
      filetypes={['text/csv']}
      instructions="Drop a CSV here to upload"
      {loading}
      on:input={(event) => handleDropZoneInput({ file: event.detail.file })}
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
    <Button variant="ghost" icon={ArrowLeft} on:click={() => dispatch('conclude')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button
      icon={ArrowDown}
      variant="primary"
      disabled={!formValid}
      type="submit"
      form="upload-form"
      on:click={() => uploadForm?.requestSubmit()}>Import</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
</style>
