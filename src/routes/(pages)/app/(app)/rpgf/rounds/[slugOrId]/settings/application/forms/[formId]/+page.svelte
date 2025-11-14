<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfFormBuilder from '$lib/components/rpgf-form-builder/rpgf-form-builder.svelte';
  import { updateApplicationForm } from '$lib/utils/rpgf/rpgf.js';
  import RpgfSettingsForm from '../../../../../../components/rpgf-settings-form.svelte';

  let { data } = $props();
  let updatedFields = $state([...data.form.fields]);

  async function saveHandler() {
    await updateApplicationForm(undefined, data.round.id, data.form.id, {
      ...data.form,
      fields: updatedFields,
    });

    await invalidate('rpgf:round:applications:categories-and-forms');
  }
</script>

<RpgfSettingsForm {saveHandler}>
  <div class="form-header">
    <Button
      icon={ArrowLeft}
      circular
      href="/app/rpgf/rounds/{data.round.published
        ? data.round.urlSlug
        : data.round.id}/settings/application"
    />
    <h2>{data.form.name}</h2>
  </div>

  <RpgfFormBuilder bind:fields={updatedFields} />
</RpgfSettingsForm>

<style>
  .form-header {
    display: flex;
    gap: 1rem;
    width: 100%;
    align-items: center;
    margin-bottom: 1rem;
  }
</style>
