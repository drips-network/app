<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import File from '$lib/components/icons/File.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
  import PulsatingCircle from '$lib/components/pulsating-circle/pulsating-circle.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { WaveDto, WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import { getWavePrograms, getWaves } from '$lib/utils/wave/wavePrograms';
  import WaveAudienceFunnel from './components/wave-audience-funnel.svelte';
  import WaveFlowExplainer from './components/wave-flow-explainer.svelte';
  import WaveHeroVisual from './components/wave-hero-visual.svelte';

  type LiveWave = { program: WaveProgramDto; wave: WaveDto };

  let liveWave = $state<LiveWave | null>(null);
  let loadingLive = $state(true);

  onMount(async () => {
    if (!browser) return;
    try {
      const programs = await getWavePrograms(fetch, { limit: 10 });
      for (const program of programs.data) {
        const waves = await getWaves(fetch, program.id, { limit: 5 });
        const wave =
          waves.data.find((w) => w.status === 'active' || w.status === 'upcoming') ?? null;
        if (wave) {
          liveWave = { program, wave };
          break;
        }
      }
    } catch {
      // Silently fail — the live strip is non-essential; the rest of the page is fine without it.
    } finally {
      loadingLive = false;
    }
  });
</script>

<HeadMeta
  title="Wave — recurring contribution sprints for open source"
  description="Drips Wave turns ecosystem budgets into a monthly rhythm of merged PRs. Maintainers clear backlog, contributors earn on-chain rewards, ecosystems get measurable progress."
/>

<!-- HERO -->
<section class="hero">
  <div class="hero-text">
    <div class="kicker">Drips Wave</div>
    <h1 class="pixelated">Fix. Merge. Earn — every month.</h1>
    <p class="lead">
      Drips Wave turns an ecosystem's funding into a recurring sprint of merged pull requests.
      Maintainers clear their backlog. Contributors get paid for shipping. Ecosystems get measurable
      progress, not promises.
    </p>
    <div class="hero-actions">
      <Button variant="primary" size="large" icon={Wave} href="/wave">Browse active Waves</Button>
      <Button size="large" icon={File} href="https://docs.drips.network/wave" target="_blank"
        >Read the docs</Button
      >
    </div>
  </div>

  <div class="hero-visual-wrap">
    <WaveHeroVisual />
  </div>
</section>

<!-- LIVE STRIP -->
<section class="live-strip" aria-live="polite">
  <div class="live-strip-inner" class:loading={loadingLive && !liveWave}>
    {#if liveWave}
      <div class="live-left">
        {#if liveWave.wave.status === 'active'}
          <PulsatingCircle />
          <span class="typo-text-bold"
            >{liveWave.program.name} Wave {liveWave.wave.waveNumber} is live</span
          >
          <span class="typo-text" style:color="var(--color-foreground-level-6)">
            until {formatDate(liveWave.wave.endDate, 'standardWithoutYear')}
          </span>
        {:else}
          <span class="typo-text-bold"
            >{liveWave.program.name} Wave {liveWave.wave.waveNumber} starts {formatDate(
              liveWave.wave.startDate,
              'standardWithoutYear',
            )}</span
          >
        {/if}
      </div>
      <div class="live-right">
        {#if liveWave.wave.status !== 'active'}
          <div class="stat">
            <span class="stat-label typo-all-caps">Reward pool</span>
            <span class="stat-value tnum"
              >${liveWave.wave.budgetUSD?.toLocaleString?.() ?? liveWave.wave.budgetUSD}</span
            >
          </div>
        {/if}
        <Button variant="primary" href="/wave/{liveWave.program.slug}">View Wave</Button>
      </div>
    {:else if loadingLive}
      <!-- Skeleton: keep the strip height steady so the page doesn't jump on hydration -->
      <div class="live-left">
        <div class="skel skel-dot"></div>
        <div class="skel skel-line" style:width="320px"></div>
      </div>
      <div class="live-right">
        <div class="skel skel-line" style:width="120px"></div>
      </div>
    {:else}
      <!-- No active or upcoming Wave at the moment (rare) -->
      <div class="live-left">
        <span class="typo-text" style:color="var(--color-foreground-level-6)"
          >No active Waves right now. Check back soon!</span
        >
      </div>
      <div class="live-right">
        <Button variant="primary" icon={Discord} href="/wave/link-discord">Join our Discord</Button>
      </div>
    {/if}
  </div>
</section>

<!-- ANATOMY / FLOW -->
<section class="anatomy">
  <div class="section-header">
    <span class="kicker-pill">How it works</span>
    <h2 class="pixelated">The anatomy of a Wave</h2>
    <p>
      One predictable rhythm. Three roles, each with their own job to do. Most Waves run on a
      monthly cycle.
    </p>
  </div>

  <WaveFlowExplainer />
</section>

<!-- AUDIENCE FUNNEL -->
<section class="audience">
  <WaveAudienceFunnel
    title="Three ways to get involved"
    description="Whether you're funding a Wave, running a repo in one, or shipping PRs to earn — start here."
  />
</section>

<!-- PROOF / STELLAR WAVE -->
<section class="proof">
  <div class="proof-inner">
    <div class="proof-header">
      <span class="kicker-pill">Live on Stellar</span>
      <h2 class="pixelated">The first Wave Program runs on Stellar</h2>
      <p>
        Stellar Development Foundation runs a monthly Wave across the Stellar open-source ecosystem.
        Maintainers across the network apply their repos, contributors ship issues, and the pool
        pays out at the end of each cycle.
      </p>
    </div>

    <div class="proof-stats">
      <div class="proof-stat">
        <span class="proof-value pixelated">$400k+</span>
        <span class="proof-label">Distributed to contributors</span>
      </div>
      <div class="proof-stat">
        <span class="proof-value pixelated">50k+</span>
        <span class="proof-label">Issues resolved across Waves</span>
      </div>
      <div class="proof-stat">
        <span class="proof-value pixelated">200+</span>
        <span class="proof-label">Repos in the program</span>
      </div>
    </div>

    <div class="proof-cta">
      <Button variant="primary" size="large" href="/wave/stellar">Explore the Stellar Wave</Button>
    </div>
  </div>
</section>

<style>
  /* ---------- shared section primitives ---------- */
  .section-header {
    max-width: 640px;
    margin: 0 auto 2.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .section-header h2 {
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.1;
  }

  .section-header p {
    color: var(--color-foreground-level-6);
  }

  .kicker-pill {
    background: var(--color-primary-level-1);
    color: var(--color-primary);
    padding: 0.375rem 0.875rem;
    border-radius: 2rem 0 2rem 2rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    width: fit-content;
  }

  .tnum {
    font-variant-numeric: tabular-nums;
  }

  /* ---------- HERO ---------- */
  .hero {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
    margin-top: -2rem;
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 560px;
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    background: var(--color-primary-level-1);
    color: var(--color-primary);
    border-radius: 2rem 0 2rem 2rem;
    width: fit-content;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .lead {
    color: var(--color-foreground-level-6);
    font-size: 1.125rem;
    line-height: 1.5;
  }

  .hero-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .hero-visual-wrap {
    width: 100%;
    height: 540px;
  }

  /* ---------- LIVE STRIP ---------- */
  .live-strip {
    width: 100%;
  }

  .live-strip-inner {
    background: var(--color-background);
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    /* Tall enough to match the loaded state (which includes a Button on the
       right), so the strip doesn't grow when content hydrates over the skel. */
    min-height: 5rem;
    box-sizing: border-box;
  }

  .live-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .live-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    align-items: flex-end;
  }

  .stat-label {
    color: var(--color-foreground-level-6);
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1;
  }

  /* Skeleton placeholders for client-hydrated content */
  .skel {
    background: linear-gradient(
      90deg,
      var(--color-foreground-level-2) 0%,
      var(--color-foreground-level-1) 50%,
      var(--color-foreground-level-2) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 0.5rem;
  }
  .skel-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }
  .skel-line {
    height: 1rem;
    max-width: 100%;
  }
  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  /* ---------- ANATOMY ---------- */
  .anatomy {
    width: 100%;
    padding-top: 2rem;
  }

  /* ---------- AUDIENCE ---------- */
  .audience {
    width: 100%;
  }

  /* ---------- PROOF ---------- */
  .proof {
    width: 100%;
  }

  .proof-inner {
    background: linear-gradient(
      135deg,
      var(--color-primary-level-1) 0%,
      var(--color-foreground-level-1) 100%
    );
    border-radius: 2rem 0 2rem 2rem;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .proof-header {
    text-align: center;
    max-width: 680px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .proof-header h2 {
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.1;
  }

  .proof-header p {
    color: var(--color-foreground-level-6);
  }

  .proof-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    width: 100%;
    max-width: 800px;
    margin: 0.5rem 0;
  }

  .proof-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    text-align: center;
  }

  .proof-value {
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1;
    color: var(--color-primary);
  }

  .proof-label {
    color: var(--color-foreground-level-6);
    font-size: 0.875rem;
  }

  /* ---------- Responsive ---------- */
  @media (max-width: 882px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-top: 0;
    }
    .hero-visual-wrap {
      height: 420px;
      max-width: 480px;
      margin: 0 auto;
    }
    .proof-inner {
      padding: 2rem 1.25rem;
    }
    .proof-stats {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
    .live-strip-inner {
      flex-direction: column;
      align-items: flex-start;
      /* Stacked layout: text row (~1.5rem) + gap (1.5rem) + button row (~2.5rem)
         + padding (2.5rem) ≈ 8rem. Locks the strip so the skeleton doesn't grow
         into the taller loaded state. */
      min-height: 8rem;
    }
    .live-right {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
