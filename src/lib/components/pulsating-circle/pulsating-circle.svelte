<script lang="ts">
  export let visible: boolean = true;
  export let element: HTMLElement | null = null;
  export let pulseColor = 'var(--color-primary-level-2)';
</script>

<div style="--pulse-color: {pulseColor}" class="circle" class:visible bind:this={element} />

<style>
  .circle {
    height: 1rem;
    width: 1rem;
    border: 2px solid var(--color-foreground);
    background-color: var(--color-primary);
    border-radius: 50%;
    animation: pulsing 3s infinite;
    opacity: 0;
  }

  .circle.visible {
    opacity: 1;
    transition: opacity 0.5s;
  }

  @keyframes pulsing {
    0% {
      box-shadow: 0 0 0 0px var(--pulse-color);
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
