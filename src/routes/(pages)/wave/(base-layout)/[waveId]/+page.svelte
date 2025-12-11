<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import OrDivider from '$lib/components/rpgf-results-card/components/or-divider.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import CycleCard from '$lib/components/wave/cycle-card/cycle-card.svelte';
  import WaveAvatar from '$lib/components/wave/wave-avatar/wave-avatar.svelte';
  import WaveStats from '$lib/components/wave/wave-stats/wave-stats.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const { wave, cycles } = $derived(data);

  let upcomingCycle = $derived(cycles.data.find((cycle) => cycle.status === 'upcoming') ?? null);
  let activeCycle = $derived(cycles.data.find((cycle) => cycle.status === 'active') ?? null);
  let upcomingOrActiveCycle = $derived(upcomingCycle ?? activeCycle);

  let otherCycles = $derived(
    cycles.data.filter((cycle) => cycle.id !== (upcomingOrActiveCycle?.id ?? '')),
  );

  let cycleActive = $derived(activeCycle !== null);
</script>

<HeadMeta title="{wave.name} Wave" description={wave.description} />

<div class="page">
  <div class="hero">
    <div class="wave-name">
      <Card style="height: 100%;">
        <div class="bg"></div>
        <div class="wave-name-inner">
          <WaveAvatar {wave} size={128} />
          <h1>{wave.name} Wave</h1>

          <p style:color="var(--color-foreground-level-6)">{wave.description}</p>

          <div class="share">
            <ShareButton buttonVariant="normal" url={`https://drips.app/wave/${wave.id}`} />
          </div>
        </div>
      </Card>
    </div>

    <div class="wave-stats">
      <Card style="height: 100%;">
        <WaveStats {wave} />
      </Card>
    </div>
  </div>

  <section>
    <div class="divider">
      <OrDivider text={cycleActive ? 'Current Cycle' : 'Upcoming Cycle'} />
    </div>

    {#if upcomingOrActiveCycle}
      <CycleCard cycle={upcomingOrActiveCycle} />
    {:else}
      <Card>
        <div class="no-next-cycle">
          <p class="typo-text">
            There are no upcoming or active cycles for this Wave at the moment. Please check back
            later for updates.
          </p>
          <!-- todo(wave): NEWSLETTER SIGNUP -->
        </div>
      </Card>
    {/if}
  </section>

  <section>
    {#if otherCycles}
      <div class="divider">
        <OrDivider text="Explore past cycles" />
      </div>
    {/if}

    {#each otherCycles as cycle (cycle.id)}
      <CycleCard {cycle} />
    {/each}
  </section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 1rem;
  }

  .no-next-cycle {
    padding: 2rem;
    text-align: center;
    color: var(--color-foreground-level-5);
  }

  .hero {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-rows: min-content;
    grid-template-areas: 'name stats';
    gap: 1rem;
  }

  .wave-name {
    grid-area: name;
    min-height: 0;
    position: relative;
  }

  .wave-name .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    border-radius: 1rem 0 0 0;
    background-color: var(--color-primary-level-1);
    z-index: 0;
  }

  .wave-name-inner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 1rem;
  }

  .wave-name .share {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .wave-stats {
    grid-area: stats;
    min-height: 0;
  }

  @media (max-width: 1024px) {
    .hero {
      grid-template-columns: 1fr;
      grid-template-areas:
        'name'
        'stats';
    }
  }
</style>
