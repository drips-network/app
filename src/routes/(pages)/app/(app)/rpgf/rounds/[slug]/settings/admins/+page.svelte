<script lang="ts">
  import RpgfSettingsAdmins from '../../../../components/rpgf-settings-admins.svelte';

  export let data;
</script>

<RpgfSettingsAdmins
  settingsFormProps={{
    wrappedDraftOrRound: data.wrappedRound,
  }}
/>
