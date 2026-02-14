<script lang="ts">
  import { tick } from 'svelte';
  import Confetti from 'svelte-confetti';

  interface Props {
    value: number;
    onchange: (value: number) => void;
    disabled?: boolean;
  }

  let { value, onchange, disabled = false }: Props = $props();

  let debouncedHoverValue = $state<number | null>(null);
  let debounceTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let confettiStar = $state<number | null>(null);

  let isHovering = $derived(debouncedHoverValue !== null);
  let displayValue = $derived(debouncedHoverValue ?? value);

  function setHover(star: number) {
    if (disabled) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debouncedHoverValue = star;
  }

  function clearHover() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedHoverValue = null;
      debounceTimer = null;
    }, 100);
  }

  async function handleClick(star: number) {
    onchange(star);

    if (star >= 4) {
      confettiStar = null;
      await tick();
      confettiStar = star;
    }
  }
</script>

<div
  class="star-rating"
  class:disabled
  class:hovering={isHovering}
  class:has-value={value > 0}
  role="radiogroup"
  aria-label="Rating"
  onmouseleave={clearHover}
>
  {#each [1, 2, 3, 4, 5] as star (star)}
    <button
      type="button"
      class="star"
      class:filled={star <= displayValue}
      class:locked-in={star <= value}
      class:hover-only={isHovering && star <= displayValue && star > value}
      {disabled}
      aria-label="{star} star{star !== 1 ? 's' : ''}"
      aria-checked={star === value}
      role="radio"
      onmouseenter={() => setHover(star)}
      onclick={() => handleClick(star)}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {#if star <= displayValue}
          <path
            d="M12 2L14.9 8.6L22.1 9.2L16.8 13.8L18.5 20.8L12 16.9L5.5 20.8L7.2 13.8L1.9 9.2L9.1 8.6L12 2Z"
            fill="currentColor"
          />
        {:else}
          <path
            d="M12 2L14.9 8.6L22.1 9.2L16.8 13.8L18.5 20.8L12 16.9L5.5 20.8L7.2 13.8L1.9 9.2L9.1 8.6L12 2Z"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
          />
        {/if}
      </svg>
      {#if confettiStar === star}
        <div class="confetti">
          <Confetti
            x={[-0.15, 0.15]}
            y={[-0.15, 0.15]}
            amount={30}
            fallDistance="15px"
            duration={1200}
            size={4}
            colorArray={['var(--color-caution-level-6)', '#FFD700', '#FFA500']}
          />
        </div>
      {/if}
    </button>
  {/each}
</div>

<style>
  .star-rating {
    display: flex;
    gap: 0.25rem;
  }

  .star {
    all: unset;
    cursor: pointer;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-foreground-level-4);
    transition:
      color 0.15s ease,
      transform 0.15s ease,
      opacity 0.15s ease;
    position: relative;
  }

  .star:hover:not(:disabled) {
    transform: scale(1.15);
  }

  .star.filled {
    color: var(--color-caution-level-6);
  }

  /* Hover-only stars (beyond locked-in value) are slightly dimmed */
  .star.hover-only {
    opacity: 0.6;
  }

  .star-rating.disabled .star {
    cursor: default;
    opacity: 0.5;
  }

  .star svg {
    width: 100%;
    height: 100%;
  }

  .confetti {
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
  }
</style>
