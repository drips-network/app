<script lang="ts" context="module">
  // TODO maybe something
</script>

<script lang="ts">
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Section from '../section/section.svelte';

  export let collapsed = false;
  export let collapsable = false;

  let error = false;
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Trophy,
    label: 'Stats',
  }}
  skeleton={{
    loaded: true,
    empty: false,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No Stats',
    emptyStateText: 'We couldn’t find any stats for you.',
  }}
>
  <div class="stats">
    <slot />
  </div>
</Section>

<style>
  .stats {
    overflow: scroll;
    gap: 1.5rem;
    display: flex;
  }
</style>
