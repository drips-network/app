<script lang="ts">
  import { page } from '$app/stores';
  import RpgfSettingsAdmins from '../../../../components/rpgf-settings-admins.svelte';

  export let data;
</script>

<RpgfSettingsAdmins
  settingsFormProps={{
    roundOrDraft: data.draftWrapper.draft,
    id: $page.params.id,
    isDraft: true,
  }}
/>
