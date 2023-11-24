<script lang="ts" context="module">
</script>

<script lang="ts">
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import SectionHeader from '../section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import type { Stream } from '$lib/stores/streams/types';
  import SupportItem from './components/support-item.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  export let type: 'project' | 'dripList';
  export let headline = 'Support';
  export let emptyStateHeadline = 'No supporters';
  export let emptyStateText = `This ${
    type === 'dripList' ? 'Drip List' : 'project'
  } doesnʼt have any supporters yet.`;

  export let infoTooltip: string | undefined = undefined;

  export let supportStreams: Stream[] = [];
</script>

<section class="app-section">
  <SectionHeader {infoTooltip} icon={Heart} label={headline} />
  <SectionSkeleton
    loaded={true}
    empty={false}
    emptyStateEmoji="🫧"
    {emptyStateHeadline}
    {emptyStateText}
  >
    <SupportItem
      icon={TokenStreams}
      title={{
        component: IdentityBadge,
        props: {
          address: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
        },
      }}
      subtitle="Hello"
      amount="there"
      subAmount="general kenobi"
    />
  </SectionSkeleton>
</section>
