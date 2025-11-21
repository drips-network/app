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
  import SolutionInterstitial from '$lib/components/solutions/solution-interstitial.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
  import ThemedRasterImage from '$lib/components/themed-raster-image/themed-raster-image.svelte';
</script>

<HeadMeta
  title="Pro-PGF"
  description="Pro-PGF gives ecosystems a structured, transparent way to fund essential public goods. It supports new initiatives and ongoing projects that keep your ecosystem healthy and growing."
/>

<SolutionHeader>
  {#snippet usecase_badge()}
    Pro-PGF
  {/snippet}
  {#snippet headline()}
    Proactive, community-led public goods funding on-chain
  {/snippet}
  {#snippet description()}
    Pro-PGF gives ecosystems a structured, transparent way to fund essential public goods. It
    supports new initiatives and ongoing projects that keep your ecosystem healthy and growing.
  {/snippet}
</SolutionHeader>

<SolutionCard illustrationScale="1.1">
  {#snippet illustration()}
    <ThemedRasterImage
      srcLight="/assets/solutions/pro-pgf/streamline/light.png"
      srcDark="/assets/solutions/pro-pgf/streamline/dark.png"
      alt="Wave solution illustration"
    />
  {/snippet}
  {#snippet headline()}
    Streamline how your ecosystem funds public goods
  {/snippet}
  {#snippet description()}
    Run curated funding rounds that combine expert review with community oversight all tracked and
    executed on-chain.
  {/snippet}
  {#snippet line_items()}
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
  {/snippet}
</SolutionCard>

<SolutionInterstitial>
  {#snippet headline()}
    Want fair, on-chain rewards for your community?
  {/snippet}
  {#snippet description()}
    Our team can walk you through how Drips fits into your workflow, help you design repeatable
    funding cycles, and show you how to reward meaningful work with full on-chain accountability.
  {/snippet}
</SolutionInterstitial>

<SolutionCard reverse illustrationScale="1.1">
  {#snippet illustration()}
    <SolutionsPropgfEverythingYouNeed />
  {/snippet}
  {#snippet headline()}
    Everything you need for accountable, scalable Pro-PGF
  {/snippet}

  {#snippet line_items()}
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
  {/snippet}
</SolutionCard>
