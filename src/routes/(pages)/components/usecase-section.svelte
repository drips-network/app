<script lang="ts">
  import Splits from '$lib/components/icons/Splits.svelte';
  import FundDependenciesUsecase from './usecase-illustrations/fund-dependencies-usecase.svelte';
  import UsecaseCard from './usecase-card.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import RetropgfUsecase from './usecase-illustrations/retropgf-usecase.svelte';
  import UsecaseIllustration, {
    type UsecaseIllustrationConfig,
  } from './usecase-illustrations/usecase-illustration.svelte';
  import StreamUsecase from './usecase-illustrations/stream-usecase.svelte';
  import EcosystemUsecase from './usecase-illustrations/ecosystem-usecase.svelte';
  import HackathonUsecase from './usecase-illustrations/hackathon-usecase.svelte';

  const usecaseCards: UsecaseIllustrationConfig[] = [
    {
      headline: 'Fund your dependencies',
      href: '/solutions/dependency-funding',
      description: 'Claim your project and pay it forward to the projects that you depend on.',
      icon: Splits,
      sparkles: [
        {
          x: '-20px',
          y: '60px',
          delay: 50,
        },
        {
          x: '160px',
          y: '30px',
          delay: 100,
        },
      ],
      illustration: FundDependenciesUsecase,
    },
    {
      headline: 'Run a RetroPGF round',
      href: '/solutions/retro-pgf',
      description: 'Distribute retroactive public goods funding easily.',
      icon: DripList,
      sparkles: [
        {
          x: '-20px',
          y: '60px',
          delay: 50,
        },
        {
          x: '220px',
          y: '30px',
          delay: 100,
        },
        {
          x: '180px',
          y: '170px',
          delay: 150,
        },
      ],
      illustration: RetropgfUsecase,
    },
    {
      headline: 'Programmable cashflow',
      href: '/solutions/programmable-cashflow',
      description: 'Set up flexible, on-chain payment streams that you can adjust anytime.',
      icon: TokenStreams,
      sparkles: [],
      illustration: StreamUsecase,
    },
    {
      headline: 'Fund entire ecosystems',
      href: '/solutions/ecosystem-funding',
      description: 'Support thousands of projects and people with a single stream or donation',
      icon: DripList,
      sparkles: [],
      illustration: EcosystemUsecase,
      illustrationOffset: {
        x: '-25px',
        y: '-10px',
      },
    },
    {
      headline: 'Start a hackathon',
      href: '/solutions/hackathons',
      description: 'Set up a hackathon that allows submissions and voting on recipients.',
      icon: Proposals,
      sparkles: [
        {
          x: '-20px',
          y: '20px',
          delay: 50,
        },
        {
          x: '160px',
          y: '100px',
          delay: 100,
        },
      ],
      illustration: HackathonUsecase,
      illustrationOffset: {
        x: '-30px',
        y: '0',
      },
    },
  ];

  let hoveringOverIndex = -1;
</script>

<div class="usecases">
  {#each usecaseCards.reverse() as config, index}
    <div class="card">
      <UsecaseCard
        href={config.href}
        tonedDown={hoveringOverIndex !== -1 && hoveringOverIndex !== index}
        on:mouseenter={() => (hoveringOverIndex = index)}
        on:mouseleave={() => (hoveringOverIndex = -1)}
        padHeight
        icon={config.icon}
      >
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
    flex-direction: row-reverse;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
</style>
