<script lang="ts">
  import RpgfSettingsSchedule from '../../../../components/rpgf-settings-schedule.svelte';

  export let data;
</script>

<RpgfSettingsSchedule
  settingsFormProps={{
    wrappedDraftOrRound: data.wrappedRound,
  }}
/>
