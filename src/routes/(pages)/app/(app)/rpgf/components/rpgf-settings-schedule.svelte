<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import { type ComponentProps } from 'svelte';
  import RpgfSettingsForm from './rpgf-settings-form.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = { ...settingsFormProps.roundOrDraft };

  let now = new Date();
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft>
  <FormField title="Application intake start*">
    <DateInput
      bind:value={updatedRoundOrDraft.applicationPeriodStart}
      min={now}
      timePrecision="minute"
    />
  </FormField>

  <FormField title="Application intake end*">
    <DateInput
      bind:value={updatedRoundOrDraft.applicationPeriodEnd}
      min={now}
      timePrecision="minute"
    />
  </FormField>

  <FormField title="Voting start*">
    <DateInput
      bind:value={updatedRoundOrDraft.votingPeriodStart}
      min={now}
      timePrecision="minute"
    />
  </FormField>

  <FormField title="Voting end*">
    <DateInput bind:value={updatedRoundOrDraft.votingPeriodEnd} min={now} timePrecision="minute" />
  </FormField>

  <FormField title="Results start*">
    <DateInput
      bind:value={updatedRoundOrDraft.resultsPeriodStart}
      min={now}
      timePrecision="minute"
    />
  </FormField>
</RpgfSettingsForm>
