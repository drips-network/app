<script lang="ts">
  import { page } from '$app/stores';
  import RpgfSettingsSchedule from '../../../../components/rpgf-settings-schedule.svelte';

  export let data;
</script>

<RpgfSettingsSchedule
  settingsFormProps={{
    roundOrDraft: data.draftWrapper.draft,
    id: $page.params.id,
    isDraft: true,
  }}
/>
