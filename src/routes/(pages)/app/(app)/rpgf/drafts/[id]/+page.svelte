<script lang="ts">
  import { page } from '$app/stores';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import RpgfDraftTodoCard from '$lib/components/rpgf-draft-todo-card/rpgf-draft-todo-card.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';
  import RpgfScheduleCard from '$lib/components/rpgf-schedule-card/rpgf-schedule-card.svelte';
  import Section from '$lib/components/section/section.svelte';
  import type { ComponentProps } from 'svelte';
  import RpgfBaseLayout from '../../components/rpgf-base-layout.svelte';

  export let data;
  $: draft = data.wrappedDraft.draft;

  function isScheduleComplete(
    schedule: Partial<ComponentProps<RpgfScheduleCard>['schedule']>,
  ): schedule is Required<ComponentProps<RpgfScheduleCard>['schedule']> {
    return Boolean(
      schedule.applicationPeriodStart &&
        schedule.applicationPeriodEnd &&
        schedule.votingPeriodStart &&
        schedule.votingPeriodEnd &&
        schedule.resultsPeriodStart,
    );
  }

  let schedule: ComponentProps<RpgfScheduleCard>['schedule'];
  $: {
    const scheduleFields = {
      applicationPeriodStart: draft.applicationPeriodStart,
      applicationPeriodEnd: draft.applicationPeriodEnd,
      votingPeriodStart: draft.votingPeriodStart,
      votingPeriodEnd: draft.votingPeriodEnd,
      resultsPeriodStart: draft.resultsPeriodStart,
    };

    if (isScheduleComplete(scheduleFields)) {
      schedule = scheduleFields;
    }
  }
</script>

<RpgfBaseLayout>
  <svelte:fragment slot="sidebar">
    <RpgfDraftTodoCard draftWrapper={data.wrappedDraft} />
    {#if schedule}
      <RpgfScheduleCard {schedule} />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="header">
    <RpgfHeaderCard roundSlugOrDraftId={$page.params.id} isDraft roundOrDraft={draft} />
  </svelte:fragment>

  {#if draft.description}
    <div style:padding="0 1rem">
      <ExpandableText>
        <Markdown content={draft.description} />
      </ExpandableText>
    </div>
  {/if}

  <Section
    header={{
      label: 'Applications',
      icon: Ledger,
    }}
    skeleton={{
      empty: true,
      loaded: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No applications',
      emptyStateText:
        'Anyone will be able to submit their applications during the application period.',
    }}
  />

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

  <Section
    header={{
      label: 'Distribution',
      icon: DripList,
    }}
    skeleton={{
      empty: true,
      loaded: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No Drip Lists',
      emptyStateText:
        'Once you create one or more Drip Lists to distribute funds for this round, they will be shown here.',
    }}
  />
</RpgfBaseLayout>
