<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import File from '$lib/components/icons/File.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
  import PulsatingCircle from '$lib/components/pulsating-circle/pulsating-circle.svelte';
  import OrDivider from '$lib/components/rpgf-results-card/components/or-divider.svelte';
  import WaveAvatar from '$lib/components/wave/wave-avatar/wave-avatar.svelte';
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';
  import formatDate from '$lib/utils/format-date';
  import type { WaveCycleDto } from '$lib/utils/wave/types/wave';
  import FeatureCard from '../../app/(app)/components/feature-card.svelte';

  let { data } = $props();

  const now = new Date();
</script>

<div class="page">
  <FeatureCard imageUrl="/assets/blog-images/rpgf/rpgf-filecoin-launch.png">
    <div>
      <h2 style:margin-bottom="0.25rem">Introducing Drips Wave</h2>
      <p>
        With Drips Wave, open-source ecosystems run recurring one-week contribution sprints. During
        these Wave Cycles, contributors receive Points, for which they earn rewards.
      </p>
    </div>

    {#snippet actions()}
      <Button icon={File} href="https://docs.drips.network/wave" target="_blank"
        >Read the docs</Button
      >
      <Button icon={Wave} href={INBOUND_LEAD_FORM_URL} target="_blank">Run your own Wave</Button>
    {/snippet}
  </FeatureCard>

  <OrDivider text="Current waves" />

  {#each data.waves.data as wave (wave.id)}
    {@const nextCycle: WaveCycleDto | undefined = data.nextCycles[wave.id]}
    <a href="/wave/{wave.id}" class="wave-item">
      <WaveAvatar {wave} size={128} />

      <div class="details">
        {#if nextCycle}
          <div class="next-cycle-badge">
            {#if nextCycle.startDate > now}
              Next cycle starts {formatDate(nextCycle.startDate)}
            {:else if nextCycle.endDate > now}
              <PulsatingCircle />
              Active cycle until {formatDate(nextCycle.endDate, 'onlyDay')}
            {/if}
          </div>
        {/if}
        <h1>{wave.name} Wave</h1>
        <p style:color="var(--color-foreground-level-6)">{wave.description}</p>
      </div>
    </a>
  {/each}
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

  .wave-item {
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

  .wave-item:hover:not(:active),
  .wave-item:focus-visible {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  }

  .next-cycle-badge {
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
</style>
