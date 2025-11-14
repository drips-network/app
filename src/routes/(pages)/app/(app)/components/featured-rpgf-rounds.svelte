<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import RpgfRoundGrid from './rpgf-round-grid.svelte';

  interface Props {
    rounds: Round[];
  }

  let { rounds }: Props = $props();
</script>

{#if rounds.length > 0}
  <Section
    header={{
      icon: ArrowCounterClockwiseHeart,
      label: 'Featured RetroPGF rounds',
      actions: [
        {
          label: 'See all rounds',
          href: '/app/rpgf',
          icon: ArrowCounterClockwiseHeart,
        },
      ],
    }}
    skeleton={{ loaded: true }}
  >
    <RpgfRoundGrid {rounds} />
  </Section>
{/if}
