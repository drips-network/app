<script lang="ts">
  import RpgfSettingsApplications from '../../../../components/rpgf-settings-applications.svelte';

  export let data;
</script>

<RpgfSettingsApplications
  settingsFormProps={{
    wrappedDraftOrRound: data.wrappedRound,
  }}
/>
