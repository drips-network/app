<script lang="ts">
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import RpgfRoundCard from '$lib/components/rpgf-round-card/rpgf-round-card.svelte';
  import Section from '$lib/components/section/section.svelte';
  import network from '$lib/stores/wallet/network';

  export let data;
  $: ownRoundsAndDrafts = [
    ...data.rounds.filter((round) => round.isAdmin),
    ...data.drafts.filter((draft) => draft.isAdmin),
  ];
  $: otherRounds = data.rounds.filter((round) => !round.isAdmin);
</script>

<div class="page">
  <Section
    header={{
      label: `Your rounds`,
      icon: ArrowCounterClockwiseHeart,
    }}
    skeleton={{
      loaded: true,
      empty: ownRoundsAndDrafts.length === 0,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: data.rpgfUserData
        ? 'Nothing to see here'
        : 'Connect your wallet to manage your rounds',
      emptyStateText: data.rpgfUserData
        ? 'You have no rounds or drafts that you are an admin of.'
        : 'Click "Connect" above to get started.',
    }}
  >
    <div class="card-grid">
      {#each ownRoundsAndDrafts ?? [] as wrappedRoundOrDraft}
        <RpgfRoundCard {wrappedRoundOrDraft} />
      {/each}
    </div>
  </Section>

  <Section
    header={{
      label: `All rounds on ${network.name}`,
      icon: ArrowCounterClockwiseHeart,
    }}
    skeleton={{
      loaded: true,
      empty: otherRounds.length === 0,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No rounds found',
      emptyStateText: 'There are no rounds available at the moment.',
    }}
  >
    <div class="card-grid">
      {#each otherRounds ?? [] as wrappedRound}
        <RpgfRoundCard wrappedRoundOrDraft={wrappedRound} />
      {/each}
    </div>
  </Section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .card-grid {
    display: grid;
    max-width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
  }
</style>
