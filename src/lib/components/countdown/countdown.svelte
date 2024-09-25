<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  const dispatch = createEventDispatcher<{ end: void }>();

  export let targetDate: Date;

  let interval: ReturnType<typeof setInterval>;

  $: timeLeft = targetDate.getTime() - Date.now();

  $: {
    if (timeLeft <= 0) {
      clearInterval(interval);
      timeLeft = 0;
    }
  }

  onMount(() => {
    interval = setInterval(() => {
      timeLeft = targetDate.getTime() - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        timeLeft = 0;
        dispatch('end');
      }
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{Math.floor(timeLeft / 1000 / 60 / 60 / 24)} day{Math.floor(timeLeft / 1000 / 60 / 60 / 24) === 1
  ? ''
  : 's'}, {Math.floor(timeLeft / 1000 / 60 / 60) % 24} hours,
{Math.floor(timeLeft / 1000 / 60) % 60} minutes, {Math.floor(timeLeft / 1000) % 60} seconds
