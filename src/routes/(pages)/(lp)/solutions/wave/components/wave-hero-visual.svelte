<script lang="ts">
  import { MOCK_CONTRIBUTORS, MOCK_REPOS } from './mocks/mock-fixtures';
  import WaveMockApplicantCard from './mocks/wave-mock-applicant-card.svelte';
  import WaveMockIssueCard from './mocks/wave-mock-issue-card.svelte';
  import WaveMockPointsPill from './mocks/wave-mock-points-pill.svelte';
  import WaveMockWithdrawCard from './mocks/wave-mock-withdraw-card.svelte';
  import WaveSceneBg from './wave-scene-bg.svelte';
</script>

<div class="hero-visual" aria-hidden="true">
  <div class="bg-frame">
    <WaveSceneBg />
  </div>

  <!-- Floating cards composition -->
  <div class="floats">
    <div class="float float-issue-1">
      <WaveMockIssueCard
        number="847"
        title="Add cross-pool token swap routing to the AMM contract"
        repo={MOCK_REPOS[0]}
        points={200}
        state="new-applications"
        width="100%"
      />
    </div>

    <div class="float float-applicant">
      <WaveMockApplicantCard
        highlighted
        user={MOCK_CONTRIBUTORS[0]}
        text="Shipped a similar Soroban router last Wave. Can wrap this in two days."
        metrics={{
          ossActivity: 'good',
          mergedPRs: { value: 184, bin: 'good' },
          mergeRate: { value: '92%', bin: 'good' },
        }}
      />
    </div>

    <div class="float float-issue-2">
      <WaveMockIssueCard
        number="409"
        title="Fix XDR decoding edge case in indexer ingestion"
        repo={MOCK_REPOS[3]}
        points={150}
        state="pr-submitted"
        width="100%"
      />
    </div>

    <div class="float float-withdraw">
      <WaveMockWithdrawCard
        programName="Stellar"
        waveNumber={5}
        amount={98.42}
        status="withdrawable"
        width="100%"
        showAction={false}
      />
    </div>

    <div class="float float-pill-1">
      <WaveMockPointsPill points={150} bold />
    </div>
    <div class="float float-pill-2">
      <WaveMockPointsPill points="Points earned" label="" variant="positive" bold />
    </div>
    <div class="float float-pill-3">
      <WaveMockPointsPill points={200} multiplier={1.5} bold />
    </div>
  </div>
</div>

<style>
  .hero-visual {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 480px;
    /* Visible overflow so cards can spill past the background */
    overflow: visible;
  }

  /* Inset frame holds the wavy background so some cards extend past its edges.
     `isolation: isolate` forms a stacking context so WaveSceneBg's z-index: -1
     stays scoped inside this frame instead of escaping behind the page bg. */
  .bg-frame {
    position: absolute;
    inset: 2.5rem 1.5rem;
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
    isolation: isolate;
  }

  .floats {
    position: absolute;
    inset: 0;
  }

  .float {
    position: absolute;
    animation: float 8s ease-in-out infinite;
    /* --rot is preserved through keyframes via var() reference */
    transform: rotate(var(--rot, 0deg));
  }

  /* Animation preserves the per-card rotation */
  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(var(--rot, 0deg));
    }
    50% {
      transform: translateY(-10px) rotate(var(--rot, 0deg));
    }
  }

  /* Top-left issue — extends past the LEFT bg edge */
  .float-issue-1 {
    top: 22%;
    left: -2%;
    width: 320px;
    --rot: -5deg;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.12));
    animation-delay: 0s;
  }

  /* Right-side applicant — slightly overflows the RIGHT bg edge */
  .float-applicant {
    top: 30%;
    right: -1%;
    width: 320px;
    --rot: 3deg;
    filter: drop-shadow(0 16px 32px rgba(85, 85, 255, 0.22));
    animation-delay: -2s;
    z-index: 2;
  }

  /* Bottom-left issue — extends past the BOTTOM bg edge */
  .float-issue-2 {
    bottom: -2%;
    left: 14%;
    width: 300px;
    --rot: 4deg;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.12));
    animation-delay: -4s;
  }

  /* Middle-ish withdraw — fully inside bg */
  .float-withdraw {
    top: 52%;
    left: 10%;
    width: 320px;
    --rot: -2deg;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.12));
    animation-delay: -3s;
    z-index: 1;
  }

  .float-pill-1 {
    top: 30%;
    right: 30%;
    --rot: 9deg;
    animation-delay: -1s;
  }
  .float-pill-2 {
    top: 22%;
    left: 38%;
    --rot: -8deg;
    animation-delay: -5s;
  }
  .float-pill-3 {
    bottom: 14%;
    right: 14%;
    --rot: -8deg;
    animation-delay: -3s;
  }

  @media (max-width: 1100px) {
    .float-issue-1 {
      width: 260px;
    }
    .float-applicant {
      width: 280px;
    }
    .float-issue-2 {
      width: 240px;
    }
    .float-withdraw {
      width: 240px;
    }
  }

  @media (max-width: 882px) {
    .hero-visual {
      min-height: 380px;
    }
    .float-issue-1 {
      top: 4%;
      left: 2%;
      width: 220px;
    }
    .float-applicant {
      top: 36%;
      right: 2%;
      width: 220px;
    }
    .float-issue-2 {
      display: none;
    }
    .float-withdraw {
      bottom: 6%;
      left: 12%;
      top: auto;
      width: 220px;
    }
    .float-pill-1,
    .float-pill-2,
    .float-pill-3 {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .float {
      animation: none;
    }
    .bg svg :global(animate) {
      display: none;
    }
  }
</style>
