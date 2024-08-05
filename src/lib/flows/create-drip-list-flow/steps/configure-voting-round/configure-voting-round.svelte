<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import { slide } from 'svelte/transition';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let collaboratorsListValid = false;
  let restrictedRecipientsListValid = false;
  $: isValid =
    collaboratorsListValid &&
    $context.votingRoundConfig.votingEnds &&
    (!$context.votingRoundConfig.areRecipientsRestricted || restrictedRecipientsListValid);
</script>

<StandaloneFlowStepLayout
  headline="Collaborative list"
  description="Configure who should be able to vote on your list's recipients."
>
  <FormField title="Collaborators*">
    <ListEditor
      allowProjects={false}
      allowDripLists={false}
      bind:items={$context.votingRoundConfig.collaborators}
      bind:valid={collaboratorsListValid}
      weightsMode={false}
    />
  </FormField>

  <FormField
    title="Voting ends*"
    description="Choose the specific day and time this voting period should end. You and your collaborators will have until this time to suggest and vote on recipients."
  >
    <DateInput
      min={new Date()}
      bind:value={$context.votingRoundConfig.votingEnds}
      timePrecision="second"
    />
  </FormField>

  <FormField
    title="Hide collaborators"
    description="If you hide collaborators, only you as the publisher may see the list of collaborators and their votes. At the end of the voting period, only the vote's results will be made public."
  >
    <svelte:fragment slot="action">
      <Toggle bind:checked={$context.votingRoundConfig.areVotesPrivate} />
    </svelte:fragment>
  </FormField>

  <FormField
    title="Restrict to specific recipients"
    description="By default, any collaborator can suggest any recipient. Enable this to configure a list of ETH addresses, GitHub repos, or other Drip Lists that can be voted for."
  >
    <svelte:fragment slot="action">
      <Toggle bind:checked={$context.votingRoundConfig.areRecipientsRestricted} />
    </svelte:fragment>
    {#if $context.votingRoundConfig.areRecipientsRestricted}
      <div transition:slide={{ duration: 300 }}>
        <ListEditor
          allowAddresses={true}
          allowDripLists={true}
          allowProjects={true}
          weightsMode={false}
          bind:items={$context.votingRoundConfig.allowedRecipients}
          bind:valid={restrictedRecipientsListValid}
          maxItems={5000}
        />
      </div>
    {/if}
  </FormField>

  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!isValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
