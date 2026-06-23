<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Ecosystem from '$lib/components/icons/Ecosystem.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import User from '$lib/components/icons/User.svelte';
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';

  let {
    title = 'Three ways to get involved',
    description,
  }: {
    title?: string;
    description?: string;
  } = $props();

  const audiences = [
    {
      icon: Ecosystem,
      kicker: 'For ecosystems',
      headline: 'Run a Wave Program',
      copy: 'Convert your ecosystem budget into a recurring cycle of merged PRs across approved repos.',
      cta: 'Talk to us',
      href: INBOUND_LEAD_FORM_URL,
      external: true,
    },
    {
      icon: Orgs,
      kicker: 'For maintainers',
      headline: 'Clear your backlog',
      copy: "Apply your Stellar repos to a Wave and let funded contributors ship the issues you've been sitting on.",
      cta: 'Read the maintainer docs',
      href: 'https://docs.drips.network/wave/maintainers/participating-in-a-wave',
      external: true,
    },
    {
      icon: User,
      kicker: 'For contributors',
      headline: 'Fix, merge, earn',
      copy: "Browse curated issues from top-tier ecosystems, merge PRs, and earn a share of every Wave's pool.",
      cta: 'Browse active Waves',
      href: '/wave',
      external: false,
    },
  ];
</script>

<div class="funnel">
  {#if title}
    <div class="header">
      <h2 class="pixelated">{title}</h2>
      {#if description}<p>{description}</p>{/if}
    </div>
  {/if}

  <div class="doors">
    {#each audiences as audience (audience.href)}
      {@const Icon = audience.icon}
      <div class="door">
        <div class="icon-wrap">
          <Icon style="width: 1.5rem; height: 1.5rem; fill: var(--color-primary)" />
        </div>
        <span class="kicker typo-text-small-bold">{audience.kicker}</span>
        <h3 class="typo-header-3">{audience.headline}</h3>
        <p class="copy">{audience.copy}</p>
        <div class="cta-row">
          <Button
            href={audience.href}
            target={audience.external ? '_blank' : undefined}
            rel={audience.external ? 'noopener noreferrer' : undefined}
            icon={ArrowRight}
          >
            {audience.cta}
          </Button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .funnel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding: 2rem 0;
  }

  .header {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .header h2 {
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.1;
  }

  .header p {
    color: var(--color-foreground-level-6);
  }

  .doors {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .door {
    background: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .icon-wrap {
    width: 3rem;
    height: 3rem;
    background: var(--color-primary-level-1);
    border-radius: 0.75rem 0 0.75rem 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .kicker {
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.75rem;
  }

  .copy {
    color: var(--color-foreground-level-6);
    flex: 1;
    margin-bottom: 1rem;
  }

  .cta-row {
    margin-top: auto;
    display: flex;
  }

  @media (max-width: 882px) {
    .doors {
      grid-template-columns: 1fr;
    }
  }
</style>
