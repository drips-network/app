<script lang="ts">
  import OrDivider from '$lib/components/rpgf-results-card/components/or-divider.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import CycleCard from '$lib/components/wave/cycle-card/cycle-card.svelte';
  import WaveAvatar from '$lib/components/wave/wave-avatar/wave-avatar.svelte';
  import WaveStats from '$lib/components/wave/wave-stats/wave-stats.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let wave = $derived(data.wave);

  let now = new Date();

  let upcomingOrActiveCycle = $derived(data.cycles.data[0]);

  let cycleActive = $derived(
    new Date(upcomingOrActiveCycle.startDate) <= now &&
      now <= new Date(upcomingOrActiveCycle.endDate),
  );
</script>

<div class="page">
  <div class="hero">
    <div class="wave-name">
      <Card style="height: 100%;">
        <div class="wave-name-inner">
          <WaveAvatar {wave} size={128} />
          <h1>{wave.name}</h1>

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

  <div class="divider">
    <OrDivider text={cycleActive ? 'Current Cycle' : 'Upcoming Cycle'} />
  </div>

  <CycleCard cycle={data.cycles.data[0]} />
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
</style>
