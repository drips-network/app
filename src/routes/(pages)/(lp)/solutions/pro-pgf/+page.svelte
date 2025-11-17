<script>
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Calendar from '$lib/components/icons/Calendar.svelte';
  import Ecosystem from '$lib/components/icons/Ecosystem.svelte';
  import Git from '$lib/components/icons/Git.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import User from '$lib/components/icons/User.svelte';
  import SolutionsEcosystemGraph from '$lib/components/illustrations/solutions-ecosystem-graph.svelte';
  import SolutionsEcosystemsDistribution from '$lib/components/illustrations/solutions-ecosystems-distribution.svelte';
  import SolutionsWaveWhatItEnables from '$lib/components/illustrations/solutions-wave-what-it-enables.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionInterstitial from '$lib/components/solutions/solution-interstitial.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
  import ThemedRasterImage from '$lib/components/themed-raster-image/themed-raster-image.svelte';
</script>

<HeadMeta
  title="Wave"
  description="Waves turn open-source sprints into on-chain funding cycles. Ecosystems launch recurring Waves to reward measurable impact — all tracked from issue to fund distribution."
/>

<SolutionHeader>
  <svelte:fragment slot="usecase-badge">Wave</svelte:fragment>
  <svelte:fragment slot="headline">Reward open-source contributions fairly and transparently</svelte:fragment>
  <svelte:fragment slot="description">
    Waves turn open-source sprints into on-chain funding cycles. Ecosystems launch recurring Waves
    to reward measurable impact — all tracked from issue to fund distribution.
  </svelte:fragment>
</SolutionHeader>

<SolutionCard>
  <svelte:fragment slot="illustration">
    <ThemedRasterImage
      srcLight="/assets/solutions/wave/what-it-enables/light.png"
      srcDark="/assets/solutions/wave/what-it-enables/dark.png"
      alt="Wave solution illustration"
    />
  </svelte:fragment>
  <svelte:fragment slot="headline">What It Enables</svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Calendar}>
      Launch monthly “Waves” with a USD-denominated reward pool tied to approved repositories.
    </SolutionLineItem>
    <SolutionLineItem icon={Github}>
      Vet and sync GitHub projects through transparent onboarding.
    </SolutionLineItem>
    <SolutionLineItem icon={Git}>
      Contributors earn points for merged PRs, and every point translates into a share of the reward.
    </SolutionLineItem>
    <SolutionLineItem icon={Trophy}>
      Live leaderboard displays contributor activity, repositories, and merged pull-requests in real time.
    </SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      At the end of each cycle rewards are distributed to maintainers on-chain.
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

<SolutionInterstitial>
  <svelte:fragment slot="headline">Want fair, on-chain rewards for your community?</svelte:fragment>
  <svelte:fragment slot="description">
    Our team can walk you through how Drips fits into your workflow, help you design repeatable funding cycles, and show you how to reward meaningful work with full on-chain accountability.
  </svelte:fragment>
</SolutionInterstitial>

<SolutionCard reverse>
  <svelte:fragment slot="illustration">
    <SolutionsEcosystemGraph />
  </svelte:fragment>
  <svelte:fragment slot="headline">Who It's For</svelte:fragment>

  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Ecosystem}>
      Ecosystems: Drive developer activity, launch recurring funding cycles, manage applicants and payouts in a unified flow.
    </SolutionLineItem>
    <SolutionLineItem icon={User}>
      Maintainers: Attract high-quality contributors, grow the community, set issue priorities, sync repos, and track contribution transparently.
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>
