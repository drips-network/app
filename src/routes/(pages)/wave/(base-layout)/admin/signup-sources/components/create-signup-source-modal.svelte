<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Copy from '$lib/components/icons/Copy.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import { createSignupSource } from '$lib/utils/wave/signupSources';
  import { BASE_URL } from '$lib/utils/base-url';

  interface Props {
    onCreated: () => void;
  }

  let { onCreated }: Props = $props();

  let code = $state('');
  let name = $state('');
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let codeFocussed = $state(false);
  let nameFocussed = $state(false);

  let createdSource = $state<{ code: string } | null>(null);

  const CODE_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

  const codeValid = $derived(code.length >= 3 && code.length <= 100 && CODE_PATTERN.test(code));
  const nameValid = $derived(name.length >= 1 && name.length <= 255);

  const codeValidationState = $derived.by(() => {
    if (!codeFocussed || code.length === 0) return undefined;
    if (code.length < 3)
      return { type: 'invalid' as const, message: 'Must be at least 3 characters.' };
    if (code.length > 100)
      return { type: 'invalid' as const, message: 'Must be 100 characters or fewer.' };
    if (!CODE_PATTERN.test(code))
      return {
        type: 'invalid' as const,
        message: 'Only lowercase letters, numbers, and hyphens allowed.',
      };
    return { type: 'valid' as const };
  });

  const nameValidationState = $derived.by(() => {
    if (!nameFocussed || name.length === 0) return undefined;
    if (name.length > 255)
      return { type: 'invalid' as const, message: 'Must be 255 characters or fewer.' };
    return { type: 'valid' as const };
  });

  const canSubmit = $derived(codeValid && nameValid && !submitting);

  async function handleSubmit() {
    if (!canSubmit) return;

    submitting = true;
    error = null;

    try {
      await createSignupSource(fetch, { code, name });
      createdSource = { code };
      onCreated();
    } catch (e) {
      if (e instanceof Error && e.message.includes('409')) {
        error = `A signup source with code "${code}" already exists.`;
      } else {
        error = e instanceof Error ? e.message : 'An unexpected error occurred.';
      }
    } finally {
      submitting = false;
    }
  }

  async function copySignupUrl() {
    if (!createdSource) return;
    const url = `${BASE_URL}/wave/login?ref=${createdSource.code}`;
    await navigator.clipboard.writeText(url);
  }
</script>

<div class="modal">
  {#if createdSource}
    <StandaloneFlowStepLayout
      headline="Source created"
      description="Signup source has been created successfully."
    >
      <div class="fields">
        <FormField title="Signup URL" type="div">
          <div class="url-box">
            <code class="typo-text-small">{BASE_URL}/wave/login?ref={createdSource.code}</code>
          </div>
        </FormField>
      </div>

      {#snippet actions()}
        <Button variant="ghost" icon={Copy} onclick={copySignupUrl}>Copy URL</Button>
        <Button variant="primary" onclick={modal.hide}>Done</Button>
      {/snippet}
    </StandaloneFlowStepLayout>
  {:else}
    <StandaloneFlowStepLayout
      headline="Create signup source"
      description="Create a new attribution source code for tracking signup origins."
    >
      <div class="fields">
        <FormField
          title="Code"
          description="Lowercase letters, numbers, and hyphens. 3–100 characters."
          validationState={codeValidationState}
        >
          <TextInput
            bind:value={code}
            placeholder="e.g. twitter-campaign"
            onblur={() => (codeFocussed = true)}
          />
        </FormField>

        <FormField
          title="Name"
          description="A human-readable label for this source."
          validationState={nameValidationState}
        >
          <TextInput
            bind:value={name}
            placeholder="e.g. Twitter Campaign Q1"
            onblur={() => (nameFocussed = true)}
          />
        </FormField>
      </div>

      {#if error}
        <AnnotationBox type="error">{error}</AnnotationBox>
      {/if}

      {#snippet actions()}
        <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
        <Button
          variant="primary"
          icon={Plus}
          loading={submitting}
          disabled={!canSubmit}
          onclick={handleSubmit}
        >
          Create
        </Button>
      {/snippet}
    </StandaloneFlowStepLayout>
  {/if}
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

  .url-box {
    background-color: var(--color-foreground-level-1);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    word-break: break-all;
  }
</style>
