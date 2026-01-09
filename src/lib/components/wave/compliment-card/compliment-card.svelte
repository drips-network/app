<script lang="ts">
  import type { Component } from 'svelte';
  import Card from '../card/card.svelte';

  interface Props {
    title: string;
    count?: number;
    points?: number;
    illustration: Component;
  }

  let { title, count, points, illustration: Illustration }: Props = $props();
</script>

<Card
  style="background-color: {count === 0
    ? 'var(--color-foreground-level-1)'
    : 'var(--color-primary-level-1)'}; color: var(--color-primary-level-6); opacity: {count === 0
    ? 0.5
    : 1};"
>
  <div class="compliment-card">
    <div class="illustration">
      <Illustration />
    </div>
    <h3 class="typo-text-bold">{title}</h3>
    {#if count !== undefined}
      <div class="number-badge">
        <p class="typo-text-bold">{count}x</p>
      </div>
    {/if}
    {#if points !== undefined}
      <div class="number-badge">
        <p class="typo-text-bold">{points} Points</p>
      </div>
    {/if}
  </div>
</Card>

<style>
  .compliment-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    height: 100%;
    text-align: center;
  }

  .compliment-card h3 {
    margin-bottom: auto;
  }

  .compliment-card .illustration {
    width: 100%;
    max-height: 150px;
    max-width: 150px;
    height: 100%;
    padding: 1rem;
  }

  .number-badge {
    background-color: var(--color-primary-level-2);
    height: 2rem;
    padding: 0 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
