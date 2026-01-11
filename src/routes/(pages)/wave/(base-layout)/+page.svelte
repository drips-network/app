<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Email from '$lib/components/icons/Email.svelte';
  import File from '$lib/components/icons/File.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
  import PulsatingCircle from '$lib/components/pulsating-circle/pulsating-circle.svelte';
  import OrDivider from '$lib/components/rpgf-results-card/components/or-divider.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import WaveAvatar from '$lib/components/wave/wave-program-avatar/wave-program-avatar.svelte';
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';
  import formatDate from '$lib/utils/format-date';
  import type { WaveDto } from '$lib/utils/wave/types/waveProgram';
  import FeatureCard from '../../app/(app)/components/feature-card.svelte';

  let { data } = $props();

  const now = new Date();
</script>

<HeadMeta title="Explore Wave Programs | Wave" canonical="https://www.drips.network/wave" />

<div class="page">
  <FeatureCard imageUrl="/assets/wave/wave-hp.png">
    <div>
      <h2 style:margin-bottom="0.25rem">Introducing Drips Wave</h2>
      <p>
        With Drips Wave, open-source ecosystems run recurring one-week contribution sprints. During
        these Waves, contributors receive Points, for which they earn rewards.
      </p>
    </div>

    {#snippet actions()}
      <Button icon={File} href="https://docs.drips.network/wave" target="_blank"
        >Read the docs</Button
      >
      <Button icon={Wave} href={INBOUND_LEAD_FORM_URL} target="_blank"
        >Run your own Wave Program</Button
      >
    {/snippet}
  </FeatureCard>

  <OrDivider text="Wave programs" />

  {#each data.wavePrograms.data as waveProgram (waveProgram.id)}
    {@const upcomingWave: WaveDto | null = data.upcomingWaves[waveProgram.id]}
    <a href="/wave/{waveProgram.slug}" class="wave-program-item">
      <WaveAvatar {waveProgram} size={128} />

      <div class="details">
        {#if upcomingWave}
          <div class="next-wave-badge">
            {#if upcomingWave.startDate > now}
              Next Wave starts {formatDate(upcomingWave.startDate, 'onlyDay')}
            {:else if upcomingWave.endDate > now}
              <PulsatingCircle />
              Active Wave until {formatDate(upcomingWave.endDate, 'onlyDay')}
            {/if}
          </div>
        {/if}
        <h1>{waveProgram.name}</h1>
        <p style:color="var(--color-foreground-level-6)">{waveProgram.description}</p>
      </div>

      <ChevronRight />
    </a>
  {/each}

  {#if data.wavePrograms.data.length === 0}
    <Card>
      <div class="empty typo-text">
        There are no active Wave Programs at the moment. Consider subscribing to our email
        newsletter and joining our Discord for announcements.

        <div class="actions">
          <Button icon={Email} href="/wave/newsletter">Subscribe to newsletter</Button>
          <Button icon={Discord} href="https://discord.gg/drips" target="_blank"
            >Join our Discord</Button
          >
        </div>
      </div>
    </Card>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
  }

  .empty {
    text-align: center;
    color: var(--color-foreground-level-6);
    display: flex;
    padding: 2rem 0;
    max-width: 40rem;
    margin: 0 auto;
    flex-direction: column;
    gap: 1rem;
  }

  .empty .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .wave-program-item {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    box-shadow: var(--elevation-low);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    flex-wrap: wrap;
  }

  .details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .wave-program-item:hover:not(:active),
  .wave-program-item:focus-visible {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  }

  .next-wave-badge {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
    padding: 0.25rem 0.75rem 0.25rem 0.5rem;
    border-radius: 2rem 0 2rem 2rem;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 600px) {
    .wave-program-item {
      justify-content: center;
      text-align: center;
      flex-direction: column;
    }

    .details {
      align-items: center;
    }
  }
</style>
