<script lang="ts">
  import { run } from 'svelte/legacy';

  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { createApplicationCategory } from '$lib/utils/rpgf/rpgf';
  import type { ApplicationCategory, ApplicationForm } from '$lib/utils/rpgf/types/application';
  import unreachable from '$lib/utils/unreachable';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    roundId: string;
    existingCategories: ApplicationCategory[];
    existingApplicationForms: ApplicationForm[];
  }

  let { roundId, existingCategories, existingApplicationForms }: Props = $props();

  let canCreateCategory = $derived(existingApplicationForms.length > 0);

  let nameValue = $state('');
  let assignedFormId: string | undefined = $state(undefined);

  let nameValidationState: TextInputValidationState = $state({ type: 'unvalidated' });
  run(() => {
    if (nameValue.length === 0) {
      nameValidationState = { type: 'unvalidated' };
    } else if (nameValue.length > 255) {
      nameValidationState = { type: 'invalid', message: 'Name must be at most 255 characters' };
    } else if (
      existingCategories.some((cat) => cat.name.toLowerCase() === nameValue.toLowerCase())
    ) {
      nameValidationState = {
        type: 'invalid',
        message: 'A category with this name already exists',
      };
    } else {
      nameValidationState = { type: 'valid' };
    }
  });

  function handleCreate() {
    dispatch('await', {
      message: 'Creating category…',
      promise: async () => {
        await createApplicationCategory(undefined, roundId, {
          name: nameValue,
          applicationFormId: assignedFormId ?? unreachable(),
        });

        await invalidate('rpgf:round');

        dispatch('conclude');
      },
    });
  }
</script>

<StandaloneFlowStepLayout headline="Create category">
  {#if !canCreateCategory}
    <AnnotationBox type="info">
      You need to create at least one application form before you can create a category.
    </AnnotationBox>
  {/if}

  <FormField title="Name*" disabled={!canCreateCategory}>
    <TextInput
      validationState={nameValidationState}
      placeholder="On-chain infrastructure"
      bind:value={nameValue}
      disabled={!canCreateCategory}
    />
  </FormField>

  <FormField
    title="Assigned form*"
    disabled={!canCreateCategory}
    description="Select the application form that applicants will use to apply to this category. You can manage application forms in round settings."
  >
    <Dropdown
      options={existingApplicationForms.map((form) => ({
        title: form.name,
        value: form.id,
      }))}
      bind:value={assignedFormId}
      disabled={!canCreateCategory}
    />
  </FormField>

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={!canCreateCategory || nameValidationState.type !== 'valid' || !assignedFormId}
      type="submit"
      icon={CheckCircle}
      onclick={handleCreate}>Create category</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>
