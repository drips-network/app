<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/button/button.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import WaveMockRepoBadge from './wave-mock-repo-badge.svelte';
  import { MOCK_REPOS } from './mock-fixtures';
  import WaveMockIssueListRow from './wave-mock-issue-list-row.svelte';

  // How many of the first three issues are "currently selected" in the animation.
  // Starts at 0; ramps to 3 when the scene enters viewport, resets on exit.
  let revealedCount = $state(0);
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let sceneEl = $state<HTMLDivElement | null>(null);

  // Total selectable issues that should reveal (first 3 in the array).
  const SELECTABLE_INDICES = [0, 1, 2];
  const STAGGER_MS = 250;
  const INITIAL_DELAY_MS = 200;

  function clearAll() {
    timeouts.forEach((t) => clearTimeout(t));
    timeouts = [];
  }

  function play() {
    clearAll();
    revealedCount = 0;
    SELECTABLE_INDICES.forEach((_, i) => {
      timeouts.push(
        setTimeout(
          () => {
            revealedCount = i + 1;
          },
          INITIAL_DELAY_MS + i * STAGGER_MS,
        ),
      );
    });
  }

  function reset() {
    clearAll();
    revealedCount = 0;
  }

  onMount(() => {
    if (!sceneEl) return;
    // The .page being observed is intentionally tall (~1500px) — content
    // overflows the outer scene-scoping container which clips it. The IO
    // doesn't know about the parent's overflow, so it always measures the
    // full bounding rect.
    //
    // Lower threshold (0.15) + horizontally-expanded rootMargin keep this
    // working across all viewport sizes. Without the rootMargin, narrow
    // viewports cap horizontal intersection ratio. Without the lower
    // threshold, medium-width viewports get a peak vertical-ratio close to
    // 0.3 and can miss the threshold crossing in some scroll positions.
    let hasPlayed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        if (ratio >= 0.15 && !hasPlayed) {
          play();
          hasPlayed = true;
        } else if (ratio === 0 && hasPlayed) {
          reset();
          hasPlayed = false;
        }
      },
      { threshold: [0, 0.15], rootMargin: '0px 9999px 0px 9999px' },
    );
    io.observe(sceneEl);
    return () => {
      io.disconnect();
      clearAll();
    };
  });

  // Enough rows that the list visibly extends past the scene's bottom edge.
  const issues = [
    {
      number: 847,
      title: 'Add cross-pool token swap routing to the AMM contract',
      repo: MOCK_REPOS[0],
      points: 200,
      state: 'open' as const,
      selected: true,
      active: true,
    },
    {
      number: 612,
      title: 'Fix XDR decoding edge case in indexer ingestion pipeline',
      repo: MOCK_REPOS[3],
      points: 150,
      state: 'open' as const,
      selected: true,
    },
    {
      number: 743,
      title: 'Document the new transaction-builder helpers in the wallet SDK',
      repo: MOCK_REPOS[2],
      points: 150,
      state: 'open' as const,
      selected: true,
    },
    {
      number: 409,
      title: 'Typo in README install snippet',
      repo: MOCK_REPOS[1],
      points: 100,
      state: 'open' as const,
      selected: false,
    },
    {
      number: 921,
      title: 'Add retry-with-backoff to Horizon client subscriptions',
      repo: MOCK_REPOS[1],
      points: 200,
      state: 'open' as const,
      selected: false,
    },
    {
      number: 158,
      title: 'Surface validation errors in the transaction builder UI',
      repo: MOCK_REPOS[2],
      points: 150,
      state: 'open' as const,
      selected: false,
    },
  ];

  const activeIssue = issues.find((i) => i.active) ?? issues[0];
</script>

<div class="page" bind:this={sceneEl}>
  <!-- LEFT column: issues sidebar (batch-actions + list) — clipped at bottom -->
  <div class="left-col">
    <!-- Reserve the batch-actions row's height even when empty, so the list
         doesn't shift up when the bar appears. -->
    <div class="batch-actions-slot">
      {#if revealedCount > 0}
        <div class="batch-actions" in:fade={{ duration: 150 }}>
          <span class="tnum">{revealedCount} issue{revealedCount === 1 ? '' : 's'}</span>
          <Button variant="primary" icon={Plus}>Add to Wave Program</Button>
        </div>
      {/if}
    </div>

    <div class="list-card">
      {#each issues as issue, i (issue.number)}
        <WaveMockIssueListRow
          number={issue.number}
          title={issue.title}
          repo={issue.repo}
          points={issue.points}
          state={issue.state}
          selectable
          selected={issue.selected && i < revealedCount}
          highlighted={issue.active}
        />
      {/each}
    </div>
  </div>

  <!-- RIGHT column: detail panel — clipped on the right -->
  <div class="detail-col">
    <div class="detail-card">
      <div class="detail-header">
        <h3 class="detail-title">
          <span class="num">#{activeIssue.number}</span>
          {activeIssue.title}
        </h3>
        <WaveMockRepoBadge name={activeIssue.repo.name} size="small" />
      </div>

      <div class="detail-body">
        <p>
          Today the AMM only supports single-pool swaps. To compete with other DEXs on Soroban, we
          need a router that finds the best path across two or three pools and atomically executes
          the trade in a single transaction.
        </p>
        <p>
          Implementation should live alongside the existing pool contract under
          <code>contracts/router/</code>, with TypeScript bindings regenerated so the frontend can
          call it through our existing SDK without ceremony.
        </p>
        <p>
          <strong>Scope</strong>
        </p>
        <ul>
          <li>A Rust router contract supporting up to 3-hop paths between SAC pairs.</li>
          <li>Slippage protection (min-out parameter) with a clear revert reason.</li>
          <li>A test harness covering happy path, deep slippage, and price-impact edge cases.</li>
        </ul>
        <p>
          Bonus points for benchmarking against a single-pool swap to confirm the routing overhead
          is acceptable, and updating the docs with a short trader-facing walkthrough.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .page {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    /* Total width deliberately exceeds the scene container so the right edge clips. */
    width: 1100px;
    max-width: none;
    flex-shrink: 0;
  }

  /* ----- LEFT COLUMN ----- */
  .left-col {
    flex-shrink: 0;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Reserve the bar's slot height so the list doesn't jump on first reveal */
  .batch-actions-slot {
    height: 2.5rem;
    position: relative;
  }

  /* batch-actions bar — copied 1:1 from real issues-page styles */
  .batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 2.5rem;
    padding: 0 0.125rem 0 1rem;
    border-radius: 1.25rem 0 1.25rem 1.25rem;
    background-color: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
    font-weight: 500;
  }

  /* Card containing the list */
  .list-card {
    position: relative;
    background-color: var(--color-background);
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    padding: 0;
    overflow: hidden;
  }

  .list-card :global(.row:last-of-type) {
    border-bottom: none;
  }

  /* ----- RIGHT COLUMN: detail panel ----- */
  /* De-emphasized so visual focus stays on the issue list + batch-actions.
     Fixed (narrower) width so content wraps more → card becomes taller. */
  .detail-col {
    flex-shrink: 0;
    width: 560px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    opacity: 0.55;
  }

  .detail-card {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .detail-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-title {
    font-size: 1.5rem;
    line-height: 1.875rem;
    font-weight: 500;
    color: var(--color-foreground);
    margin: 0;
  }

  .detail-title .num {
    color: var(--color-foreground-level-5);
  }

  .detail-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    color: var(--color-foreground-level-7);
  }

  .detail-body p {
    margin: 0;
  }

  .detail-body ul {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .detail-body strong {
    color: var(--color-foreground);
    font-weight: 600;
  }

  .detail-body code {
    background-color: var(--color-foreground-level-1);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: var(--typeface-mono);
    font-size: 0.875rem;
  }
</style>
