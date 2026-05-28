<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { MOCK_CONTRIBUTORS } from './mock-fixtures';
  import WaveMockApplicantCard from './wave-mock-applicant-card.svelte';

  // ------- animation state -------
  let sceneEl = $state<HTMLDivElement | null>(null);
  let acceptButtonRef = $state<HTMLElement | null>(null);

  // Per-card visibility (staggered grid populate). Same length as `cards`.
  let visible = $state<boolean[]>(Array(9).fill(false));
  // Phase 2: main grows, others fade + blur, main's action buttons fade in
  let promoted = $state(false);

  // Cursor state
  let cursorVisible = $state(false);
  let cursorX = $state(0);
  let cursorY = $state(0);
  let cursorClicking = $state(false);
  let mainStatus = $state<'pending' | 'accepted'>('pending');

  let timeouts: ReturnType<typeof setTimeout>[] = [];

  function clearAll() {
    timeouts.forEach((t) => clearTimeout(t));
    timeouts = [];
  }

  function reset() {
    clearAll();
    visible = visible.map(() => false);
    promoted = false;
    cursorVisible = false;
    cursorClicking = false;
    mainStatus = 'pending';
  }

  function play() {
    reset();

    // Phase 1: grid populates from the center outward.
    // Order: center (main) → adjacent (N/E/S/W) → corners.
    const REVEAL_ORDER = [4, 1, 5, 7, 3, 0, 2, 8, 6];
    const stagger = 90;
    REVEAL_ORDER.forEach((cellIdx, n) => {
      timeouts.push(
        setTimeout(
          () => {
            visible[cellIdx] = true;
          },
          100 + n * stagger,
        ),
      );
    });
    const allVisibleAt = 100 + REVEAL_ORDER.length * stagger;

    // Phase 2: promote main (others fade + blur, main scales up, actions fade in)
    const promoteAt = allVisibleAt + 350;
    timeouts.push(
      setTimeout(() => {
        promoted = true;
      }, promoteAt),
    );

    // Phase 3: cursor enters from bottom-right of the visible scene
    const cursorEnterAt = promoteAt + 850;
    timeouts.push(
      setTimeout(() => {
        if (!sceneEl) return;
        const sceneRect = sceneEl.getBoundingClientRect();
        cursorX = sceneRect.width * 0.82;
        cursorY = sceneRect.height * 0.88;
        cursorVisible = true;
      }, cursorEnterAt),
    );

    // Cursor moves to the Accept button. Hotspot at rendered (16.8, 13.2) px.
    timeouts.push(
      setTimeout(() => {
        if (!sceneEl || !acceptButtonRef) return;
        const sceneRect = sceneEl.getBoundingClientRect();
        const buttonRect = acceptButtonRef.getBoundingClientRect();
        cursorX = buttonRect.left - sceneRect.left + buttonRect.width / 2 - 16.8;
        cursorY = buttonRect.top - sceneRect.top + buttonRect.height / 2 - 13.2;
      }, cursorEnterAt + 200),
    );

    // Click pulse + state flip
    timeouts.push(
      setTimeout(() => {
        cursorClicking = true;
      }, cursorEnterAt + 1100),
    );
    timeouts.push(
      setTimeout(() => {
        mainStatus = 'accepted';
        cursorClicking = false;
      }, cursorEnterAt + 1300),
    );

    // Linger then fade cursor out
    timeouts.push(
      setTimeout(() => {
        cursorVisible = false;
      }, cursorEnterAt + 2400),
    );
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

  // ------- data -------
  // 3×3 grid; main lives at index 4 (the dead-center cell).
  // Cells 0..8 (row-major):
  //   0 [TL]   1 [T]    2 [TR]
  //   3 [L]    4 [MAIN] 5 [R]
  //   6 [BL]   7 [B]    8 [BR]
  type Card = {
    user: { name: string; avatarUrl?: string; verified?: boolean };
    text: string;
    metrics: {
      ossActivity: 'good' | 'mid' | 'bad';
      mergedPRs: { value: number; bin: 'good' | 'mid' | 'bad' };
      mergeRate: { value: string; bin: 'good' | 'mid' | 'bad' };
    };
    isMain?: boolean;
  };

  const cards: Card[] = [
    // 0 TL
    {
      user: MOCK_CONTRIBUTORS[1],
      text: 'Done a few similar things in side projects. Should be doable within the Wave.',
      metrics: {
        ossActivity: 'mid',
        mergedPRs: { value: 42, bin: 'mid' },
        mergeRate: { value: '78%', bin: 'mid' },
      },
    },
    // 1 Top-middle
    {
      user: MOCK_CONTRIBUTORS[2],
      text: 'Strong Rust + Soroban background. Will follow up on slippage design first.',
      metrics: {
        ossActivity: 'good',
        mergedPRs: { value: 312, bin: 'good' },
        mergeRate: { value: '88%', bin: 'good' },
      },
    },
    // 2 TR
    {
      user: MOCK_CONTRIBUTORS[3],
      text: 'Have written 3-hop routers on EVM. The Soroban version should be similar in shape.',
      metrics: {
        ossActivity: 'good',
        mergedPRs: { value: 167, bin: 'good' },
        mergeRate: { value: '85%', bin: 'good' },
      },
    },
    // 3 Left
    {
      user: MOCK_CONTRIBUTORS[4],
      text: 'Could do this over the weekend. I have a working slippage-protected router locally.',
      metrics: {
        ossActivity: 'mid',
        mergedPRs: { value: 58, bin: 'mid' },
        mergeRate: { value: '71%', bin: 'mid' },
      },
    },
    // 4 CENTER = MAIN
    {
      user: MOCK_CONTRIBUTORS[0],
      text: 'Shipped a similar Soroban router last Wave with full test coverage. Can wrap this in 2 days — slippage math sketched out already.',
      metrics: {
        ossActivity: 'good',
        mergedPRs: { value: 184, bin: 'good' },
        mergeRate: { value: '92%', bin: 'good' },
      },
      isMain: true,
    },
    // 5 Right
    {
      user: MOCK_CONTRIBUTORS[5],
      text: 'First time touching Soroban but built a Uniswap V2 router clone in Rust last year.',
      metrics: {
        ossActivity: 'mid',
        mergedPRs: { value: 21, bin: 'bad' },
        mergeRate: { value: '64%', bin: 'bad' },
      },
    },
    // 6 BL
    {
      user: MOCK_CONTRIBUTORS[1],
      text: 'Familiar with the AMM space — wrote a fee-on-transfer router fork last quarter.',
      metrics: {
        ossActivity: 'mid',
        mergedPRs: { value: 96, bin: 'mid' },
        mergeRate: { value: '80%', bin: 'mid' },
      },
    },
    // 7 Bottom-middle
    {
      user: MOCK_CONTRIBUTORS[3],
      text: 'I can pair on this with my colleague — we’d split research and implementation cleanly.',
      metrics: {
        ossActivity: 'good',
        mergedPRs: { value: 220, bin: 'good' },
        mergeRate: { value: '90%', bin: 'good' },
      },
    },
    // 8 BR
    {
      user: MOCK_CONTRIBUTORS[2],
      text: 'I’ve audited two Soroban DEXs already. Would prefer to start with the test harness.',
      metrics: {
        ossActivity: 'good',
        mergedPRs: { value: 410, bin: 'good' },
        mergeRate: { value: '94%', bin: 'good' },
      },
    },
  ];
</script>

<div class="scene" bind:this={sceneEl}>
  <div class="grid">
    {#each cards as card, i (i)}
      <div
        class="cell"
        class:visible={visible[i]}
        class:main={card.isMain}
        class:dimmed={promoted && !card.isMain}
        class:scaled={promoted && card.isMain}
      >
        {#if card.isMain}
          <WaveMockApplicantCard
            highlighted
            showActions
            status={mainStatus}
            acceptVariant={promoted ? 'primary' : 'normal'}
            bind:acceptButtonRef
            user={card.user}
            text={card.text}
            metrics={card.metrics}
            width="100%"
          />
        {:else}
          <WaveMockApplicantCard
            showActions
            user={card.user}
            text={card.text}
            metrics={card.metrics}
            width="100%"
          />
        {/if}
      </div>
    {/each}
  </div>

  <!-- Animated cursor — authentic macOS default cursor SVG.
       Source: github.com/daviddarnes/mac-cursors (MIT).
       Hotspot at rendered (16.8, 13.2) px (SVG viewBox 32 rendered at 64). -->
  {#if cursorVisible}
    <div
      class="cursor"
      class:clicking={cursorClicking}
      style:transform="translate({cursorX}px, {cursorY}px)"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 250 }}
    >
      <svg width="64" height="64" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd" transform="translate(10 7)">
          <path
            d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z"
            fill="#fff"
          />
          <path
            d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z"
            fill="#000"
          />
        </g>
      </svg>
      <span class="ripple"></span>
    </div>
  {/if}
</div>

<style>
  /* Scene clips the oversized grid on every side. */
  .scene {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 560px;
    overflow: hidden;
    /* Make sure the absolute grid is centered inside */
    isolation: isolate;
  }

  /* The grid is intentionally larger than the scene so edge cards spill out
     on all four sides and get clipped. Main at center stays fully visible. */
  .grid {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: grid;
    grid-template-columns: repeat(3, 320px);
    /* Auto rows — every card has the same content structure (badge, 2-line
       text, 3 metrics, 2 action buttons), so they're all naturally the same
       height with no trailing whitespace. */
    grid-auto-rows: auto;
    gap: 1rem;
  }

  /* Block layout so the inner applicant card can grow taller than the cell
     when needed (e.g. the main card after its action buttons fade in).
     `min-height: 100%` on the card still enforces a uniform "calm-state" height. */
  .cell {
    opacity: 0;
    transform: translateY(12px);
    transition:
      opacity 0.5s ease-out,
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.6s ease;
    will-change: transform, opacity, filter;
  }

  .cell.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Equal heights come naturally from `grid-auto-rows: auto` + identical
     content structure — no min-height needed. */
  .cell :global(.applicant) {
    box-sizing: border-box;
  }

  /* Phase 2: non-main cards fade + blur. */
  .cell.dimmed {
    opacity: 0.35;
    filter: blur(2px);
    transform: translateY(0) scale(0.96);
  }

  /* Phase 2: main grows + lifts above neighbors. */
  .cell.main {
    z-index: 2;
  }

  .cell.main.scaled {
    transform: translateY(0) scale(1.15);
    filter: drop-shadow(0 18px 38px rgba(85, 85, 255, 0.25));
    transition:
      transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.7s ease;
  }

  /* When actions fade in inside the main, the card naturally grows taller via
     min-height. The cell's bounding box stays at 240px; the grown card spills
     visually past the cell, sitting above dimmed neighbors via z-index. */

  /* Animated mouse cursor. Hotspot at rendered (16.8px, 13.2px). */
  .cursor {
    position: absolute;
    top: 0;
    left: 0;
    width: 64px;
    height: 64px;
    z-index: 5;
    pointer-events: none;
    transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  .cursor.clicking svg {
    transform: scale(0.85);
  }

  .cursor svg {
    transition: transform 0.15s ease-out;
    transform-origin: 16.8px 13.2px;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
  }

  .cursor .ripple {
    position: absolute;
    top: 13.2px;
    left: 16.8px;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: var(--color-primary);
    opacity: 0;
    pointer-events: none;
  }

  .cursor.clicking .ripple {
    animation: ripple 0.55s ease-out;
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      margin-left: 0;
      margin-top: 0;
      opacity: 0.55;
    }
    100% {
      width: 60px;
      height: 60px;
      margin-left: -30px;
      margin-top: -30px;
      opacity: 0;
    }
  }

  @media (max-width: 882px) {
    .scene {
      min-height: 700px;
    }
    .grid {
      grid-template-columns: repeat(3, 260px);
    }
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: repeat(3, 220px);
      gap: 0.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cell,
    .cell.main.scaled {
      transition: none;
    }
    .cursor {
      transition: none;
    }
  }
</style>
