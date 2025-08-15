<script lang="ts">
  import RpgfSettingsVoting from '../../../../components/rpgf-settings-voting.svelte';

  export let data;
</script>

<RpgfSettingsVoting
  settingsFormProps={{
    wrappedDraftOrRound: data.wrappedRound,
  }}
/>
