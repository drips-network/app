<script lang="ts">
  import { page } from '$app/stores';
  import RpgfSettingsApplications from '../../../../components/rpgf-settings-applications.svelte';

  export let data;
</script>

<RpgfSettingsApplications
  settingsFormProps={{
    roundOrDraft: data.draftWrapper.draft,
    id: $page.params.id,
    isDraft: true,
  }}
/>
