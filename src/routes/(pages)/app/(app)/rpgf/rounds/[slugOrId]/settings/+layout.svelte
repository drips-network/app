<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import RpgfSettingsLayout from '../../../components/rpgf-settings-layout.svelte';

  let { data, children } = $props();
</script>

<HeadMeta title="Round Settings" />

<RpgfSettingsLayout round={data.round} amountOfVoters={data.ballotStats?.numberOfVoters ?? 0}>
  {@render children?.()}
</RpgfSettingsLayout>
