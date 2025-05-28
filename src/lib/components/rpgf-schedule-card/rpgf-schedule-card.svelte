<script lang="ts">
  import { onMount } from 'svelte';
  import ScheduleItem from './components/schedule-item.svelte';
  import { tweened } from 'svelte/motion';
  import { expoOut } from 'svelte/easing';
  import type { WrappedRoundPublic } from '$lib/utils/rpgf/schemas';

  export let schedule: Pick<
    WrappedRoundPublic['round'],
    | 'applicationPeriodStart'
    | 'applicationPeriodEnd'
    | 'votingPeriodStart'
    | 'votingPeriodEnd'
    | 'resultsPeriodStart'
  >;

  $: timeline = [
    { date: schedule.applicationPeriodStart, title: 'Registration' },
    { date: schedule.applicationPeriodEnd, title: 'Review' },
    { date: schedule.votingPeriodStart, title: 'Voting' },
    { date: schedule.votingPeriodEnd, title: 'Tallying' },
    { date: schedule.resultsPeriodStart, title: 'Distribution' },
  ];
  let activeItemIndex: number;
  $: {
    const nextItem = timeline.findIndex((item) => new Date(item.date) > now);
    if (nextItem === -1) {
      activeItemIndex = timeline.length - 1;
    } else {
      activeItemIndex = nextItem - 1;
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

<div class="rpgf-schedule-card">
  <h2 class="typo-header-5">Schedule</h2>
  <div class="items">
    {#if now < schedule.applicationPeriodStart}<div class="spacer" />{/if}
    {#each timeline as { title, date }, i}
      <ScheduleItem
        bind:elem={timeItems[i]}
        {title}
        {date}
        isActive={i === activeItemIndex}
        isDone={i < activeItemIndex}
        until={timeline[i + 1]?.date}
      />
    {/each}
    <div class="timeline" bind:this={timelineElem}>
      <div class="line" />
      <div
        class="circle"
        class:visible={updatedOnce}
        style:transform="translateY({$timelineCircleOffsetY}px)"
        bind:this={timelineCircle}
      />
    </div>
  </div>
</div>

<style>
  .rpgf-schedule-card {
    padding: 1rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--color-foreground-level-3);
    view-transition-name: rpgf-schedule-card;
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

  .circle {
    height: 1rem;
    width: 1rem;
    border: 2px solid var(--color-foreground);
    background-color: var(--color-primary);
    border-radius: 50%;
    position: absolute;
    transform: translateY(2px);
    left: calc(40% - 0.5rem);
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
    }
    50% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
  }
</style>
