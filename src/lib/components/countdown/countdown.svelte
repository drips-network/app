<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  export let targetDate: Date;

  let interval: ReturnType<typeof setInterval>;

  $: timeLeft = targetDate.getTime() - Date.now();

  $: {
    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }

  onMount(() => {
    interval = setInterval(() => {
      timeLeft = targetDate.getTime() - Date.now();
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
