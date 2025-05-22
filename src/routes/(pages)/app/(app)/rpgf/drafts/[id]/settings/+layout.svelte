<script lang="ts">
  import { page } from '$app/stores';
  import RpgfSettingsLayout from '../../../components/rpgf-settings-layout.svelte';

  export let data;
</script>

<RpgfSettingsLayout draftIdOrRoundSlug={$page.params.id} roundOrDraft={data.draft} isDraft>
  <slot />
</RpgfSettingsLayout>
