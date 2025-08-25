<script lang="ts">
  import RpgfSettingsRepresentation from '../../../../components/rpgf-settings-representation.svelte';

  export let data;
</script>

<RpgfSettingsRepresentation
  settingsFormProps={{
    wrappedDraftOrRound: data.wrappedRound,
  }}
/>
