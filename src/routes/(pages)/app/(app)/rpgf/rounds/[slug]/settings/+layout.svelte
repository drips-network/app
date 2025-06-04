<script lang="ts">
  import RpgfSettingsLayout from '../../../components/rpgf-settings-layout.svelte';

  export let data;
</script>

<RpgfSettingsLayout wrappedDraftOrRound={data.wrappedRound}>
  <slot />
</RpgfSettingsLayout>
