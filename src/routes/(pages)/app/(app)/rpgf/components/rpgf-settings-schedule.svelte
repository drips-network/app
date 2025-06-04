<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import { type ComponentProps } from 'svelte';
  import RpgfSettingsForm, { intitialSettingsState } from './rpgf-settings-form.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;
  $: isDraft = settingsFormProps.wrappedDraftOrRound.type === 'round-draft';

  let updatedRoundOrDraft = intitialSettingsState(settingsFormProps.wrappedDraftOrRound);

  let now = new Date();
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft>
  {#if !isDraft}
    <div style:align-self="flex-start">
      <AnnotationBox>
        The schedule of an ongoing, published round can no longer be changed.
      </AnnotationBox>
    </div>
  {/if}

  <FormField title="Application intake start*" disabled={!isDraft}>
    <DateInput
      bind:value={updatedRoundOrDraft.applicationPeriodStart}
      min={isDraft ? now : undefined}
      timePrecision="minute"
    />
  </FormField>

  <FormField title="Application intake end*" disabled={!isDraft}>
    <DateInput
      bind:value={updatedRoundOrDraft.applicationPeriodEnd}
      min={isDraft ? now : undefined}
      timePrecision="minute"
    />
  </FormField>

  <FormField title="Voting start*" disabled={!isDraft}>
    <DateInput
      bind:value={updatedRoundOrDraft.votingPeriodStart}
      min={isDraft ? now : undefined}
      timePrecision="minute"
    />
  </FormField>

  <FormField title="Voting end*" disabled={!isDraft}>
    <DateInput bind:value={updatedRoundOrDraft.votingPeriodEnd} min={now} timePrecision="minute" />
  </FormField>

  <FormField title="Results start*" disabled={!isDraft}>
    <DateInput
      bind:value={updatedRoundOrDraft.resultsPeriodStart}
      min={isDraft ? now : undefined}
      timePrecision="minute"
    />
  </FormField>
</RpgfSettingsForm>
