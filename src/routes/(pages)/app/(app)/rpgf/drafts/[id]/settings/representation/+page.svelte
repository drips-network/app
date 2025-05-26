<script lang="ts">
  import { page } from '$app/stores';
  import RpgfSettingsRepresentation from '../../../../components/rpgf-settings-representation.svelte';

  export let data;
</script>

<RpgfSettingsRepresentation
  settingsFormProps={{
    roundOrDraft: data.draftWrapper.draft,
    id: $page.params.id,
    isDraft: true,
  }}
/>
