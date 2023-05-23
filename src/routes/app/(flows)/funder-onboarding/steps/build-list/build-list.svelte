<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from './components/list-editor/list-editor.svelte';
  import Check from 'radicle-design-system/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { State } from '../funder-onboarding-flow';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let listValid: boolean;

  $: valid = listValid && $context.dripList.title.length > 0;
</script>

<StandaloneFlowStepLayout description="What projects would you like to support?">
  <FormField title="Drip List*">
    <div class="project-list">
      <ListEditor
        bind:percentages={$context.dripList.percentages}
        bind:selected={$context.dripList.selected}
        bind:items={$context.dripList.items}
        bind:valid={listValid}
      />
    </div>
  </FormField>
  <FormField title="List Title*">
    <div class="project-list">
      <TextInput bind:value={$context.dripList.title} />
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button disabled={!valid} icon={Check} variant="primary" on:click={() => dispatch('goForward')}
      >Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .project-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
