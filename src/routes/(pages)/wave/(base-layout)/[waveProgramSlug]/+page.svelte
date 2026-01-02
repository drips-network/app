<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Globe from '$lib/components/icons/Globe.svelte';
  import X from '$lib/components/icons/X.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import OrDivider from '$lib/components/rpgf-results-card/components/or-divider.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import WaveCard from '$lib/components/wave/wave-card/wave-card.svelte';
  import WaveProgramAvatar from '$lib/components/wave/wave-program-avatar/wave-program-avatar.svelte';
  import WaveProgramStats from '$lib/components/wave/wave-program-stats/wave-program-stats.svelte';
  import { BASE_URL } from '$lib/utils/base-url';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const { waveProgram, waves } = $derived(data);

  let upcomingWave = $derived(waves.data.find((wave) => wave.status === 'upcoming') ?? null);
  let activeWave = $derived(waves.data.find((wave) => wave.status === 'active') ?? null);
  let upcomingOrActiveWave = $derived(upcomingWave ?? activeWave);

  let otherWaves = $derived(
    waves.data.filter((wave) => wave.id !== (upcomingOrActiveWave?.id ?? '')),
  );

  let waveActive = $derived(activeWave !== null);

  let shareImageUrl = $derived(`/api/share-images/wave-program/${waveProgram.id}.png`);
</script>

<HeadMeta
  title="{waveProgram.name} Wave"
  description={waveProgram.description}
  image={shareImageUrl}
  twitterImage={shareImageUrl}
/>

<div class="page">
  <div class="hero">
    <div class="wave-program-name">
      <Card style="height: 100%;">
        <div class="bg"></div>
        <div class="wave-program-name-inner">
          <WaveProgramAvatar {waveProgram} size={128} />
          <h1>{waveProgram.name}</h1>

          <p style:color="var(--color-foreground-level-6)">{waveProgram.description}</p>

          <div class="share">
            <ShareButton
              downloadableImageUrl={shareImageUrl}
              buttonVariant="normal"
              url={`${BASE_URL}/wave/${waveProgram.slug}`}
            />
          </div>
        </div>
      </Card>
    </div>

    <div class="wave-stats">
      <Card style="height: 100%;">
        <div class="wave-stats-inner">
          <WaveProgramStats leaderboard={data.leaderboard} {waveProgram} />

          {#if (waveProgram.metadata?.length ?? 0) > 0}
            <div class="metadata">
              {#each waveProgram.metadata as { type, value } (type)}
                {#if type === 'website'}
                  {@const url = new URL(value)}
                  <Button icon={Globe} href={value} target="_blank" rel="noopener noreferrer"
                    >{url.hostname}</Button
                  >
                {:else if type === 'x'}
                  {@const url = new URL(value)}
                  <Button icon={X} href={value} target="_blank" rel="noopener noreferrer"
                    >@{url.pathname.slice(1)}</Button
                  >
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </Card>
    </div>
  </div>

  {#if waveProgram.longDescription}
    <div class="description">
      <ExpandableText>
        <Markdown content={waveProgram.longDescription} />
      </ExpandableText>
    </div>
  {/if}

  <section>
    <div class="divider">
      <OrDivider text={waveActive ? 'Current Wave' : 'Upcoming Wave'} />
    </div>

    {#if upcomingOrActiveWave}
      <WaveCard wave={upcomingOrActiveWave} {waveProgram} />
    {:else}
      <Card>
        <div class="no-next-wave">
          <p class="typo-text">
            There are no upcoming or active Waves at the moment. Please check back later for
            updates.
          </p>
          <!-- todo(wave): NEWSLETTER SIGNUP -->
        </div>
      </Card>
    {/if}
  </section>

  <section>
    {#if otherWaves.length > 0}
      <div class="divider">
        <OrDivider text="Explore past waves" />
      </div>
    {/if}

    {#each otherWaves as wave (wave.id)}
      <WaveCard {wave} {waveProgram} />
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

  .description {
    width: 100%;
    max-width: 60rem;
    margin: 0 auto;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 1rem;
  }

  .no-next-wave {
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

  .wave-program-name {
    grid-area: name;
    min-height: 0;
    position: relative;
  }

  .wave-program-name .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    border-radius: 1rem 0 0 0;
    background-color: var(--color-primary-level-1);
    z-index: 0;
  }

  .wave-program-name-inner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 1rem;
  }

  .wave-program-name .share {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .wave-stats {
    grid-area: stats;
    min-height: 0;
  }

  .wave-stats-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    height: 100%;
  }

  .wave-stats-inner .metadata {
    margin-top: auto;
    display: flex;
    gap: 0.5rem;
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
