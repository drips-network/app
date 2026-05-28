<script lang="ts">
  import WaveMockMaintainerIssuesScene from './mocks/wave-mock-maintainer-issues-scene.svelte';
  import WaveMockRewardScene from './mocks/wave-mock-reward-scene.svelte';
  import WaveMockSprintScene from './mocks/wave-mock-sprint-scene.svelte';
  import WaveSceneBg from './wave-scene-bg.svelte';

  let {
    compact = false,
  }: {
    compact?: boolean;
  } = $props();
</script>

{#snippet stageHeader(num: string, title: string, description: string)}
  <div class="stage-meta">
    <h3 class="stage-title typo-header-2">
      <span class="num-circle">{num}</span>
      <span>{title}</span>
    </h3>
    <p>{description}</p>
  </div>
{/snippet}

{#snippet connector(direction: 'down' | 'up')}
  <div class="connector" aria-hidden="true">
    <svg viewBox="0 0 200 40" preserveAspectRatio="none">
      {#if direction === 'down'}
        <path
          d="M0,20 Q50,0 100,20 T200,20"
          stroke="var(--color-primary-level-3)"
          stroke-width="2"
          fill="none"
          stroke-dasharray="4 4"
        />
      {:else}
        <path
          d="M0,20 Q50,40 100,20 T200,20"
          stroke="var(--color-primary-level-3)"
          stroke-width="2"
          fill="none"
          stroke-dasharray="4 4"
        />
      {/if}
    </svg>
  </div>
{/snippet}

<div class="explainer" class:compact>
  <!-- Stage 1: Scoping (text left, scene right) -->
  <div class="stage">
    {@render stageHeader(
      '1',
      'Maintainers add issues',
      'Maintainers pull issues from their backlog into the Wave Program and assign each a complexity — Trivial, Medium, or High — that determines its Points value.',
    )}

    <div class="scene scene-scoping">
      <WaveSceneBg />
      <WaveMockMaintainerIssuesScene />
    </div>
  </div>

  {@render connector('down')}

  <!-- Stage 2: Sprint (scene left, text right) -->
  <div class="stage reverse">
    {@render stageHeader(
      '2',
      'Contributors solve issues',
      'Contributors browse, apply, and merge PRs over one week. Every resolved issue awards Points and pushes the leaderboard live.',
    )}

    <div class="scene scene-sprint">
      <WaveSceneBg />
      <WaveMockSprintScene />
    </div>
  </div>

  {@render connector('up')}

  <!-- Stage 3: Reward (text left, scene right) -->
  <div class="stage">
    {@render stageHeader(
      '3',
      'Rewards are distributed',
      'When the Wave closes, the reward pool splits by Points share. Contributors withdraw on-chain — no spreadsheets, no manual accounting.',
    )}

    <div class="scene scene-reward">
      <WaveSceneBg />
      <WaveMockRewardScene />
    </div>
  </div>
</div>

<style>
  .explainer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    width: 100%;
  }

  .stage {
    display: grid;
    grid-template-columns: minmax(320px, 480px) 1fr;
    gap: 3rem;
    align-items: center;
  }

  .stage.reverse {
    grid-template-columns: 1fr minmax(320px, 480px);
  }

  .stage.reverse .stage-meta {
    order: 2;
  }

  .stage-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stage-meta :global(p) {
    color: var(--color-foreground-level-6);
  }

  .stage-title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin: 0;
  }

  /* Number sits inside a primary-tinted circle, inline with the title */
  .num-circle {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 50%;
    background: var(--color-primary-level-1);
    color: var(--color-primary);
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1;
  }

  .scene {
    position: relative;
    /* Form a stacking context so WaveSceneBg's z-index: -1 stays scoped */
    isolation: isolate;
    border-radius: 2rem 0 2rem 2rem;
    padding: 2.5rem;
    overflow: hidden;
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Scene 1: zoomed-in screenshot of the maintainers > issues page.
     Anchor content top-left, let it spill past the right + bottom edges
     so the panel reads as "we're looking at the top-left corner". */
  .scene-scoping {
    align-items: flex-start;
    justify-content: flex-start;
    padding: 2rem 0 0 2rem;
    height: 500px;
  }

  /* Scene 2: sprint — WaveMockSprintScene manages its own canvas internally,
     so this scene just provides the framed background. Override padding so the
     scene component can fill the area corner-to-corner. */
  .scene-sprint {
    padding: 0;
    min-height: 540px;
  }

  /* Scene 3: reward — WaveMockRewardScene manages its own layout. */
  .scene-reward {
    padding: 0;
    min-height: 460px;
  }

  /* Wavy connector between stages */
  .connector {
    height: 40px;
    width: 60%;
    margin: -0.5rem auto;
    opacity: 0.6;
  }

  .connector svg {
    width: 100%;
    height: 100%;
  }

  /* Compact mode for embedding on homepage band */
  .explainer.compact {
    gap: 2rem;
  }
  .explainer.compact .scene {
    padding: 1.5rem;
    min-height: 240px;
  }
  .explainer.compact .stage {
    gap: 2rem;
  }

  @media (max-width: 882px) {
    .stage,
    .stage.reverse {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .stage.reverse .stage-meta {
      order: 0;
    }
    .scene {
      padding: 1.5rem;
      min-height: 0;
    }
    /* Force each lifecycle illustration into a near-square box on mobile.
       Inner mock content is also scaled down via transform so cards are
       smaller and more of the composition fits within the square. */
    .scene-scoping,
    .scene-sprint,
    .scene-reward {
      height: auto;
      min-height: 0;
      aspect-ratio: 1 / 1;
    }
    /* Scenes 2 & 3 should fill edge-to-edge — no padding ring inside the bg.
       (`.scene { padding: 1.5rem }` above wins over per-scene `padding: 0`
       due to identical specificity + later position, so override explicitly.) */
    .scene-sprint,
    .scene-reward {
      padding: 0;
    }
    /* Stop the inner mock's own min-height/padding from creating gaps
       between the outer aspect-square frame and the content. */
    .scene-sprint :global(.scene),
    .scene-reward :global(.scene) {
      min-height: 0;
      padding: 0;
    }
    /* Scale inner mock content down. For scenes 2/3 we scale the *content*
       elements (.grid, .pool) — not the inner .scene wrapper — so the wrapper
       still fills the outer aspect-square box and the centered content reads
       at its intended scale within that frame.
       For scenes 2/3, .grid/.pool already use `transform: translate(-50%, -50%)`
       to center themselves, so the override re-declares both the translate
       and the scale to compose correctly. */
    .scene-scoping :global(.page) {
      transform: scale(0.65);
      transform-origin: top left;
    }
    .scene-sprint :global(.grid) {
      transform: translate(-50%, -50%) scale(0.6);
    }
    .scene-sprint :global(.cursor) {
      transform-origin: top left;
    }
    .scene-reward :global(.grid) {
      transform: translate(-50%, -50%) scale(0.65) rotate(-2deg);
    }
    .scene-reward :global(.pool.visible) {
      transform: translate(-50%, -50%) scale(0.85);
    }
    .connector {
      width: 30%;
      height: 30px;
    }
    .explainer {
      gap: 2rem;
    }
  }
</style>
