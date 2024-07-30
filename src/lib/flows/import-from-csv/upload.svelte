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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let uploadForm: HTMLFormElement | undefined = undefined;
  let file: File | undefined = undefined;

  $: formValid = !!file;

  function clearItems() {
    context.update((c) => {
      c.dripList.items = {};
      c.dripList.weights = {};
      return c;
    });
  }

  function addItem(key: AccountId, item: ListEditorItem, weight: number) {
    // $context.dripList.items
    context.update((c) => {
      c.dripList.items = {
        ...c.dripList.items,
        [key]: item,
      };

      c.dripList.weights[key] = weight * 10_000;

      return c;
    });
  }

  function handleDropZoneInput({ file: dropZoneFile }: { file: File }) {
    console.log('hello world', $context, dropZoneFile);
    file = dropZoneFile;
    uploadForm?.requestSubmit();
  }

  async function submit() {
    try {
      // parse the input file
      // TODO: only read 200 lines
      // TODO: add error handling for too many lines
      const data = (await parseFile(file)) as Array<[string, number]>;
      // clear the existing recipient entries
      clearItems();
      for (const [recipient, split] of data.slice(0, 200)) {
        // probably a header, skip it
        if (isNaN(split)) {
          continue;
        }

        console.log('Classifying', recipient);
        const classification = classifyRecipient(recipient);
        if (!classification) {
          // TODO: add an error for the line
          console.log('Not classifiable', classification);
          continue;
        }

        const isValid = await classification?.validate();
        if (!isValid) {
          // TODO: add and error for the line
          console.log('Not valid', classification.value);
          continue;
        }

        const { accountId, project, address, dripList } = await classification?.fetch();
        addItem(
          accountId,
          {
            type: classification.type,
            project,
            address,
            dripList,
          },
          split,
        );
        console.log('We found the thing', recipient, split, accountId, project, address, dripList);
        dispatch('conclude')

        // Now go through the entries
        // determine what they area
        // - validate the thing that they are
        // - fetch their account id information
        // if you can't determine what they are
        // - add to some sort of list of errors

        // console.log(recipient, split)
      }
    } catch (error) {
      console.error('Something bad happened', error);
    }
  }
</script>

<StepLayout>
  <StepHeader
    headline="Import recipients from CSV"
    description="Your CSV file should simply be formatted by first listing the recipient, then listing the percentage allocation. For example:"
  ></StepHeader>
  <CsvExample />
  <form bind:this={uploadForm} on:submit|preventDefault={submit}>
    <DropZone
      on:input={(event) => handleDropZoneInput({ file: event.detail.file })}
      filetypes={['text/csv']}
      instructions="Drop a CSV here to upload"
    />
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
      on:click={() => uploadForm?.requestSubmit()}>Import</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  /* .form-row {
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
    }
  } */
</style>
