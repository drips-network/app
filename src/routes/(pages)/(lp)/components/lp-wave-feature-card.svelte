<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import File from '$lib/components/icons/File.svelte';
  import WaveMockApplicantCard from '../solutions/wave/components/mocks/wave-mock-applicant-card.svelte';
  import WaveMockIssueCard from '../solutions/wave/components/mocks/wave-mock-issue-card.svelte';
  import { MOCK_CONTRIBUTORS, MOCK_REPOS } from '../solutions/wave/components/mocks/mock-fixtures';
  import WaveSceneBg from '../solutions/wave/components/wave-scene-bg.svelte';
  import WaveMockWithdrawCard from '../solutions/wave/components/mocks/wave-mock-withdraw-card.svelte';

  // ---- LANE DATA ----

  // Top lane: issue cards (Maintainers add issues)
  const issueLane = [
    {
      number: 847,
      title: 'Add cross-pool token swap routing to the AMM contract',
      repo: MOCK_REPOS[0],
      points: 200,
      state: 'new-applications' as const,
    },
    {
      number: 612,
      title: 'Fix XDR decoding edge case in indexer ingestion',
      repo: MOCK_REPOS[3],
      points: 150,
      state: 'open' as const,
    },
    {
      number: 743,
      title: 'Document new transaction-builder helpers in the wallet SDK',
      repo: MOCK_REPOS[2],
      points: 150,
      state: 'pr-submitted' as const,
    },
    {
      number: 409,
      title: 'Add retry-with-backoff to Horizon client subscriptions',
      repo: MOCK_REPOS[1],
      points: 200,
      state: 'open' as const,
    },
    {
      number: 158,
      title: 'Surface validation errors in the transaction builder UI',
      repo: MOCK_REPOS[2],
      points: 150,
      state: 'open' as const,
    },
  ];

  // Middle lane: applicant cards (Contributors solve issues)
  const applicantLane = [
    {
      user: MOCK_CONTRIBUTORS[0],
      text: 'Shipped a similar Soroban router last Wave with full test coverage.',
      metrics: {
        ossActivity: 'good' as const,
        mergedPRs: { value: 184, bin: 'good' as const },
        mergeRate: { value: '92%', bin: 'good' as const },
      },
    },
    {
      user: MOCK_CONTRIBUTORS[2],
      text: 'Strong Rust + Soroban background. Will follow up on slippage design.',
      metrics: {
        ossActivity: 'good' as const,
        mergedPRs: { value: 312, bin: 'good' as const },
        mergeRate: { value: '88%', bin: 'good' as const },
      },
    },
    {
      user: MOCK_CONTRIBUTORS[3],
      text: 'Have written 3-hop routers on EVM. The Soroban version should be similar.',
      metrics: {
        ossActivity: 'good' as const,
        mergedPRs: { value: 167, bin: 'good' as const },
        mergeRate: { value: '85%', bin: 'good' as const },
      },
    },
    {
      user: MOCK_CONTRIBUTORS[4],
      text: 'Could do this over the weekend. I have a working router locally.',
      metrics: {
        ossActivity: 'mid' as const,
        mergedPRs: { value: 58, bin: 'mid' as const },
        mergeRate: { value: '71%', bin: 'mid' as const },
      },
    },
  ];

  // Bottom lane: withdraw cards (Rewards are distributed)
  const withdrawLane = [
    { programName: 'Stellar', waveNumber: 5, amount: 4280, status: 'withdrawable' as const },
    { programName: 'Stellar', waveNumber: 5, amount: 3150, status: 'withdrawable' as const },
    { programName: 'Stellar', waveNumber: 4, amount: 2840, status: 'complete' as const },
    { programName: 'Stellar', waveNumber: 4, amount: 1720, status: 'complete' as const },
    { programName: 'Stellar', waveNumber: 5, amount: 1180, status: 'withdrawable' as const },
  ];
</script>

<section class="wave-feature">
  <div class="bg-frame">
    <WaveSceneBg />
  </div>

  <div class="content">
    <div class="text">
      <div class="kicker">
        <span class="dot"></span>
        Drips Wave
      </div>
      <h2 class="pixelated">Fix. Merge. Earn — every month.</h2>
      <p>
        Wave turns an ecosystem's funding into a recurring sprint of merged pull requests.
        Maintainers clear their backlog, contributors get paid for shipping, ecosystems get
        measurable progress.
      </p>
      <div class="ctas">
        <Button variant="primary" icon={ArrowRight} href="/solutions/wave">
          Learn how Wave works
        </Button>
        <Button
          icon={File}
          href="https://docs.drips.network/wave"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the docs
        </Button>
      </div>
    </div>

    <div class="lanes" aria-hidden="true">
      <!-- Lane 1: Issues drifting left -->
      <div class="lane lane-issues">
        <div class="track track-left">
          {#each [...issueLane, ...issueLane] as issue, i (i)}
            <div class="card-slot card-slot-issue">
              <WaveMockIssueCard
                number={issue.number}
                title={issue.title}
                repo={issue.repo}
                points={issue.points}
                state={issue.state}
                width="100%"
              />
            </div>
          {/each}
        </div>
      </div>

      <!-- Lane 2: Applicants drifting right -->
      <div class="lane lane-applicants">
        <div class="track track-right">
          {#each [...applicantLane, ...applicantLane] as applicant, i (i)}
            <div class="card-slot card-slot-applicant">
              <WaveMockApplicantCard
                user={applicant.user}
                text={applicant.text}
                metrics={applicant.metrics}
                width="100%"
              />
            </div>
          {/each}
        </div>
      </div>

      <!-- Lane 3: Withdrawals drifting left -->
      <div class="lane lane-withdraws">
        <div class="track track-left track-left-slow">
          {#each [...withdrawLane, ...withdrawLane] as grant, i (i)}
            <div class="card-slot card-slot-withdraw">
              <WaveMockWithdrawCard
                programName={grant.programName}
                waveNumber={grant.waveNumber}
                amount={grant.amount}
                status={grant.status}
                width="100%"
                showAction={false}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .wave-feature {
    position: relative;
    width: 100%;
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--color-primary-level-2);
  }

  .bg-frame {
    position: absolute;
    inset: 0;
  }

  .content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(280px, 420px) 1fr;
    gap: 2.5rem;
    align-items: center;
    padding: 3rem;
    min-height: 460px;
  }

  /* ---- Text column ---- */
  .text {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    background: var(--color-background);
    color: var(--color-primary);
    border-radius: 2rem 0 2rem 2rem;
    width: fit-content;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .kicker .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-primary);
  }

  h2 {
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .text p {
    color: var(--color-foreground-level-6);
    font-size: 1rem;
    line-height: 1.5;
    max-width: 460px;
  }

  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    margin-top: 0.5rem;
  }

  /* ---- Lanes (right column) ---- */
  .lanes {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    /* Mask the lane edges so cards fade in/out at the column boundaries */
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0,
      black 4%,
      black 96%,
      transparent 100%
    );
    mask-image: linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%);
  }

  .lane {
    overflow: hidden;
    height: 120px;
    display: flex;
    align-items: center;
  }

  /* Applicant cards are taller; give that lane a bit more room */
  .lane-applicants {
    height: 200px;
  }

  .track {
    display: flex;
    gap: 0.75rem;
    width: max-content;
    will-change: transform;
  }

  /* Tracks always contain 2× the data set so the loop is seamless at -50% */
  .track-left {
    animation: scroll-left 38s linear infinite;
  }
  .track-left-slow {
    animation-duration: 52s;
  }
  .track-right {
    animation: scroll-right 44s linear infinite;
  }

  @keyframes scroll-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @keyframes scroll-right {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(0);
    }
  }

  /* Card slot sizes — fixed widths so the loop math (2× content, translate -50%)
     produces a seamless wrap */
  .card-slot {
    flex-shrink: 0;
  }
  .card-slot-issue {
    width: 280px;
  }
  .card-slot-applicant {
    width: 280px;
  }
  .card-slot-withdraw {
    width: 280px;
  }

  /* ---- Responsive ---- */
  @media (max-width: 882px) {
    .content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 2rem 1.5rem;
      min-height: 0;
    }
    h2 {
      font-size: clamp(1.625rem, 5vw, 2.25rem);
    }
    .lane {
      height: 100px;
    }
    .lane-applicants {
      height: 180px;
    }
    .card-slot-issue,
    .card-slot-applicant,
    .card-slot-withdraw {
      width: 240px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .track {
      animation: none;
    }
  }
</style>
