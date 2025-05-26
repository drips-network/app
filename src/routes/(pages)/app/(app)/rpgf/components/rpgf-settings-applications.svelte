<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import { onMount, type ComponentProps } from 'svelte';
  import RpgfSettingsForm, { intitialSettingsState } from './rpgf-settings-form.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import { getPresetBySlug, matchPreset, PRESETS } from '$lib/utils/rpgf/application-form-presets';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = intitialSettingsState(settingsFormProps.wrappedDraftOrRound);

  let selectedPreset: string;
  onMount(() => {
    if (updatedRoundOrDraft?.applicationFormat) {
      const preset = matchPreset(updatedRoundOrDraft.applicationFormat);
      selectedPreset = preset?.slug ?? '';
    } else {
      selectedPreset = '';
    }
  });

  $: valid = selectedPreset !== undefined;

  $: {
    if (selectedPreset) {
      updatedRoundOrDraft = {
        ...updatedRoundOrDraft,
        applicationFormat: getPresetBySlug(selectedPreset)?.applicationFormat ?? undefined,
      };
    }
  }
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft invalid={!valid}>
  <FormField
    title="Application form preset*"
    description="Select one of the following presets for your round's application form."
  >
    <div style:display="flex" style:flex-direction="column" style:gap="1rem">
      <Dropdown
        options={PRESETS.map((preset) => ({
          title: preset.name,
          icon: Ledger,
          value: preset.slug,
        }))}
        bind:value={selectedPreset}
      />
      <AnnotationBox>
        Application forms will be customizable fully in a future release. For now, reach out to us
        on Discord if you need a custom form.
      </AnnotationBox>
    </div>
  </FormField>
</RpgfSettingsForm>
