<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import type { ComponentProps } from 'svelte';
  import RpgfSettingsForm from './rpgf-settings-form.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = { ...settingsFormProps.roundOrDraft };
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft>
  <FormField title="Application intake start*">
    <DateInput
      bind:value={updatedRoundOrDraft.applicationPeriodStart}
      min={new Date()}
      max={updatedRoundOrDraft.applicationPeriodEnd ?? undefined}
    />
  </FormField>

  <FormField title="Application intake end*">
    <DateInput
      bind:value={updatedRoundOrDraft.applicationPeriodEnd}
      min={updatedRoundOrDraft.applicationPeriodStart ?? new Date()}
      max={updatedRoundOrDraft.votingPeriodStart ?? undefined}
    />
  </FormField>

  <FormField title="Voting start*">
    <DateInput
      bind:value={updatedRoundOrDraft.votingPeriodStart}
      min={updatedRoundOrDraft.applicationPeriodEnd ?? new Date()}
      max={updatedRoundOrDraft.votingPeriodEnd ?? undefined}
    />
  </FormField>

  <FormField title="Voting end*">
    <DateInput
      bind:value={updatedRoundOrDraft.votingPeriodEnd}
      min={updatedRoundOrDraft.votingPeriodStart ?? new Date()}
      max={updatedRoundOrDraft.resultsPeriodStart ?? undefined}
    />
  </FormField>

  <FormField title="Results start*">
    <DateInput
      bind:value={updatedRoundOrDraft.resultsPeriodStart}
      min={updatedRoundOrDraft.votingPeriodEnd ?? new Date()}
    />
  </FormField>
</RpgfSettingsForm>
