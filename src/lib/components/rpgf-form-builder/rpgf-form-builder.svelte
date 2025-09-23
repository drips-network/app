<script lang="ts">
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import { flip } from 'svelte/animate';
  import Button from '../button/button.svelte';
  import Plus from '../icons/Plus.svelte';
  import DividerField from '../rpgf-application-form/components/divider-field.svelte';
  import EmailField from '../rpgf-application-form/components/email-field.svelte';
  import ListField from '../rpgf-application-form/components/list-field.svelte';
  import MarkdownField from '../rpgf-application-form/components/markdown-field.svelte';
  import SelectField from '../rpgf-application-form/components/select-field.svelte';
  import TextAreaField from '../rpgf-application-form/components/text-area-field.svelte';
  import TextField from '../rpgf-application-form/components/text-field.svelte';
  import UrlField from '../rpgf-application-form/components/url-field.svelte';
  import ComponentWrapper from './components/component-wrapper.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import type { ApplicationFieldDto } from '$lib/utils/rpgf/types/application';
  import Stepper from '../stepper/stepper.svelte';
  import addRpgfFormFieldFlow from '$lib/flows/add-rpgf-form-field/add-rpgf-form-field-flow';

  export let fields: ApplicationFieldDto[] = [];

  let applicationFormatWithKeys = fields.map((field) => ({
    ...field,
    key: `${crypto.randomUUID()}`,
  }));
  $: fields = applicationFormatWithKeys.map<ApplicationFieldDto>((field) => {
    // Remove the key from the field
    const newField: ApplicationFieldDto & { key?: string } = { ...field };
    delete newField.key;

    return newField;
  });

  const COMPONENT_MAP = {
    markdown: MarkdownField,
    divider: DividerField,
    list: ListField,
    select: SelectField,
    text: TextField,
    textarea: TextAreaField,
    url: UrlField,
    email: EmailField,
  };

  function move(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= applicationFormatWithKeys.length) return;

    const field = applicationFormatWithKeys[index];
    applicationFormatWithKeys.splice(index, 1);
    applicationFormatWithKeys.splice(newIndex, 0, field);

    applicationFormatWithKeys = [...applicationFormatWithKeys]; // Trigger reactivity
  }

  function deleteItem(index: number) {
    doWithConfirmationModal('Are you sure you want to delete this field?', () => {
      applicationFormatWithKeys.splice(index, 1);
      applicationFormatWithKeys = [...applicationFormatWithKeys]; // Trigger reactivity
    });
  }

  function editItem(index: number) {
    modal.show(
      Stepper,
      undefined,
      addRpgfFormFieldFlow(
        getSlugsWithout(
          'slug' in applicationFormatWithKeys[index]
            ? applicationFormatWithKeys[index].slug
            : undefined,
        ),
        (newField) => {
          applicationFormatWithKeys[index] = {
            ...newField,
            key: applicationFormatWithKeys[index].key, // Preserve the key
          };
          applicationFormatWithKeys = [...applicationFormatWithKeys]; // Trigger reactivity
        },
        applicationFormatWithKeys[index],
      ),
    );
  }

  function addItem(afterIndex: number) {
    modal.show(
      Stepper,
      undefined,
      addRpgfFormFieldFlow(slugs, (newField) => {
        applicationFormatWithKeys.splice(afterIndex + 1, 0, {
          ...newField,
          key: `${crypto.randomUUID()}`, // Generate a new key for the new field
        });
        applicationFormatWithKeys = [...applicationFormatWithKeys]; // Trigger reactivity
      }),
    );
  }

  $: slugs = mapFilterUndefined(applicationFormatWithKeys, (field) => {
    if ('slug' in field && field.slug) {
      return field.slug;
    }
    return undefined;
  });

  function getSlugsWithout(slug: string | undefined) {
    return slugs.filter((s) => s !== slug);
  }
</script>

<div class="form-builder">
  <div class="components">
    {#each applicationFormatWithKeys as applicationField, index (applicationField.key)}
      {@const type = applicationField.type}
      {@const Component = COMPONENT_MAP[type]}
      <div animate:flip={{ duration: 300 }}>
        {#if Component}
          <div class="component">
            <ComponentWrapper
              on:moveUp={() => move(index, 'up')}
              on:moveDown={() => move(index, 'down')}
              on:deleteItem={() => deleteItem(index)}
              on:editItem={() => editItem(index)}
              component={Component}
              fieldProp={applicationField}
            />
          </div>
        {:else}
          <p>Unknown field type: {type}</p>
        {/if}

        <div class="add-item-row">
          <Button on:click={() => addItem(index)} size="small" variant="ghost" icon={Plus}></Button>
        </div>
      </div>
    {/each}

    {#if applicationFormatWithKeys.length === 0}
      <div class="add-item-row">
        <Button on:click={() => addItem(-1)} size="small" variant="ghost" icon={Plus}>
          Add first field
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  .form-builder {
    width: 100%;
  }

  .components {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .add-item-row {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
  }
</style>
