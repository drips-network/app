<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';

  let { data } = $props();

  const capabilities = $derived([
    ...(data.user.permissions?.includes('manageAttributionSources')
      ? [
          {
            name: 'Signup Sources',
            description: 'Manage signup attribution source codes for tracking referral origins.',
            href: '/wave/admin/signup-sources',
          },
        ]
      : []),
  ]);
</script>

<HeadMeta title="Admin | Wave" />

<div class="page">
  <Section
    header={{
      label: 'Admin',
    }}
    skeleton={{
      loaded: true,
      empty: capabilities.length === 0,
      emptyStateEmoji: '🔒',
      emptyStateHeadline: 'No admin capabilities',
      emptyStateText: "You don't have any admin permissions assigned to your account.",
    }}
  >
    <div class="capabilities">
      {#each capabilities as capability (capability.name)}
        <div class="capability-card">
          <div class="info">
            <h4 class="typo-text-bold">{capability.name}</h4>
            <p class="typo-text-small description">{capability.description}</p>
          </div>
          <Button size="small" href={capability.href}>Open</Button>
        </div>
      {/each}
    </div>
  </Section>
</div>

<style>
  .page {
    display: flex;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .capabilities {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .capability-card {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .capability-card:last-child {
    border-bottom: none;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .description {
    color: var(--color-foreground-level-5);
  }
</style>
