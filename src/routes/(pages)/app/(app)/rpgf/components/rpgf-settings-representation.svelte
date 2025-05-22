<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { ComponentProps } from 'svelte';
  import RpgfSettingsForm from './rpgf-settings-form.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = { ...settingsFormProps.roundOrDraft };
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft>
  <FormField title="Round name*">
    <TextInput bind:value={updatedRoundOrDraft.name} placeholder="My RPGF round" />
  </FormField>

  <FormField title="Description">
    <TextArea bind:value={updatedRoundOrDraft.description} placeholder="My RPGF round" resizable />
  </FormField>
</RpgfSettingsForm>
