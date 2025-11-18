<script>
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowClockwiseHeart from '$lib/components/icons/ArrowClockwiseHeart.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import ThumbsUp from '$lib/components/icons/ThumbsUp.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Transactions from '$lib/components/icons/Transactions.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
  import SolutionsPropgfEverythingYouNeed from '$lib/components/illustrations/solutions-propgf-everything-you-need.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
  import ThemedRasterImage from '$lib/components/themed-raster-image/themed-raster-image.svelte';
</script>

<HeadMeta
  title="Wave"
  description="Waves turn open-source sprints into on-chain funding cycles. Ecosystems launch recurring Waves to reward measurable impact — all tracked from issue to fund distribution."
/>

<SolutionHeader>
  <svelte:fragment slot="usecase-badge">Pro-PGF</svelte:fragment>
  <svelte:fragment slot="headline"
    >Proactive, community-led public goods funding on-chain</svelte:fragment
  >
  <svelte:fragment slot="description">
    Pro-PGF gives ecosystems a structured, transparent way to fund essential public goods. It
    supports new initiatives and ongoing projects that keep your ecosystem healthy and growing.
  </svelte:fragment>
</SolutionHeader>

<SolutionCard illustrationScale="1.1">
  <svelte:fragment slot="illustration">
    <ThemedRasterImage
      srcLight="/assets/solutions/pro-pgf/streamline/light.png"
      srcDark="/assets/solutions/pro-pgf/streamline/dark.png"
      alt="Wave solution illustration"
    />
  </svelte:fragment>
  <svelte:fragment slot="headline">Streamline how your ecosystem funds public goods</svelte:fragment
  >
  <svelte:fragment slot="description">
    Run curated funding rounds that combine expert review with community oversight all tracked and
    executed on-chain.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Ledger}>
      Proactively fund new and existing projects aligned with ecosystem priorities
    </SolutionLineItem>
    <SolutionLineItem icon={Proposals}>
      Use a dedicated selection committee to review proposals and guide allocation
    </SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      Make every proposal, review and payout fully transparent and verifiable
    </SolutionLineItem>
    <SolutionLineItem icon={ArrowClockwiseHeart}>
      Complement retroactive funding with a forward-looking Pro-PGF program
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

<SolutionCard reverse illustrationScale="1.1">
  <svelte:fragment slot="illustration">
    <SolutionsPropgfEverythingYouNeed />
  </svelte:fragment>
  <svelte:fragment slot="headline"
    >Everything you need for accountable, scalable Pro-PGF</svelte:fragment
  >

  <svelte:fragment slot="description">
    As a fully decentralized on-chain protocol, Drips can be composed with any other contract.
  </svelte:fragment>

  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={ArrowClockwiseHeart}>
      Run clearly scoped funding batches with defined themes and budgets
    </SolutionLineItem>
    <SolutionLineItem icon={Transactions}>
      Streamline proposal intake, review and approvals in one place
    </SolutionLineItem>
    <SolutionLineItem icon={ThumbsUp}>
      Publish decisions and payouts on-chain for full accountability
    </SolutionLineItem>
    <SolutionLineItem icon={Wave}>
      Build a continuous Pro-PGF pipeline that funds high-impact work from idea to execution
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>
