<script lang="ts">
  import { onMount } from 'svelte';
  import ScheduleItem from './components/schedule-item.svelte';
  import { tweened } from 'svelte/motion';
  import { expoOut } from 'svelte/easing';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { browser } from '$app/environment';

  export let round: Round;

  $: schedule =
    (round.applicationPeriodStart &&
      round.applicationPeriodEnd &&
      round.votingPeriodStart &&
      round.votingPeriodEnd &&
      round.resultsPeriodStart && {
        applicationPeriodStart: new Date(round.applicationPeriodStart),
        applicationPeriodEnd: new Date(round.applicationPeriodEnd),
        votingPeriodStart: new Date(round.votingPeriodStart),
        votingPeriodEnd: new Date(round.votingPeriodEnd),
        resultsPeriodStart: new Date(round.resultsPeriodStart),
      }) ||
    null;

  $: timeline = schedule
    ? [
        { date: schedule.applicationPeriodStart, title: 'Registration' },
        { date: schedule.applicationPeriodEnd, title: 'Review' },
        { date: schedule.votingPeriodStart, title: 'Voting' },
        { date: schedule.votingPeriodEnd, title: 'Tallying' },
        { date: schedule.resultsPeriodStart, title: 'Distribution' },
      ]
    : null;

  let activeItemIndex: number;
  $: {
    if (!timeline) {
      activeItemIndex = -1;
    } else {
      const nextItem = timeline.findIndex((item) => new Date(item.date) > now);
      if (nextItem === -1) {
        activeItemIndex = timeline.length - 1;
      } else {
        activeItemIndex = nextItem - 1;
      }
    }
  }

  let updatedOnce = false;
  let now = new Date();
  let updateInterval: NodeJS.Timeout;
  onMount(() => {
    updatedOnce = false;

    updateInterval = setInterval(() => {
      now = new Date();
    }, 1000);

    return () => {
      clearInterval(updateInterval);
    };
  });

  let timeItems: HTMLTimeElement[] = [];
  let timelineElem: HTMLDivElement;
  let timelineCircle: HTMLDivElement;
  let timelineCircleOffsetY = tweened(0, {
    duration: 1500,
    easing: expoOut,
  });

  function updateTimeline() {
    updatedOnce = true;

    const activeItem = timeItems[activeItemIndex];
    if (!activeItem) {
      return;
    }

    const activeItemTop = activeItem.getBoundingClientRect().top;
    const timelineTop = timelineElem.getBoundingClientRect().top;
    const offsetY = activeItemTop - timelineTop + 2;
    timelineCircleOffsetY.set(offsetY);
  }
  $: {
    now;
    updateTimeline();
  }
</script>

{#if timeline && schedule && browser}
  <div class="rpgf-schedule-card">
    <div
      style:display="flex"
      style:justify-content="space-between"
      style:flex-wrap="wrap"
      style:gap="0.5rem"
    >
      <h2 class="typo-header-5">Schedule</h2>
      <div class="timezone-badge typo-text-small">
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </div>
    </div>
    <div class="items">
      {#if now < schedule.applicationPeriodStart}<div class="spacer" />{/if}
      {#each timeline as { title, date }, i}
        <ScheduleItem
          bind:elem={timeItems[i]}
          {title}
          {date}
          isActive={i === activeItemIndex}
          expanded={i === activeItemIndex}
          isDone={i < activeItemIndex}
          until={timeline[i + 1]?.date}
          onExpandChange={() => updateTimeline()}
          fuzzy={title === 'Distribution'}
        >
          {#if title === 'Registration'}
            Anyone can submit applications.
          {:else if title === 'Review'}
            Applications are closed and admins are reviewing the submitted applications.
          {:else if title === 'Voting'}
            Designated voters can cast their votes for the applications they want to fund.
          {:else if title === 'Tallying'}
            The votes are being tallied and the results prepared. Round admins will publish the
            results once ready.
          {:else if title === 'Distribution'}
            From this date onwards, rewards are being distributed to the selected applicants
            according to the round results.
          {/if}
        </ScheduleItem>
      {/each}
      <div class="timeline" bind:this={timelineElem}>
        <div class="line" />
        <div class="circle-wrapper" style:transform="translateY({$timelineCircleOffsetY}px)">
          <div class="circle" class:visible={updatedOnce} bind:this={timelineCircle} />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .rpgf-schedule-card {
    padding: 1rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--color-foreground-level-3);
    view-transition-name: rpgf-schedule-card;
    view-transition-class: element-handover;
  }

  .timezone-badge {
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-5);
    padding: 0 0.5rem;
    border-radius: 0.5rem;
    height: 20px;
    display: flex;
    align-items: center;
  }

  .items {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-left: 2rem;
  }

  .timeline {
    position: absolute;
    left: -2rem;
    top: 0;
    width: 2rem;
    height: 100%;
  }

  .timeline .line {
    position: absolute;
    left: 40%;
    top: 10px;
    width: 2px;
    bottom: 40px;
    background-color: var(--color-foreground-level-3);
    transform: translateX(-50%);
    border-radius: 1px;
  }

  .spacer {
    height: 1rem;
  }

  .circle-wrapper {
    transform: translateY(2px);
  }

  .circle {
    height: 1rem;
    width: 1rem;
    border: 2px solid var(--color-foreground);
    background-color: var(--color-primary);
    border-radius: 50%;
    position: absolute;
    left: calc(40% - 0.5rem);
    transform-origin: center;
    animation: pulsing 3s infinite;
    opacity: 0;
  }

  .circle.visible {
    opacity: 1;
    transition: opacity 0.5s;
  }

  @keyframes pulsing {
    0% {
      box-shadow: 0 0 0 0px var(--color-primary-level-2);
      transform: scale(1);
    }
    10% {
      transform: scale(0.8);
    }
    20% {
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
  }
</style>
