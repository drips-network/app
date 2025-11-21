<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (line-items to line_items) making the component unusable -->
<script lang="ts">
  import Button from '../button/button.svelte';
  import ArrowBoxUpRight from '../icons/ArrowBoxUpRight.svelte';

  interface Props {
    reverse?: boolean;
    illustrationPadding?: string | undefined;
    illustrationScale?: string | undefined;
    button?:
      | {
          text: string;
          href: string;
        }
      | undefined;
    illustration?: import('svelte').Snippet;
    headline?: import('svelte').Snippet;
    description?: import('svelte').Snippet;
    line_items?: import('svelte').Snippet;
  }

  let {
    reverse = false,
    illustrationPadding = undefined,
    illustrationScale = undefined,
    button = undefined,
    illustration,
    headline,
    description,
    line_items,
  }: Props = $props();
</script>

<div class="solution-card" class:reverse>
  <div
    style:padding={illustrationPadding}
    class="illustration"
    style:--illustration-scale={illustrationScale}
  >
    {@render illustration?.()}
  </div>
  <div class="content">
    <div class="inner">
      <h2>{@render headline?.()}</h2>
      {#if description}
        <p>{@render description?.()}</p>
      {/if}
      <div class="line-items">
        {@render line_items?.()}
      </div>
      {#if button}
        <div>
          <Button icon={ArrowBoxUpRight} href={button.href} target="_blank">{button.text}</Button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .solution-card {
    background-color: var(--color-background);
    width: 100%;
    display: flex;
    margin-top: 2rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 2rem 0 2rem 2rem;
    gap: 1rem;
  }

  .solution-card.reverse {
    flex-direction: row-reverse;
  }

  .solution-card > * {
    flex: 1;
  }

  .illustration {
    position: relative;
    height: 10000px; /* Stupid hack because Safari is being Safari */
    max-height: 30rem;
    margin-top: -2rem;
    margin-bottom: -2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: scale(var(--illustration-scale, 1));
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .content .inner {
    max-width: 600px;
    height: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
  }

  h2 {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  @media (max-width: 882px) {
    .solution-card {
      flex-direction: column;
      margin-top: 3rem;
      margin-bottom: 0;
    }

    .solution-card.reverse {
      flex-direction: column;
    }

    .illustration {
      flex-basis: 20rem;
      display: flex;
      width: calc(100% - 1rem);
      max-height: 20rem;
      margin: 0 auto;
      margin-top: -3rem;
      margin-bottom: 1rem;
      transform: none;
    }
  }
</style>
