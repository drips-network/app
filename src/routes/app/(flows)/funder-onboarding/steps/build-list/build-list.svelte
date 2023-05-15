<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Github from 'radicle-design-system/icons/Github.svelte';
  import Gitlab from 'radicle-design-system/icons/Gitlab.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from './components/list-editor.svelte';
  import Check from 'radicle-design-system/icons/Check.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let valid: boolean;
</script>

<StandaloneFlowStepLayout
  headline="Create your Drip List"
  subtitle="Paste a GitHub or GitLab repo URL below to start building your list."
>
  <FormField title="Projects">
    <div class="project-list">
      <ListEditor bind:valid />
      <div class="supported-forges">
        <div class="forge"><Github style="fill: var(--color-background)" /></div>
        <div class="forge"><Gitlab style="fill: var(--color-background)" /></div>
      </div>
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button disabled={!valid} icon={Check} variant="primary" on:click={() => dispatch('goForward')}
      >Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .supported-forges {
    display: flex;
    gap: 0.5rem;
  }

  .supported-forges .forge {
    background-color: var(--color-foreground-level-5);
    border-radius: 50%;
    padding: 0.25rem;
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
