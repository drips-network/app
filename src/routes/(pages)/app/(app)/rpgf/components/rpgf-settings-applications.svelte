<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import RpgfSettingsForm, { intitialSettingsState } from './rpgf-settings-form.svelte';
  import RpgfFormBuilder from '$lib/components/rpgf-form-builder/rpgf-form-builder.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = intitialSettingsState(settingsFormProps.wrappedDraftOrRound);

  $: valid =
    updatedRoundOrDraft.applicationFormat && updatedRoundOrDraft.applicationFormat.length > 0;
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft invalid={!valid}>
  <FormField
    title="Application format*"
    descriptionMd="All applications will need to **select a Drips project to apply with**, submit a **name for their application**, and additionally fill out the **custom fields** you can configure below."
    type="div"
  >
    <div style:margin-top="2rem">
      <RpgfFormBuilder bind:applicationFormat={updatedRoundOrDraft.applicationFormat} />
    </div>
  </FormField>
</RpgfSettingsForm>
