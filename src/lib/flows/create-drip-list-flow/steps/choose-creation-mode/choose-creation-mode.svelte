<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import TwoBigOptions from '$lib/components/two-big-options/two-big-options.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let canCancel = false;

  let textAreaValidationState: TextInputValidationState;
  $: textAreaValidationState = !$context.dripList.description
    ? { type: 'valid' }
    : $context.dripList.description.length >= 1000
    ? { type: 'invalid', message: `Cannot exceed ${Number(1000).toLocaleString()} characters.` }
    : /<[^>]+>/gi.test($context.dripList.description)
    ? { type: 'invalid', message: 'HTML currently not allowed.' }
    : { type: 'valid' };

  $: isValid =
    $context.selectedCreationMode !== undefined &&
    $context.dripList.title.length > 0 &&
    textAreaValidationState.type === 'valid';
</script>

<StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="Choose your new list's name and description, and decide how you'd like to add recipients."
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
  <FormField title="Recipients*">
    <TwoBigOptions
      bind:selected={$context.selectedCreationMode}
      option1={{
        emoji: '🧐',
        title: 'Choose by yourself',
        attributes: [
          {
            icon: DripList,
            text: 'Decide on recipients yourself',
          },
          {
            icon: TokenStreams,
            text: 'Still publicly available for donations',
          },
          {
            icon: Proposals,
            text: 'Decide to collaborate anytime later',
          },
        ],
      }}
      option2={{
        emoji: '👨‍👩‍👧',
        title: 'Collaborate on recipients',
        attributes: [
          {
            icon: DripList,
            text: 'Invite collaborators to decide together',
          },
          {
            icon: Proposals,
            text: 'Set a voting period',
          },
          {
            icon: ArrowUp,
            text: 'Publish your list after voting',
          },
        ],
      }}
    />
  </FormField>
  <svelte:fragment slot="actions">
    {#if canCancel}
      <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    {/if}
    <Button
      disabled={!isValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
