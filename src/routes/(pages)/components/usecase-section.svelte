<script lang="ts">
  import Splits from "$lib/components/icons/Splits.svelte";
  import FundDependenciesUsecase from "./usecase-illustrations/fund-dependencies-usecase.svelte";
  import UsecaseCard from "./usecase-card.svelte";
  import breakpointsStore from "$lib/stores/breakpoints/breakpoints.store";
  import { onMount } from "svelte";
  import DripList from "$lib/components/icons/DripList.svelte";
  import TokenStreams from "$lib/components/icons/TokenStreams.svelte";
  import Proposals from "$lib/components/icons/Proposals.svelte";

  const usecaseCards = [
    {
      headline: "Fund your dependencies",
      description: "Claim your project and pay it forward to the projects that you depend on.",
      icon: Splits,
      illustration: FundDependenciesUsecase,
    },
    {
      headline: "Run a RetroPGF round",
      description: "Distribute retroactive public goods funding easily.",
      icon: DripList,
      illustration: FundDependenciesUsecase,
    },
    {
      headline: "Programmable cashflow",
      description: "Set up flexible, on-chain payment streams that you can adjust anytime.",
      icon: TokenStreams,
      illustration: FundDependenciesUsecase,
    },
    {
      headline: "Fund entire ecosystems",
      description: "Support thousands of projects and people with a single stream or donation",
      icon: DripList,
      illustration: FundDependenciesUsecase,
    },
    {
      headline: "Start a hackathon",
      description: "Set up a hackathon that allows submissions and voting on recipients.",
      icon: Proposals,
      illustration: FundDependenciesUsecase,
    },
  ];

  onMount(breakpointsStore.attach);
  $: mobile = $breakpointsStore?.breakpoint === "mobile" || $breakpointsStore?.breakpoint === "tablet";
  $: {
    if (mobile) handleScroll();
  }

  let wrapperElement: HTMLDivElement;

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

<div class="usecases mobile-only" bind:this={wrapperElement}>
  {#each usecaseCards as { headline, description, icon, illustration }, index}
  <div class="card" bind:this={elements[index]} style:opacity="{opacities[index]}" style:transform="translateY({elementOffsets[index]}px) scale({elementScales[index]})">
    <UsecaseCard padHeight autoActive={!mobile} active={activeIndex === index} {icon}>
      <svelte:fragment slot="headline">{headline}</svelte:fragment>
      <svelte:fragment slot="description">
        {description}
      </svelte:fragment>
      <svelte:fragment slot="illustration" let:active>
        <svelte:component this={illustration} {active} />
      </svelte:fragment>
    </UsecaseCard>
  </div>
  {/each}
</div>

<div class="usecases-desktop">
  {#each usecaseCards.reverse() as { headline, description, icon, illustration }, index}
  <div class="card">
    <UsecaseCard tonedDown={hoveringOverIndex !== -1 && hoveringOverIndex !== index} on:mouseenter={() => hoveringOverIndex = index} on:mouseleave={() => hoveringOverIndex = -1} padHeight {icon}>
      <svelte:fragment slot="headline">{headline}</svelte:fragment>
      <svelte:fragment slot="description">
        {description}
      </svelte:fragment>
      <svelte:fragment slot="illustration" let:active>
        <svelte:component this={illustration} {active} />
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
