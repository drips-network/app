<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import modal from '$lib/stores/modal';
  import {
    applicationFieldDtoSchema,
    type ApplicationFieldDto,
  } from '$lib/utils/rpgf/types/application';

  export let fieldSettings: ApplicationFieldDto;
  export let onSave: (field: ApplicationFieldDto) => void;
  export let unavailableSlugs: string[];

  let valid: boolean;
  $: {
    const normalizedFieldSettings = {
      ...fieldSettings,
      slug: 'slug' in fieldSettings ? fieldSettings.slug.toLowerCase().trim() : '',
    };

    const parseResult = applicationFieldDtoSchema.safeParse(normalizedFieldSettings);

    const slugUnavailable =
      'slug' in normalizedFieldSettings &&
      normalizedFieldSettings.slug &&
      unavailableSlugs.includes(normalizedFieldSettings.slug);

    valid = parseResult.success && !slugUnavailable;
  }

  let listSelectAddItemInput = '';
  $: listSelectAddItemInputValid =
    listSelectAddItemInput.trim() !== '' &&
    fieldSettings.type === 'select' &&
    !fieldSettings.options?.some(
      (option) => option.value.toLowerCase() === listSelectAddItemInput.trim().toLowerCase(),
    );

  function handleAddSelectOption() {
    if (fieldSettings.type !== 'select') return;

    const trimmedInput = listSelectAddItemInput.trim();

    fieldSettings.options = [
      ...(fieldSettings.options || []),
      { label: trimmedInput, value: trimmedInput },
    ];

    listSelectAddItemInput = '';
  }

  let listAddRowNameInput = '';
  let listAddRowDataType: 'text' | 'number' | 'url' = 'text';

  let maxItemsInput = '';
  $: {
    if ('maxItems' in fieldSettings && maxItemsInput) {
      fieldSettings.maxItems = Number(maxItemsInput);
    }
  }
</script>

<div class="field-settings-modal">
  <form
    on:submit|preventDefault={() => {
      onSave(fieldSettings);
      modal.hide();
    }}
  >
    {#if 'content' in fieldSettings}
      <FormField title="Markdown content*">
        <TextArea bind:value={fieldSettings.content} />
      </FormField>
    {/if}

    {#if 'label' in fieldSettings}
      <FormField title="Label*">
        <TextInput bind:value={fieldSettings.label} />
      </FormField>
    {/if}

    {#if 'descriptionMd' in fieldSettings}
      <FormField title="Description (Markdown)">
        <TextArea bind:value={fieldSettings.descriptionMd} />
      </FormField>
    {/if}

    {#if 'slug' in fieldSettings}
      <FormField
        title="Slug*"
        description="A unique identifier for this field. This is used to reference the field in CSV exports."
      >
        <TextInput bind:value={fieldSettings.slug} />
      </FormField>
    {/if}

    {#if 'options' in fieldSettings}
      <FormField title="Available options*">
        <div class="list-select-add-item-row" style="display: flex; gap: 0.5rem;">
          <TextInput bind:value={listSelectAddItemInput} placeholder="Option text" />
          <Button
            disabled={!listSelectAddItemInputValid}
            size="large"
            on:click={handleAddSelectOption}
            icon={CheckCircle}
            variant="primary">Add</Button
          >
        </div>
        <div class="list-options">
          {#each fieldSettings.options as option, index}
            <div class="list-option">
              <span class="typo-text">{option.label}</span>
              <Button
                on:click={() => {
                  fieldSettings.options = fieldSettings.options.filter((_, i) => i !== index);
                }}
                icon={Trash}
                variant="ghost"
                size="small"
              />
            </div>
          {/each}
          {#if fieldSettings.options.length === 0}
            <p class="typo-text empty">No options added yet.</p>
          {/if}
        </div>
      </FormField>
    {/if}

    {#if 'entryFields' in fieldSettings}
      <FormField
        type="div"
        title="Entry rows*"
        description="Define the rows that will need to be filled out for each entry in this list."
      >
        <div class="list-add-list-row-row" style="display: flex; gap: 0.5rem;">
          <TextInput
            bind:value={listAddRowNameInput}
            placeholder="Row name (e.g. 'Name', 'Email')"
            style="flex: 1;"
          />
          <div style:flex="1">
            <Dropdown
              bind:value={listAddRowDataType}
              options={[
                { title: 'Text', value: 'text' },
                { title: 'Number', value: 'number' },
                { title: 'URL', value: 'url' },
              ]}
            />
          </div>
          <Button
            size="large"
            on:click={() => {
              if (listAddRowNameInput.trim() === '') return;

              fieldSettings.entryFields = [
                ...(fieldSettings.entryFields || []),
                {
                  label: listAddRowNameInput,
                  type: listAddRowDataType,
                },
              ];
              listAddRowNameInput = '';
            }}
            icon={CheckCircle}
            variant="primary">Add</Button
          >
        </div>
        <div class="list-options">
          {#each fieldSettings.entryFields as entryField, index}
            <div class="list-option">
              <span class="typo-text">{entryField.label} ({entryField.type})</span>
              <Button
                on:click={() => {
                  fieldSettings.entryFields = fieldSettings.entryFields.filter(
                    (_, i) => i !== index,
                  );
                }}
                icon={Trash}
                variant="ghost"
                size="small"
              />
            </div>
          {/each}
          {#if fieldSettings.entryFields.length === 0}
            <p class="typo-text empty">No rows added yet.</p>
          {/if}
        </div>
      </FormField>
    {/if}

    {#if 'maxItems' in fieldSettings}
      <FormField
        title="Maximum number of items*"
        description="The maximum number of items that can be added to this field."
      >
        <TextInput
          bind:value={maxItemsInput}
          variant={{ type: 'number', min: 1 }}
          placeholder="Maximum amount of items"
        />
      </FormField>
    {/if}

    {#if 'required' in fieldSettings}
      <div class="toggle-with-description">
        <Toggle label="Required field" bind:checked={fieldSettings.required} />
      </div>
    {/if}

    {#if 'private' in fieldSettings}
      <div class="toggle-with-description">
        <Toggle label="Private field" bind:checked={fieldSettings.private} />
        <p>
          If a field is private, only admins and the applicant can see its contents. This is
          required for fields containing personally identifiable, or otherwise private information.
        </p>
      </div>
    {/if}

    <div class="submit-button">
      <Button disabled={!valid} variant="primary" icon={CheckCircle} type="submit">Save</Button>
    </div>
  </form>
</div>

<style>
  .field-settings-modal {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .submit-button {
    align-self: flex-end;
  }

  .toggle-with-description {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggle-with-description p {
    color: var(--color-foreground-level-5);
    margin: 0;
  }

  .list-options {
    border-radius: 1rem 0 1rem 1rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-4);
  }

  .list-options .list-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
  }

  .list-options .list-option:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .list-options .empty {
    padding: 2rem 0;
    color: var(--color-foreground-level-6);
    text-align: center;
  }
</style>
