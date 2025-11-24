<script lang="ts">
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import WaveAvatar from '$lib/components/wave/wave-avatar/wave-avatar.svelte';
  import WaveStats from '$lib/components/wave/wave-stats/wave-stats.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let wave = $derived(data.wave);
</script>

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

<style>
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
