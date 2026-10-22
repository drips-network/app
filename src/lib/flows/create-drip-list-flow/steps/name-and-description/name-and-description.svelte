<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
    canCancel?: boolean;
  }

  let { context, canCancel = false }: Props = $props();

  let textAreaValidationState: TextInputValidationState = $derived(
    !$context.dripList.description
      ? { type: 'valid' }
      : $context.dripList.description.length >= 1000
        ? { type: 'invalid', message: `Cannot exceed ${Number(1000).toLocaleString()} characters.` }
        : /<[^>]+>/gi.test($context.dripList.description)
          ? { type: 'invalid', message: 'HTML currently not allowed.' }
          : { type: 'valid' },
  );

  let isValid = $derived(
    $context.dripList.title.length > 0 && textAreaValidationState.type === 'valid',
  );
</script>

<StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="Choose your new list's name and description."
>
  <FormField title="Title*">
    <TextInput bind:value={$context.dripList.title} />
  </FormField>

  <FormField title="Description">
    <TextArea
      bind:value={$context.dripList.description}
      resizable={true}
      validationState={textAreaValidationState}
    />
  </FormField>
  {#snippet actions()}
    {#if canCancel}
      <Button onclick={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    {/if}
    <Button disabled={!isValid} icon={Check} variant="primary" onclick={() => dispatch('goForward')}
      >Continue</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>
