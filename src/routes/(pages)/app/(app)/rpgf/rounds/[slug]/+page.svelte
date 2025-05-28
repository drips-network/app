<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import RpgfApplicationsTable from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';
  import RpgfScheduleCard from '$lib/components/rpgf-schedule-card/rpgf-schedule-card.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import Section from '$lib/components/section/section.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { rpgfJwtStore } from '$lib/utils/rpgf/siwe';
  import { fade } from 'svelte/transition';
  import RpgfBaseLayout from '../../components/rpgf-base-layout.svelte';
  import RpgfCtaCard from '$lib/components/rpgf-cta-card/rpgf-cta-card.svelte';

  export let data;
  $: round = data.wrappedRound.round;
</script>

<RpgfBaseLayout>
  <svelte:fragment slot="sidebar">
    <RpgfCtaCard {round} />
    <RpgfScheduleCard schedule={round} />
  </svelte:fragment>

  <svelte:fragment slot="header">
    <TransitionedHeight transitionHeightChanges negativeMarginWhileCollapsed="-1rem">
      {#if !$rpgfJwtStore}
        <div transition:fade={{ duration: 300 }}>
          <AnnotationBox type="info">
            Sign in to Drips RPGF to view your own applications and other private data.
            <svelte:fragment slot="actions">
              <RpgfSiweButton />
            </svelte:fragment>
          </AnnotationBox>
        </div>
      {/if}
    </TransitionedHeight>
    <RpgfHeaderCard roundSlugOrDraftId={round.urlSlug} roundOrDraft={round} />
  </svelte:fragment>

  {#if round.description}
    <div style:padding="0 1rem">
      <ExpandableText>
        <Markdown content={round.description} />
      </ExpandableText>
    </div>
  {/if}

  <Section
    header={{
      label: 'Applications',
      icon: Ledger,
    }}
    skeleton={{
      empty: data.applications.length === 0,
      loaded: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No applications',
      emptyStateText: 'There are currently no approved applications for this round.',
    }}
  >
    <RpgfApplicationsTable roundSlug={round.urlSlug} applications={data.applications} />
  </Section>

  <Section
    header={{
      label: 'Results',
      icon: Trophy,
    }}
    skeleton={{
      empty: true,
      loaded: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No results',
      emptyStateText: 'After tallying, vote results will be shown here.',
    }}
  />
</RpgfBaseLayout>
