<script lang="ts">
  import { page } from '$app/stores';
  import RpgfSettingsVoting from '../../../../components/rpgf-settings-voting.svelte';

  export let data;
</script>

<RpgfSettingsVoting
  settingsFormProps={{
    roundOrDraft: data.draft,
    id: $page.params.id,
    isDraft: true,
  }}
/>
