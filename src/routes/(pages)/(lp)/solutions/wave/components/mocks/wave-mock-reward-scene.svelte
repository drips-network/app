<script lang="ts">
  import { onMount } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import WaveMockUserBadge from './wave-mock-user-badge.svelte';

  // ------- data -------
  // 48 fictional recipients in random order with per-contributor grants in
  // the $10–$120 range. Names are placeholders; never use real people here.
  const REWARD_RECIPIENTS = [
    { name: 'mira-codes', amount: 42 },
    { name: 'meridian-dev', amount: 18 },
    { name: 'horizon42', amount: 95 },
    { name: 'kovri-h', amount: 25 },
    { name: 'orbit-jay', amount: 67 },
    { name: 'pasta-stream', amount: 12 },
    { name: 'sora-builds', amount: 88 },
    { name: 'lattice-rs', amount: 34 },
    { name: 'velorum', amount: 52 },
    { name: 'nyx-eth', amount: 110 },
    { name: 'spire-dev', amount: 22 },
    { name: 'kepler-77', amount: 45 },
    { name: 'aurorae', amount: 15 },
    { name: 'ophelia.dev', amount: 73 },
    { name: 'wren-rs', amount: 28 },
    { name: 'nodemonk', amount: 56 },
    { name: 'cinder-x', amount: 38 },
    { name: 'reverb-dev', amount: 11 },
    { name: 'okto-codes', amount: 82 },
    { name: 'helio-77', amount: 30 },
    { name: 'corvid', amount: 48 },
    { name: 'fern-net', amount: 14 },
    { name: 'tinder-rs', amount: 105 },
    { name: 'lattice-fox', amount: 36 },
    { name: 'zephyr-stack', amount: 17 },
    { name: 'mantle-rs', amount: 62 },
    { name: 'drift-codes', amount: 26 },
    { name: 'nexa-77', amount: 91 },
    { name: 'prism-dev', amount: 41 },
    { name: 'basilisk', amount: 20 },
    { name: 'vortex-x', amount: 78 },
    { name: 'ember-cs', amount: 13 },
    { name: 'photon-9', amount: 54 },
    { name: 'citrine', amount: 33 },
    { name: 'glade-rs', amount: 70 },
    { name: 'mango-builds', amount: 19 },
    { name: 'aspen-rs', amount: 86 },
    { name: 'crimson', amount: 24 },
    { name: 'indigo-dev', amount: 60 },
    { name: 'helix-77', amount: 16 },
    { name: 'lumen-codes', amount: 47 },
    { name: 'mosaic', amount: 102 },
    { name: 'nettle', amount: 29 },
    { name: 'omega-z', amount: 39 },
    { name: 'parallax', amount: 21 },
    { name: 'quill-rs', amount: 75 },
    { name: 'raven-codes', amount: 31 },
    { name: 'sterling-dev', amount: 50 },
  ];

  // The visible recipients are an illustrative sampling. The headline pool
  // size is the program total, not the sum of just these 24 cards.
  const POOL_TOTAL = 50000;

  // Avatars are pre-downloaded from DiceBear's `notionists` style, keyed by
  // recipient name. See /static/assets/wave/mock-avatars/.
  function avatarFor(i: number) {
    return `/assets/wave/mock-avatars/${REWARD_RECIPIENTS[i].name}.svg`;
  }

  // Card layout: mirrors the CSS `grid-template-columns: repeat(6, 180px)`.
  // Used for the diagonal-stagger calc on the card pop / badge reveal.
  const CARDS_PER_ROW = 6;

  // ------- animation state -------
  let sceneEl = $state<HTMLDivElement | null>(null);

  let cardsVisible = $state(false);
  let cardsDimmed = $state(true); // start dimmed; flips false when cards "come into view"
  let poolVisible = $state(false);
  let withdrawableShown = $state(false);

  const amounts = REWARD_RECIPIENTS.map(() => new Tween(0, { duration: 1200, easing: cubicOut }));

  // Pool amount that counts DOWN from POOL_TOTAL → 0 as drips distribute.
  const poolRemaining = new Tween(POOL_TOTAL, { duration: 2200, easing: cubicOut });

  let timeouts: ReturnType<typeof setTimeout>[] = [];

  function clearAll() {
    timeouts.forEach((t) => clearTimeout(t));
    timeouts = [];
  }

  function reset() {
    clearAll();
    cardsVisible = false;
    cardsDimmed = true;
    poolVisible = false;
    withdrawableShown = false;
    amounts.forEach((a) => a.set(0, { duration: 0 }));
    poolRemaining.set(POOL_TOTAL, { duration: 0 });
  }

  // Timing constants (all in ms from the start of `play()`)
  const POOL_DRAIN_MS = 2200; // pool tween duration
  const DISTRIBUTION_START = 800; // slight pause after pool appears

  function play() {
    reset();

    // Phase 1: cards appear in background (dimmed + blurred)
    timeouts.push(setTimeout(() => (cardsVisible = true), 150));

    // Phase 2: pool appears prominently in the center
    timeouts.push(setTimeout(() => (poolVisible = true), 500));

    // Phase 3: recipient counters start ticking up; pool amount counts down to 0.
    timeouts.push(
      setTimeout(() => {
        poolRemaining.set(0);
        REWARD_RECIPIENTS.forEach((r, i) => {
          timeouts.push(setTimeout(() => amounts[i].set(r.amount), i * 25));
        });
      }, DISTRIBUTION_START),
    );

    // Phase 4: pool fades out (after it's drained), cards come into focus.
    const cardsFocusAt = DISTRIBUTION_START + POOL_DRAIN_MS + 350;
    timeouts.push(
      setTimeout(() => {
        poolVisible = false;
        cardsDimmed = false;
      }, cardsFocusAt),
    );

    // Phase 5: "Withdrawable" badges animate in (staggered via CSS)
    timeouts.push(setTimeout(() => (withdrawableShown = true), cardsFocusAt + 400));
  }

  onMount(() => {
    if (!sceneEl) return;
    let hasPlayed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        if (ratio >= 0.3 && !hasPlayed) {
          play();
          hasPlayed = true;
        } else if (ratio === 0 && hasPlayed) {
          reset();
          hasPlayed = false;
        }
      },
      { threshold: [0, 0.3] },
    );
    io.observe(sceneEl);
    return () => {
      io.disconnect();
      clearAll();
    };
  });

  function fmt(n: number) {
    return `$${Math.round(n).toLocaleString()}`;
  }

  // Pool format: zero-padded so the digit count stays constant as it counts down.
  // Width matches POOL_TOTAL's digit count + a thousands-separator comma.
  const POOL_DIGITS = String(POOL_TOTAL).length; // 5 for 50000
  function fmtPool(n: number) {
    const padded = Math.round(n).toString().padStart(POOL_DIGITS, '0');
    // Insert thousands comma 3 from the right.
    const head = padded.slice(0, POOL_DIGITS - 3);
    const tail = padded.slice(POOL_DIGITS - 3);
    return `$${head},${tail}`;
  }
</script>

<div class="scene" bind:this={sceneEl}>
  <!-- GRANT GRID (background layer; oversized, spills past scene edges) -->
  <div
    class="grid"
    class:visible={cardsVisible}
    class:dimmed={cardsDimmed}
    class:popping={withdrawableShown}
  >
    {#each REWARD_RECIPIENTS as recipient, i (recipient.name)}
      {@const col = i % CARDS_PER_ROW}
      {@const row = Math.floor(i / CARDS_PER_ROW)}
      <!-- Diagonal cascade (top-left → bottom-right): cards on the same
           anti-diagonal (col + row = constant) pop together. -->
      {@const diagonalDelay = (col + row) * 70}
      <div
        class="grant-card"
        style:--reveal-delay="{i * 25}ms"
        style:--badge-delay="{diagonalDelay}ms"
      >
        <WaveMockUserBadge name={recipient.name} avatarUrl={avatarFor(i)} size={24} />
        <div class="amount-row">
          <span class="amount tnum">{fmt(amounts[i].current)}</span>
        </div>
        <span class="status typo-text-small-bold" class:shown={withdrawableShown}>
          Withdrawable
        </span>
      </div>
    {/each}
  </div>

  <!-- POOL (foreground; fades + scales out when cards come into focus) -->
  <div class="pool" class:visible={poolVisible}>
    <span class="pool-label typo-all-caps">Reward pool</span>
    <span class="pool-amount mono">{fmtPool(poolRemaining.current)}</span>
  </div>
</div>

<style>
  .scene {
    position: relative;
    width: 100%;
    height: 100%;
    /* Shorter than the grid's natural height so the top + bottom rows clip,
       implying "infinite" recipients on all sides. */
    min-height: 460px;
    overflow: hidden;
    isolation: isolate;
  }

  /* ===== GRANT GRID (background layer) ===== */
  .grid {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-2deg);
    display: grid;
    grid-template-columns: repeat(6, 180px);
    grid-template-rows: repeat(4, auto);
    gap: 12px;
    z-index: 1;
    transition:
      opacity 0.7s ease,
      filter 0.7s ease;
  }

  .grid.dimmed {
    opacity: 0.45;
    filter: blur(2px);
  }

  .grant-card {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.875rem 0 0.875rem 0.875rem;
    padding: 0.625rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    opacity: 0;
    transform: translateY(8px) scale(0.96);
    transition:
      opacity 0.5s ease-out,
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--reveal-delay, 0ms);
  }

  .grid.visible .grant-card {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* When the Withdrawable badge fades in on each card, the card itself
     gives a small synchronized "pop" — scale 1 → 1.05 → 1 over ~500ms,
     staggered per card via --badge-delay so it cascades across the grid. */
  .grid.popping .grant-card {
    animation: card-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) var(--badge-delay, 0ms) both;
  }

  @keyframes card-pop {
    0% {
      transform: translateY(0) scale(1);
    }
    40% {
      transform: translateY(0) scale(1.05);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }

  .amount-row {
    display: flex;
    align-items: baseline;
  }

  .amount {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1;
    color: var(--color-foreground);
  }

  /* "Withdrawable" badge — invisible by default, slides + fades in once
     `withdrawableShown` is true, staggered per card via --badge-delay. */
  .status {
    width: fit-content;
    padding: 0 0.375rem;
    font-size: 0.7rem;
    border-radius: 1rem 0 1rem 1rem;
    background: var(--color-positive-level-1);
    color: var(--color-positive-level-6);
    height: 16px;
    display: flex;
    align-items: center;
    opacity: 0;
    transform: translateY(-4px) scale(0.85);
    transition:
      opacity 0.35s ease,
      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--badge-delay, 0ms);
  }

  .status.shown {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* ===== POOL (centered, fades/scales out after the drips finish) ===== */
  .pool {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1.25rem 2.5rem;
    background: var(--color-primary-level-1);
    border: 1px solid var(--color-primary-level-2);
    border-radius: 1.75rem 0 1.75rem 1.75rem;
    color: var(--color-primary-level-9);
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 24px 60px -20px rgba(85, 85, 255, 0.35);
    transition:
      opacity 0.6s ease,
      transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pool.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .pool-label {
    color: var(--color-primary);
    font-size: 0.75rem;
  }

  .pool-amount {
    /* Monospace so the digits don't dance as the value counts down. */
    font-family: var(--typeface-mono, ui-monospace, 'SF Mono', Menlo, monospace);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    line-height: 1;
    color: var(--color-primary);
    letter-spacing: -0.02em;
  }

  /* Responsive: keep the desktop 6-col grid on mobile. The flow-explainer
     applies `transform: scale(...)` on mobile to shrink the whole grid to fit
     the smaller frame — at scaled size the 6 cols overflow horizontally on
     all sides (the "infinite recipients" effect) without leaving side gaps. */

  @media (prefers-reduced-motion: reduce) {
    .grant-card,
    .status,
    .pool,
    .grid {
      transition: none;
    }
  }
</style>
