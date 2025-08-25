<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import RpgfSettingsLayout from '../../../components/rpgf-settings-layout.svelte';

  export let data;
</script>

<HeadMeta title="Round Settings" />

<RpgfSettingsLayout wrappedDraftOrRound={data.wrappedDraft}>
  <slot />
</RpgfSettingsLayout>
