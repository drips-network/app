<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { State } from '../claim-project-flow';
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: formValid = $context.gitUrl.length > 0;
</script>

<StandaloneFlowStepLayout
  description="Enter your Git project’s URL to see if it has claimable funds and start the registration."
>
  <TextInput
    bind:value={$context.gitUrl}
    icon={LinkIcon}
    placeholder="Paste GitHub or GitLab project URL"
  />
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
