<script lang="ts">
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Section from '$lib/components/section/section.svelte';
  import LedgerEntry from '$lib/components/wave/points/ledger-entry.svelte';

  let { data } = $props();
  let {
    pointsHistory: { data: pointsHistory },
  } = $derived(data);
</script>

<Section
  header={{
    label: 'Points history',
    icon: Trophy,
    infoTooltip:
      "Before you can add issues to a Wave, the source repo must be accepted by the Wave's organizers. This list shows the status of your repo applications.",
  }}
  skeleton={{
    loaded: true,
    empty: pointsHistory.length === 0,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No points history yet',
    emptyStateText: 'Earn points by completing tasks and participating in the community.',
  }}
>
  <div class="repo-applications-list">
    {#each pointsHistory as entry}
      <LedgerEntry ledgerEntry={entry} />
    {/each}
  </div>
</Section>
