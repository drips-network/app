<script lang="ts">
  import Splits from "$lib/components/icons/Splits.svelte";
  import FundDependenciesUsecase from "./usecase-illustrations/fund-dependencies-usecase.svelte";
  import UsecaseCard from "./usecase-card.svelte";
  import breakpointsStore from "$lib/stores/breakpoints/breakpoints.store";
  import { onMount } from "svelte";
  import DripList from "$lib/components/icons/DripList.svelte";
  import TokenStreams from "$lib/components/icons/TokenStreams.svelte";
  import Proposals from "$lib/components/icons/Proposals.svelte";
  import RetropgfUsecase from "./usecase-illustrations/retropgf-usecase.svelte";
  import UsecaseIllustration, { type UsecaseIllustrationConfig } from "./usecase-illustrations/usecase-illustration.svelte";
  import StreamUsecase from "./usecase-illustrations/stream-usecase.svelte";
  import EcosystemUsecase from "./usecase-illustrations/ecosystem-usecase.svelte";
  import HackathonUsecase from "./usecase-illustrations/hackathon-usecase.svelte";

  const usecaseCards: UsecaseIllustrationConfig[] = [
    {
      headline: "Fund your dependencies",
      description: "Claim your project and pay it forward to the projects that you depend on.",
      icon: Splits,
      sparkles: [{
        x: "-20px",
        y: "60px",
        delay: 50,
      },{
        x: "160px",
        y: "30px",
        delay: 100,
      }],
      illustration: FundDependenciesUsecase,
    },
    {
      headline: "Run a RetroPGF round",
      description: "Distribute retroactive public goods funding easily.",
      icon: DripList,
      sparkles: [{
        x: "-20px",
        y: "60px",
        delay: 50,
      },{
        x: "220px",
        y: "30px",
        delay: 100,
      },
      {
        x: "180px",
        y: "170px",
        delay: 150,
      }],
      illustration: RetropgfUsecase,
    },
    {
      headline: "Programmable cashflow",
      description: "Set up flexible, on-chain payment streams that you can adjust anytime.",
      icon: TokenStreams,
      sparkles: [],
      illustration: StreamUsecase,
    },
    {
      headline: "Fund entire ecosystems",
      description: "Support thousands of projects and people with a single stream or donation",
      icon: DripList,
      sparkles: [],
      illustration: EcosystemUsecase,
      illustrationOffset: {
        x: "-25px",
        y: "-10px",
      }
    },
    {
      headline: "Start a hackathon",
      description: "Set up a hackathon that allows submissions and voting on recipients.",
      icon: Proposals,
      sparkles: [{
        x: "-20px",
        y: "20px",
        delay: 50,
      },{
        x: "160px",
        y: "100px",
        delay: 100,
      }],
      illustration: HackathonUsecase,
      illustrationOffset: {
        x: "-30px",
        y: "0",
      }
    },
  ];

  onMount(breakpointsStore.attach);
  $: mobile = $breakpointsStore?.breakpoint === "mobile" || $breakpointsStore?.breakpoint === "tablet";
  $: {
    if (mobile) handleScroll();
  }

  const elements: HTMLDivElement[] = [];
  let elementOffsets: number[] = [];
  let elementScales: number [] = [];
  let opacities: number[] = [];
  let activeIndex = 0;

  const HEADER_HEIGHT = 100;

  function handleScroll() {
    if (!mobile) return;
    for (const [i, element] of elements.entries()) {
      const scrollPosition = window.scrollY;
      const distanceToTop = scrollPosition + HEADER_HEIGHT - element.offsetTop;

      const newElementOffset = distanceToTop > 0
        ? Math.abs(distanceToTop)
        : 0;
      elementOffsets[i] = newElementOffset;

      const nextElement = elements[i + 1];

      if (nextElement) {
        const currentElementHeight = Math.round(element.getBoundingClientRect().height);
        const distanceToNext = Math.max((nextElement.offsetTop - elementOffsets[i + 1]) - element.offsetTop - newElementOffset, 0);

        const visiblePercentage = Math.min(Math.abs(distanceToNext / currentElementHeight), 1);

        const scale = 0.1 * visiblePercentage + 0.9;
        elementScales[i] = scale;

        const opacity = visiblePercentage;
        opacities[i] = opacity;

        if (visiblePercentage < 1) {
          activeIndex = i + 1;
        } else if (i === 0) {
          activeIndex = 0;
        }
      }
    }
  }
  onMount(handleScroll);

  let hoveringOverIndex = -1;
</script>

<svelte:window on:scroll={handleScroll} />

<div class="usecases mobile-only">
  {#each usecaseCards as config, index}
  <div class="card" bind:this={elements[index]} style:opacity="{opacities[index]}" style:transform="translateY({elementOffsets[index]}px) scale({elementScales[index]})">
    <UsecaseCard padHeight autoActive={!mobile} active={activeIndex === index} icon={config.icon}>
      <svelte:fragment slot="headline">{config.headline}</svelte:fragment>
      <svelte:fragment slot="description">
        {config.description}
      </svelte:fragment>
      <svelte:fragment slot="illustration" let:active>
        <UsecaseIllustration {active} {config} />
      </svelte:fragment>
    </UsecaseCard>
  </div>
  {/each}
</div>

<div class="usecases-desktop">
  {#each usecaseCards.reverse() as config, index}
  <div class="card">
    <UsecaseCard tonedDown={hoveringOverIndex !== -1 && hoveringOverIndex !== index} on:mouseenter={() => hoveringOverIndex = index} on:mouseleave={() => hoveringOverIndex = -1} padHeight icon={config.icon}>
      <svelte:fragment slot="headline">{config.headline}</svelte:fragment>
      <svelte:fragment slot="description">
        {config.description}
      </svelte:fragment>
      <svelte:fragment slot="illustration" let:active>
        <UsecaseIllustration {active} {config} />
      </svelte:fragment>
    </UsecaseCard>
  </div>
  {/each}
</div>

<style>
  .usecases {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
  }

  .usecases-desktop {
    display: none;
  }

  @media (min-width: 768px) {
    .mobile-only {
      display: none;
    }

    .usecases-desktop {
      display: flex;
      flex-direction: row-reverse;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }
  }
</style>
