<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import modal from '$lib/stores/modal';
  import { createTag, updateTag } from '$lib/utils/wave/tags';
  import type { Tag } from '$lib/utils/wave/types/waveProgram';

  interface Props {
    onSaved: () => void;
    existingTag?: Tag;
  }

  let { onSaved, existingTag }: Props = $props();

  const isEdit = $derived(!!existingTag);

  let name = $state(existingTag?.name ?? '');
  let color = $state(existingTag?.color ?? '#6366f1');
  let imageUrl = $state(existingTag?.imageUrl ?? '');
  let submitting = $state(false);
  let error = $state<string | null>(null);

  const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

  const nameValid = $derived(name.trim().length >= 1 && name.trim().length <= 50);
  const colorValid = $derived(COLOR_PATTERN.test(color));
  const canSubmit = $derived(nameValid && colorValid && !submitting);

  async function handleSubmit() {
    if (!canSubmit) return;

    submitting = true;
    error = null;

    try {
      const data = {
        name: name.trim(),
        color,
        imageUrl: imageUrl.trim() || null,
      };

      if (isEdit && existingTag) {
        await updateTag(fetch, existingTag.id, data);
      } else {
        await createTag(fetch, data);
      }
      onSaved();
      modal.hide();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout
    headline={isEdit ? 'Edit tag' : 'Create tag'}
    description={isEdit
      ? 'Update the tag name or color.'
      : 'Create a new tag that can be assigned to repos.'}
  >
    <div class="fields">
      <FormField title="Name" description="1–50 characters.">
        <TextInput bind:value={name} placeholder="e.g. DeFi" />
      </FormField>

      <FormField title="Color" description="Hex color code.">
        <div class="color-field">
          <input type="color" bind:value={color} class="color-picker" />
          <TextInput bind:value={color} placeholder="#6366f1" />
        </div>
      </FormField>

      <FormField title="Image URL" description="Optional. Displayed as a background on repo cards.">
        <TextInput bind:value={imageUrl} placeholder="https://example.com/image.png" />
      </FormField>

      {#if imageUrl.trim()}
        <div class="image-preview">
          <span class="typo-text-small" style:color="var(--color-foreground-level-5)"
            >Image preview:</span
          >
          <img src={imageUrl.trim()} alt="Tag preview" class="preview-img" />
        </div>
      {/if}

      <div class="preview">
        <span class="typo-text-small" style:color="var(--color-foreground-level-5)">Preview:</span>
        <span
          class="tag-preview"
          style:background-color="{color}20"
          style:color
          style:border-color="{color}40"
        >
          {name || 'Tag name'}
        </span>
      </div>
    </div>

    {#if error}
      <AnnotationBox type="error">{error}</AnnotationBox>
    {/if}

    {#snippet actions()}
      <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
      <Button variant="primary" loading={submitting} disabled={!canSubmit} onclick={handleSubmit}>
        {isEdit ? 'Save' : 'Create'}
      </Button>
    {/snippet}
  </StandaloneFlowStepLayout>
</div>

<style>
  .modal {
    padding: 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .color-field {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .color-picker {
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 0.5rem;
    padding: 0.125rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  .image-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-img {
    width: 100%;
    max-height: 6rem;
    object-fit: contain;
    border-radius: 0.5rem;
    background: var(--color-foreground-level-1);
  }

  .preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag-preview {
    display: inline-flex;
    align-items: center;
    padding: 0.0625rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid;
  }
</style>
